import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './entities/goal.entity';
import { AcademicMentor } from '../mentors/entities/academic-mentor.entity';
import { CompanyMentor } from '../mentors/entities/company-mentor.entity';
import { Student } from '../students/entities/student.entity';
import { Application } from '../applications/entities/application.entity';
import { Internship } from '../internships/entities/internship.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
import { InternshipStatus } from '../../common/enums/internship-status.enum';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private goalsRepository: Repository<Goal>,
    @InjectRepository(AcademicMentor)
    private academicMentorsRepository: Repository<AcademicMentor>,
    @InjectRepository(CompanyMentor)
    private companyMentorsRepository: Repository<CompanyMentor>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(Internship)
    private internshipsRepository: Repository<Internship>,
  ) {}

  async create(studentId: string, createGoalDto: CreateGoalDto): Promise<Goal> {
    // Check if internship is still active
    if (createGoalDto.internshipId) {
      const internship = await this.internshipsRepository.findOne({
        where: { id: createGoalDto.internshipId },
      });

      if (!internship) {
        throw new NotFoundException('Praksa nije pronađena');
      }

      if ([InternshipStatus.COMPLETED, InternshipStatus.GRADED].includes(internship.status)) {
        throw new BadRequestException('Ne možete dodavati ciljeve za završenu ili ocijenjenu praksu');
      }
    }

    const goal = this.goalsRepository.create({
      ...createGoalDto,
      studentId,
    });

    return await this.goalsRepository.save(goal);
  }

  async findAll(
    studentId?: string,
    internshipId?: string,
    userId?: string,
    role?: UserRole,
  ): Promise<Goal[]> {
    // Authorization check for academic mentors
    if (role === UserRole.ACADEMIC_MENTOR && userId && studentId) {
      await this.verifyAcademicMentorAccessToStudent(studentId, userId);
    }

    // Authorization check for company mentors
    if (role === UserRole.COMPANY_MENTOR && userId && internshipId) {
      await this.verifyCompanyMentorAccessToInternship(internshipId, userId);
    }

    const queryBuilder = this.goalsRepository
      .createQueryBuilder('goal');

    if (studentId) {
      queryBuilder.where('goal.studentId = :studentId', { studentId });
    }

    if (internshipId) {
      queryBuilder.andWhere('goal.internshipId = :internshipId', {
        internshipId,
      });
    }

    const goals = await queryBuilder
      .orderBy('goal.createdAt', 'DESC')
      .getMany();

    // Task 7: Always return array, never null
    return goals || [];
  }

  private async verifyAcademicMentorAccessToStudent(
    studentId: string,
    userId: string,
  ): Promise<void> {
    // Find the academic mentor by userId
    const academicMentor = await this.academicMentorsRepository.findOne({
      where: { userId },
    });

    if (!academicMentor) {
      throw new ForbiddenException('Academic mentor not found');
    }

    // Find the student
    const student = await this.studentsRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check if the student is assigned to this academic mentor
    if (student.academicMentorId !== academicMentor.id) {
      throw new ForbiddenException(
        'You can only view goals for students assigned to you',
      );
    }
  }

  private async verifyCompanyMentorAccessToInternship(
    internshipId: string,
    userId: string,
  ): Promise<void> {
    // Find the company mentor by userId
    const companyMentor = await this.companyMentorsRepository.findOne({
      where: { userId },
    });

    if (!companyMentor) {
      throw new ForbiddenException('Mentor iz tvrtke nije pronađen');
    }

    // Find the approved application for this internship
    const application = await this.applicationsRepository.findOne({
      where: {
        internshipId,
        status: ApplicationStatus.APPROVED,
      },
      relations: ['internship'],
    });

    if (!application || !application.internship) {
      throw new NotFoundException('Nema odobrene prijave za ovu praksu');
    }

    // Check if the internship belongs to the mentor's company
    if (application.internship.companyId !== companyMentor.companyId) {
      throw new ForbiddenException(
        'Možete postavljati ciljeve samo za prakse vaše tvrtke',
      );
    }
  }

  async createForStudent(
    internshipId: string,
    userId: string,
    createGoalDto: CreateGoalDto,
  ): Promise<Goal> {
    // Verify company mentor has access to this internship
    await this.verifyCompanyMentorAccessToInternship(internshipId, userId);

    // Find the student from the approved application
    const application = await this.applicationsRepository.findOne({
      where: {
        internshipId,
        status: ApplicationStatus.APPROVED,
      },
    });

    if (!application) {
      throw new NotFoundException('Nema odobrene prijave za ovu praksu');
    }

    const goal = this.goalsRepository.create({
      ...createGoalDto,
      studentId: application.studentId,
      internshipId,
    });

    return await this.goalsRepository.save(goal);
  }

  async findOne(id: string): Promise<Goal> {
    const goal = await this.goalsRepository.findOne({
      where: { id },
      relations: ['student', 'internship'],
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return goal;
  }

  async complete(id: string, studentId: string): Promise<Goal> {
    const goal = await this.findOne(id);

    // Verify the student owns this goal
    if (goal.studentId !== studentId) {
      throw new ForbiddenException('You can only complete your own goals');
    }

    goal.completed = true;
    goal.completedAt = new Date();

    return await this.goalsRepository.save(goal);
  }

  async verifyOwnership(goalId: string, studentId: string): Promise<boolean> {
    const goal = await this.goalsRepository.findOne({
      where: { id: goalId, studentId },
    });

    return !!goal;
  }
}
