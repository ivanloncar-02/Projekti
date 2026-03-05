import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../applications/entities/application.entity';
import { Internship } from '../internships/entities/internship.entity';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
import { InternshipStatus } from '../../common/enums/internship-status.enum';
import { StatisticsFiltersDto } from './dto/statistics-filters.dto';

interface StatisticsResult {
  totalApplications: number;
  approvedInternships: number;
  averageGrade: number;
  completedInternships: number;
  pendingApplications: number;
  activeOffers: number;
}

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(Internship)
    private internshipsRepository: Repository<Internship>,
  ) {}

  async calculateStatistics(
    filters?: StatisticsFiltersDto,
  ): Promise<StatisticsResult> {
    // Build base query for applications
    const applicationQuery =
      this.applicationsRepository.createQueryBuilder('application');

    // Build base query for internships
    const internshipQuery =
      this.internshipsRepository.createQueryBuilder('internship');

    // Apply filters if provided
    if (filters) {
      if (filters.year) {
        // Parse academic year format "2024/2025" to date range
        // Academic year typically runs from September to August
        const [startYear] = filters.year.split('/').map(Number);
        if (startYear) {
          const academicYearStart = new Date(startYear, 8, 1); // September 1st
          const academicYearEnd = new Date(startYear + 1, 7, 31); // August 31st

          applicationQuery.andWhere(
            'application.appliedAt BETWEEN :startDate AND :endDate',
            { startDate: academicYearStart, endDate: academicYearEnd },
          );
          internshipQuery.andWhere(
            'internship.startDate BETWEEN :startDate AND :endDate',
            { startDate: academicYearStart, endDate: academicYearEnd },
          );
        }
      }

      if (filters.company) {
        applicationQuery
          .leftJoin('application.internship', 'internship')
          .andWhere('internship.companyId = :companyId', {
            companyId: filters.company,
          });
        internshipQuery.andWhere('internship.companyId = :companyId', {
          companyId: filters.company,
        });
      }

      if (filters.startDate && filters.endDate) {
        applicationQuery.andWhere(
          'application.createdAt BETWEEN :startDate AND :endDate',
          {
            startDate: filters.startDate,
            endDate: filters.endDate,
          },
        );
        internshipQuery.andWhere(
          'internship.startDate BETWEEN :startDate AND :endDate',
          {
            startDate: filters.startDate,
            endDate: filters.endDate,
          },
        );
      }
    }

    // Calculate total applications
    const totalApplications = await applicationQuery.getCount();

    // Calculate pending applications (respecting filters)
    const pendingApplications = await applicationQuery
      .clone()
      .andWhere('application.status = :status', {
        status: ApplicationStatus.PENDING,
      })
      .getCount();

    // Calculate approved/in-progress internships (ACTIVE or APPROVED - student is doing the internship)
    const approvedInternships = await internshipQuery
      .clone()
      .andWhere('internship.status IN (:...statuses)', {
        statuses: [InternshipStatus.ACTIVE, InternshipStatus.APPROVED],
      })
      .getCount();

    // Calculate completed internships (COMPLETED or GRADED)
    const completedInternships = await internshipQuery
      .clone()
      .andWhere('internship.status IN (:...statuses)', {
        statuses: [InternshipStatus.COMPLETED, InternshipStatus.GRADED],
      })
      .getCount();

    // Calculate active offers (PUBLISHED internships available for applications)
    const activeOffers = await internshipQuery
      .clone()
      .andWhere('internship.status = :status', {
        status: InternshipStatus.PUBLISHED,
      })
      .getCount();

    // Calculate average grade
    const avgGradeResult = await internshipQuery
      .clone()
      .select('AVG(internship.grade)', 'average')
      .where('internship.grade IS NOT NULL')
      .getRawOne();

    const averageGrade = avgGradeResult?.average
      ? parseFloat(avgGradeResult.average)
      : 0;

    return {
      totalApplications: totalApplications || 0,
      approvedInternships: approvedInternships || 0,
      averageGrade: averageGrade || 0,
      completedInternships: completedInternships || 0,
      pendingApplications: pendingApplications || 0,
      activeOffers: activeOffers || 0,
    };
  }
}
