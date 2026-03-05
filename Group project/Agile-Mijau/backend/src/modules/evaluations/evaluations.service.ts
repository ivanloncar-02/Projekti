import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyMentorEvaluation } from './entities/company-mentor-evaluation.entity';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { CreateCompanyEvaluationDto } from './dto/create-company-evaluation.dto';
import { Internship } from '../internships/entities/internship.entity';
import { CompanyMentor } from '../mentors/entities/company-mentor.entity';
import { Application } from '../applications/entities/application.entity';
import { InternshipStatus } from '../../common/enums/internship-status.enum';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectRepository(CompanyMentorEvaluation)
    private evaluationsRepository: Repository<CompanyMentorEvaluation>,
    @InjectRepository(Internship)
    private internshipsRepository: Repository<Internship>,
    @InjectRepository(CompanyMentor)
    private companyMentorsRepository: Repository<CompanyMentor>,
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
  ) {}

  async create(
    createEvaluationDto: CreateEvaluationDto,
  ): Promise<CompanyMentorEvaluation> {
    // Verify internship exists and is in correct status
    const internship = await this.internshipsRepository.findOne({
      where: { id: createEvaluationDto.internshipId },
    });

    if (!internship) {
      throw new NotFoundException('Internship not found');
    }

    // Only allow evaluation for ACTIVE or COMPLETED internships
    if (
      ![InternshipStatus.ACTIVE, InternshipStatus.COMPLETED].includes(
        internship.status,
      )
    ) {
      throw new BadRequestException(
        'Can only evaluate ACTIVE or COMPLETED internships',
      );
    }

    // Check if evaluation already exists
    const existingEvaluation = await this.evaluationsRepository.findOne({
      where: { internshipId: createEvaluationDto.internshipId },
    });

    if (existingEvaluation) {
      throw new BadRequestException(
        'Evaluation for this internship already exists',
      );
    }

    const evaluation = this.evaluationsRepository.create(createEvaluationDto);
    return await this.evaluationsRepository.save(evaluation);
  }

  async findByInternship(
    internshipId: string,
  ): Promise<CompanyMentorEvaluation | null> {
    const evaluation = await this.evaluationsRepository.findOne({
      where: { internshipId },
      relations: ['mentor', 'internship'],
    });

    return evaluation;
  }

  async checkCompanyEvaluationCompleted(
    internshipId: string,
  ): Promise<boolean> {
    // Just check if any evaluation exists - evaluations are always locked once submitted
    const evaluation = await this.evaluationsRepository.findOne({
      where: { internshipId },
    });

    return !!evaluation;
  }

  async findOne(id: string): Promise<CompanyMentorEvaluation> {
    const evaluation = await this.evaluationsRepository.findOne({
      where: { id },
      relations: ['mentor', 'internship'],
    });

    if (!evaluation) {
      throw new NotFoundException('Evaluation not found');
    }

    return evaluation;
  }

  async submitCompanyEvaluation(
    internshipId: string,
    mentorUserId: string,
    dto: CreateCompanyEvaluationDto,
  ): Promise<CompanyMentorEvaluation> {
    // Find internship with company relation
    const internship = await this.internshipsRepository.findOne({
      where: { id: internshipId },
      relations: ['company'],
    });

    if (!internship) {
      throw new NotFoundException('Internship not found');
    }

    // Verify user is company mentor
    const companyMentor = await this.companyMentorsRepository.findOne({
      where: { userId: mentorUserId },
    });

    if (!companyMentor) {
      throw new ForbiddenException(
        'Only company mentors can submit evaluations',
      );
    }

    // Verify mentor is from the same company as the internship
    if (companyMentor.companyId !== internship.companyId) {
      throw new ForbiddenException(
        'You can only evaluate internships from your company',
      );
    }

    // Check if evaluation already exists and is locked
    const existingEvaluation = await this.evaluationsRepository.findOne({
      where: { internshipId },
    });

    if (existingEvaluation && existingEvaluation.isLocked) {
      throw new BadRequestException(
        'Evaluation for this internship is already submitted and locked',
      );
    }

    // Create evaluation with isLocked = true
    const evaluation = this.evaluationsRepository.create({
      internshipId,
      mentorId: companyMentor.id,
      rating: dto.rating,
      technicalSkills: dto.technicalSkills,
      communication: dto.communication,
      workEthic: dto.workEthic,
      overallPerformance: dto.overallPerformance,
      recommendations: dto.recommendations,
      isLocked: true,
    });

    const savedEvaluation = await this.evaluationsRepository.save(evaluation);

    // Mark internship as COMPLETED when company mentor submits evaluation
    internship.status = InternshipStatus.COMPLETED;
    await this.internshipsRepository.save(internship);

    return savedEvaluation;
  }

  async verifyStudentAccess(
    internshipId: string,
    studentId: string,
  ): Promise<boolean> {
    // Check if student has an approved application for this internship
    const application = await this.applicationsRepository.findOne({
      where: {
        internshipId,
        studentId,
        status: ApplicationStatus.APPROVED,
      },
    });
    return !!application;
  }

  async deleteByInternship(
    internshipId: string,
    userId: string,
    role: UserRole,
  ): Promise<void> {
    const evaluation = await this.evaluationsRepository.findOne({
      where: { internshipId },
      relations: ['internship'],
    });

    if (!evaluation) {
      throw new NotFoundException('Evaluacija nije pronađena');
    }

    // Company mentors can only delete evaluations for their own company's internships
    if (role === UserRole.COMPANY_MENTOR) {
      const companyMentor = await this.companyMentorsRepository.findOne({
        where: { userId },
      });

      if (!companyMentor) {
        throw new ForbiddenException('Mentor iz tvrtke nije pronađen');
      }

      if (evaluation.internship.companyId !== companyMentor.companyId) {
        throw new ForbiddenException(
          'Možete brisati samo evaluacije za prakse vaše tvrtke',
        );
      }
    }

    await this.evaluationsRepository.remove(evaluation);
  }
}
