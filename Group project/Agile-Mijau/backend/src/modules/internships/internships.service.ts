import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Internship } from './entities/internship.entity';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';
import { FilterInternshipsDto } from './dto/filter-internships.dto';
import { InternshipStatus } from '../../common/enums/internship-status.enum';
import { Company, CompanyStatus } from '../companies/entities/company.entity';
import { AcademicMentor } from '../mentors/entities/academic-mentor.entity';
import { Application } from '../applications/entities/application.entity';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
import { CompanyMentorEvaluation } from '../evaluations/entities/company-mentor-evaluation.entity';

@Injectable()
export class InternshipsService {
  constructor(
    @InjectRepository(Internship)
    private internshipsRepository: Repository<Internship>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(AcademicMentor)
    private academicMentorsRepository: Repository<AcademicMentor>,
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(CompanyMentorEvaluation)
    private evaluationsRepository: Repository<CompanyMentorEvaluation>,
  ) {}

  async create(createInternshipDto: CreateInternshipDto): Promise<Internship> {
    // Check if company exists and is not archived
    const company = await this.companiesRepository.findOne({
      where: { id: createInternshipDto.companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.status === CompanyStatus.ARCHIVED) {
      throw new BadRequestException('Cannot create offers for archived companies');
    }

    // Validate dates
    const startDate = new Date(createInternshipDto.startDate);
    const endDate = new Date(createInternshipDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const internship = this.internshipsRepository.create({
      ...createInternshipDto,
      status: createInternshipDto.status || InternshipStatus.PUBLISHED,
    });
    return await this.internshipsRepository.save(internship);
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    filters?: {
      status?: InternshipStatus;
      year?: number;
      student?: string;
      companyId?: string;
    },
  ): Promise<{ items: Internship[]; meta: any }> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.internshipsRepository
      .createQueryBuilder('internship')
      .leftJoinAndSelect('internship.company', 'company')
      .leftJoinAndSelect('internship.applications', 'applications')
      .leftJoinAndSelect('applications.student', 'student')
      .leftJoinAndSelect('student.user', 'studentUser')
      .leftJoinAndSelect('internship.approver', 'approver');

    if (filters?.status) {
      queryBuilder.andWhere('internship.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.companyId) {
      queryBuilder.andWhere('internship.companyId = :companyId', {
        companyId: filters.companyId,
      });
    }

    if (filters?.year) {
      queryBuilder.andWhere('EXTRACT(YEAR FROM internship.startDate) = :year', {
        year: filters.year,
      });
    }

    if (filters?.student) {
      queryBuilder.andWhere(
        '(LOWER(studentUser.firstName) LIKE LOWER(:studentName) OR LOWER(studentUser.lastName) LIKE LOWER(:studentName) OR LOWER(CONCAT(studentUser.firstName, \' \', studentUser.lastName)) LIKE LOWER(:studentName))',
        { studentName: `%${filters.student}%` },
      );
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('internship.createdAt', 'DESC')
      .getManyAndCount();

    return {
      items: items || [],
      meta: {
        total: total || 0,
        page,
        limit,
        totalPages: total > 0 ? Math.ceil(total / limit) : 0,
      },
    };
  }

  async findOne(id: string): Promise<Internship> {
    const internship = await this.internshipsRepository.findOne({
      where: { id },
      relations: ['company', 'applications', 'applications.student', 'applications.student.user', 'approver'],
    });

    if (!internship) {
      throw new NotFoundException('Internship not found');
    }

    return internship;
  }

  async verifyOwnership(internshipId: string, companyId: string): Promise<boolean> {
    const internship = await this.internshipsRepository.findOne({
      where: { id: internshipId },
    });
    return internship?.companyId === companyId;
  }

  async update(
    id: string,
    updateInternshipDto: UpdateInternshipDto,
  ): Promise<Internship> {
    const internship = await this.findOne(id);

    if (internship.approvedBy !== null || internship.status === InternshipStatus.ACTIVE) {
      throw new BadRequestException(
        'Cannot change status of approved internship',
      );
    }

    // Validate dates if they are being changed
    if (updateInternshipDto.startDate || updateInternshipDto.endDate) {
      const startDate = new Date(
        updateInternshipDto.startDate || internship.startDate,
      );
      const endDate = new Date(
        updateInternshipDto.endDate || internship.endDate,
      );

      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    Object.assign(internship, updateInternshipDto);
    return await this.internshipsRepository.save(internship);
  }

  async updateStatus(
    id: string,
    newStatus: InternshipStatus,
    userId?: string,
  ): Promise<Internship> {
    const internship = await this.findOne(id);

    if (internship.approvedBy !== null || internship.status === InternshipStatus.ACTIVE) {
      throw new BadRequestException(
        'Cannot change status of approved internship',
      );
    }

    internship.status = newStatus;

    // If status is being set to ACTIVE, record approval
    if (newStatus === InternshipStatus.ACTIVE && userId) {
      internship.approvedBy = userId;
      internship.approvedAt = new Date();
    }

    return await this.internshipsRepository.save(internship);
  }

  async remove(id: string): Promise<void> {
    const internship = await this.findOne(id);
    await this.internshipsRepository.remove(internship);
  }

  async archive(id: string): Promise<Internship> {
    const internship = await this.findOne(id);

    // Toggle archive status
    if (internship.status === InternshipStatus.ARCHIVED) {
      internship.status = InternshipStatus.ACTIVE;
      internship.archivedAt = null;
    } else {
      internship.status = InternshipStatus.ARCHIVED;
      internship.archivedAt = new Date();
    }

    return await this.internshipsRepository.save(internship);
  }

  async findByCompany(
    companyId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ items: Internship[]; total: number }> {
    const skip = (page - 1) * limit;

    const [items, total] = await this.internshipsRepository.findAndCount({
      where: { companyId },
      relations: ['company'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Get application counts for each internship
    const itemsWithCounts = await Promise.all(
      items.map(async (internship) => {
        const applicationsCount = await this.applicationsRepository.count({
          where: { internshipId: internship.id },
        });
        return { ...internship, applicationsCount };
      }),
    );

    return { items: itemsWithCounts, total };
  }

  async findOnePublic(id: string): Promise<Internship> {
    const internship = await this.internshipsRepository.findOne({
      where: { id, status: InternshipStatus.ACTIVE },
      relations: ['company'],
    });

    if (!internship) {
      throw new NotFoundException('Internship not found');
    }

    return internship;
  }

  async findPublicInternships(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ items: any[]; meta: any }> {
    const skip = (page - 1) * limit;

    const [items, total] = await this.internshipsRepository
      .createQueryBuilder('internship')
      .leftJoinAndSelect('internship.company', 'company')
      .where('internship.status = :status', {
        status: InternshipStatus.ACTIVE,
      })
      .select([
        'internship.id',
        'internship.title',
        'internship.description',
        'internship.location',
        'internship.duration',
        'internship.salary',
        'internship.requiredSkills',
        'internship.createdAt',
        'company.name',
        'company.address',
        'company.website',
      ])
      .skip(skip)
      .take(limit)
      .orderBy('internship.createdAt', 'DESC')
      .getManyAndCount();

    return {
      items: items || [],
      meta: {
        total: total || 0,
        page,
        limit,
        totalPages: total > 0 ? Math.ceil(total / limit) : 0,
      },
    };
  }

  async approve(id: string, userId: string): Promise<Internship> {
    // Find internship by ID
    const internship = await this.internshipsRepository.findOne({
      where: { id },
    });

    if (!internship) {
      throw new NotFoundException('Internship not found');
    }

    // Check if already approved (ACTIVE = approved and visible to students)
    if (internship.status === InternshipStatus.ACTIVE) {
      throw new BadRequestException('Praksa je već odobrena');
    }

    // Update status to ACTIVE so it becomes visible to students
    internship.status = InternshipStatus.ACTIVE;
    internship.approvedBy = userId;
    internship.approvedAt = new Date();

    return await this.internshipsRepository.save(internship);
  }

  async findFiltered(filters: FilterInternshipsDto): Promise<{
    items: Internship[];
    meta: any;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.internshipsRepository
      .createQueryBuilder('internship')
      .leftJoinAndSelect('internship.company', 'company')
      .where('internship.status = :status', { status: InternshipStatus.ACTIVE });

    // Location filter (case-insensitive)
    if (filters.location) {
      query.andWhere('LOWER(internship.location) LIKE LOWER(:location)', {
        location: `%${filters.location}%`,
      });
    }

    // Company filter
    if (filters.company) {
      query.andWhere('internship.companyId = :companyId', {
        companyId: filters.company,
      });
    }

    // Duration filter
    if (filters.duration) {
      query.andWhere('internship.duration = :duration', {
        duration: filters.duration,
      });
    }

    // Field of study filter (search in requiredSkills array)
    if (filters.field) {
      query.andWhere(':field = ANY(internship.requiredSkills)', {
        field: filters.field,
      });
    }

    // Salary range filters
    if (filters.minSalary !== undefined) {
      query.andWhere('internship.salary >= :minSalary', {
        minSalary: filters.minSalary,
      });
    }

    if (filters.maxSalary !== undefined) {
      query.andWhere('internship.salary <= :maxSalary', {
        maxSalary: filters.maxSalary,
      });
    }

    const [items, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('internship.createdAt', 'DESC')
      .getManyAndCount();

    return {
      items: items || [],
      meta: {
        total: total || 0,
        page,
        limit,
        totalPages: total > 0 ? Math.ceil(total / limit) : 0,
      },
    };
  }
  
  async submitGrade(
    id: string,
    grade: number,
    userId: string,
    comment?: string,
  ): Promise<Internship> {
    const internship = await this.internshipsRepository.findOne({
      where: { id },
      relations: ['applications', 'applications.student'],
    });

    if (!internship) {
      throw new NotFoundException('Internship not found');
    }

    if (internship.grade !== null) {
      throw new BadRequestException('Grade has already been submitted');
    }

    const evaluation = await this.evaluationsRepository.findOne({
      where: { internshipId: id },
    });

    if (!evaluation) {
      throw new BadRequestException(
        'Evaluacija mentora iz tvrtke mora biti dovršena prije ocjenjivanja',
      );
    }

    // Allow grading of ACTIVE internships if evaluation exists (for backwards compatibility)
    // or COMPLETED internships
    if (![InternshipStatus.ACTIVE, InternshipStatus.COMPLETED].includes(internship.status)) {
      throw new BadRequestException('Praksa mora biti aktivna ili završena za ocjenjivanje');
    }

    // If still ACTIVE, mark as COMPLETED now that evaluation exists
    if (internship.status === InternshipStatus.ACTIVE) {
      internship.status = InternshipStatus.COMPLETED;
    }

    const academicMentor = await this.academicMentorsRepository.findOne({
      where: { userId },
    });

    if (!academicMentor) {
      throw new ForbiddenException('Only academic mentors can submit grades');
    }

    const approvedApplication = internship.applications.find(
      (app) => app.status === ApplicationStatus.APPROVED,
    );

    if (!approvedApplication) {
      throw new BadRequestException('No approved application found');
    }

    if (approvedApplication.student.academicMentorId !== academicMentor.id) {
      throw new ForbiddenException(
        'You can only grade students assigned to you',
      );
    }

    internship.grade = grade;
    internship.gradeComment = comment || null;
    internship.gradedBy = userId;
    internship.gradedAt = new Date();
    internship.status = InternshipStatus.GRADED;

    return await this.internshipsRepository.save(internship);
  }
}
