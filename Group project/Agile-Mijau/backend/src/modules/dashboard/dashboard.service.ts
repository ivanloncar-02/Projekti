import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Application } from '../applications/entities/application.entity';
import { Internship } from '../internships/entities/internship.entity';
import { Company } from '../companies/entities/company.entity';
import { DiaryEntry } from '../diary/entities/diary-entry.entity';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
import { InternshipStatus } from '../../common/enums/internship-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';

export interface ActiveInternship {
  id: string;
  title: string;
  companyName: string;
  status: string;
  grade?: number;
  gradeComment?: string;
}

export interface StudentDashboard {
  activeApplications: number;
  activeInternships: number;
  activeInternship?: ActiveInternship;
}

export interface EmployerDashboard {
  activeInternships: number;
  totalApplications: number;
  pendingApplications: number;
}

export interface MentorDashboard {
  assignedStudents: number;
  pendingReviews: number;
}

export interface AdminDashboard {
  totalStudents: number;
  totalCompanies: number;
  totalInternships: number;
  activeInternships: number;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(Internship)
    private internshipsRepository: Repository<Internship>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(DiaryEntry)
    private diaryRepository: Repository<DiaryEntry>,
  ) {}

  async getStudentDashboard(studentId: string): Promise<StudentDashboard> {
    const activeApplications = await this.applicationsRepository.count({
      where: {
        studentId,
        status: ApplicationStatus.PENDING,
      },
    });

    // Get approved applications with internship details
    const approvedApplications = await this.applicationsRepository.find({
      where: {
        studentId,
        status: ApplicationStatus.APPROVED,
      },
      relations: ['internship', 'internship.company'],
      order: { statusChangedAt: 'DESC' },
    });

    const activeInternships = approvedApplications.length;

    // Get the most recent active internship for the dashboard link
    let activeInternship: ActiveInternship | undefined;
    if (approvedApplications.length > 0) {
      const app = approvedApplications[0];
      if (app.internship) {
        activeInternship = {
          id: app.internship.id,
          title: app.internship.title,
          companyName: app.internship.company?.name || 'Unknown Company',
          status: app.internship.status,
          grade: app.internship.grade ?? undefined,
          gradeComment: app.internship.gradeComment ?? undefined,
        };
      }
    }

    return {
      activeApplications,
      activeInternships,
      activeInternship,
    };
  }

  async getEmployerDashboard(companyId: string): Promise<EmployerDashboard> {
    const activeInternships = await this.internshipsRepository.count({
      where: {
        companyId,
        status: InternshipStatus.ACTIVE,
      },
    });

    const internships = await this.internshipsRepository.find({
      where: { companyId },
      select: ['id'],
    });
    const internshipIds = internships.map(i => i.id);

    let totalApplications = 0;
    let pendingApplications = 0;

    if (internshipIds.length > 0) {
      totalApplications = await this.applicationsRepository
        .createQueryBuilder('app')
        .where('app.internshipId IN (:...ids)', { ids: internshipIds })
        .getCount();

      pendingApplications = await this.applicationsRepository
        .createQueryBuilder('app')
        .where('app.internshipId IN (:...ids)', { ids: internshipIds })
        .andWhere('app.status = :status', { status: ApplicationStatus.PENDING })
        .getCount();
    }

    return {
      activeInternships,
      totalApplications,
      pendingApplications,
    };
  }

  async getMentorDashboard(mentorId: string, role: UserRole): Promise<MentorDashboard> {
    let assignedStudents = 0;
    let pendingReviews = 0;

    if (role === UserRole.ACADEMIC_MENTOR) {
      assignedStudents = await this.studentsRepository.count({
        where: { academicMentorId: mentorId },
      });

      // Count unapproved diary entries from assigned students
      const students = await this.studentsRepository.find({
        where: { academicMentorId: mentorId },
        select: ['id'],
      });
      const studentIds = students.map(s => s.id);

      if (studentIds.length > 0) {
        pendingReviews = await this.diaryRepository
          .createQueryBuilder('diary')
          .where('diary.studentId IN (:...ids)', { ids: studentIds })
          .andWhere('diary.isApproved = :approved', { approved: false })
          .getCount();
      }
    }

    return {
      assignedStudents,
      pendingReviews,
    };
  }

  async getAdminDashboard(): Promise<AdminDashboard> {
    const totalStudents = await this.studentsRepository.count();
    const totalCompanies = await this.companiesRepository.count();
    const totalInternships = await this.internshipsRepository.count();
    const activeInternships = await this.internshipsRepository.count({
      where: { status: InternshipStatus.ACTIVE },
    });

    return {
      totalStudents,
      totalCompanies,
      totalInternships,
      activeInternships,
    };
  }
}
