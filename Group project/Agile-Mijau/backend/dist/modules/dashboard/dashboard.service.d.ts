import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Application } from '../applications/entities/application.entity';
import { Internship } from '../internships/entities/internship.entity';
import { Company } from '../companies/entities/company.entity';
import { DiaryEntry } from '../diary/entities/diary-entry.entity';
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
export declare class DashboardService {
    private studentsRepository;
    private applicationsRepository;
    private internshipsRepository;
    private companiesRepository;
    private diaryRepository;
    constructor(studentsRepository: Repository<Student>, applicationsRepository: Repository<Application>, internshipsRepository: Repository<Internship>, companiesRepository: Repository<Company>, diaryRepository: Repository<DiaryEntry>);
    getStudentDashboard(studentId: string): Promise<StudentDashboard>;
    getEmployerDashboard(companyId: string): Promise<EmployerDashboard>;
    getMentorDashboard(mentorId: string, role: UserRole): Promise<MentorDashboard>;
    getAdminDashboard(): Promise<AdminDashboard>;
}
