import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Internship } from './entities/internship.entity';
import { InternshipStatus } from '../../common/enums/internship-status.enum';
import { ApplicationStatus } from '../../common/enums/application-status.enum';

interface AdminInternshipsFilters {
  page?: number;
  limit?: number;
  year?: number;
  student?: string;
  company?: string;
  status?: InternshipStatus;
  search?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

@Injectable()
export class AdminInternshipsService {
  constructor(
    @InjectRepository(Internship)
    private internshipsRepository: Repository<Internship>,
  ) {}

  async findAllInternships(filters: AdminInternshipsFilters): Promise<{
    data: any[];
    meta: any;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;
    const sortBy = filters.sortBy || 'createdAt';
    const order = filters.order || 'DESC';

    const queryBuilder = this.internshipsRepository
      .createQueryBuilder('internship')
      .leftJoinAndSelect('internship.company', 'company')
      .leftJoinAndSelect('internship.applications', 'applications')
      .leftJoinAndSelect('applications.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('internship.approver', 'approver');

    // Apply filters
    if (filters.status) {
      queryBuilder.andWhere('internship.status = :status', {
        status: filters.status,
      });
    }

    if (filters.company) {
      queryBuilder.andWhere('internship.companyId = :companyId', {
        companyId: filters.company,
      });
    }

    if (filters.year) {
      queryBuilder.andWhere('EXTRACT(YEAR FROM internship.startDate) = :year', {
        year: filters.year,
      });
    }

    if (filters.student) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :student OR user.lastName ILIKE :student)',
        { student: `%${filters.student}%` },
      );
    }

    // Search in title or company name
    if (filters.search) {
      queryBuilder.andWhere(
        '(internship.title ILIKE :search OR company.name ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy(`internship.${sortBy}`, order)
      .getManyAndCount();

    // Transform to include applications count and approved student
    const transformedItems = items.map((internship) => {
      // Find the approved application to get the student
      const approvedApplication = internship.applications?.find(
        (app) => app.status === ApplicationStatus.APPROVED,
      );

      return {
        ...internship,
        applicationsCount: internship.applications?.length || 0,
        student: approvedApplication?.student || null,
      };
    });

    return {
      data: transformedItems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        filters: {
          year: filters.year,
          student: filters.student,
          company: filters.company,
          status: filters.status,
        },
      },
    };
  }
}
