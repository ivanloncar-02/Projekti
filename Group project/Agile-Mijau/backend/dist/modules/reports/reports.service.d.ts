import { Repository } from 'typeorm';
import { Internship } from '../internships/entities/internship.entity';
import { DiaryEntry } from '../diary/entities/diary-entry.entity';
import { Goal } from '../goals/entities/goal.entity';
import { CompanyMentorEvaluation } from '../evaluations/entities/company-mentor-evaluation.entity';
import { Application } from '../applications/entities/application.entity';
import { Student } from '../students/entities/student.entity';
import { AcademicMentor } from '../mentors/entities/academic-mentor.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { UserRole } from '../../common/enums/user-role.enum';
export declare class ReportsService {
    private readonly internshipRepository;
    private readonly diaryRepository;
    private readonly goalRepository;
    private readonly evaluationRepository;
    private readonly applicationRepository;
    private readonly studentRepository;
    private readonly academicMentorRepository;
    private readonly notificationsService;
    constructor(internshipRepository: Repository<Internship>, diaryRepository: Repository<DiaryEntry>, goalRepository: Repository<Goal>, evaluationRepository: Repository<CompanyMentorEvaluation>, applicationRepository: Repository<Application>, studentRepository: Repository<Student>, academicMentorRepository: Repository<AcademicMentor>, notificationsService: NotificationsService);
    generateInternshipReport(internshipId: string, studentId: string, userId?: string, role?: UserRole): Promise<Buffer>;
    private createPDF;
    private verifyAcademicMentorAccess;
    private translateStatus;
}
