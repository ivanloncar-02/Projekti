import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Application } from './entities/application.entity';
import { Internship } from '../internships/entities/internship.entity';
import { User } from '../users/entities/user.entity';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
import { CreateApplicationDto } from './dto/create-application.dto';
import { NotificationData } from './interfaces/notification-data.interface';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ApplicationsService {
    private applicationsRepository;
    private internshipsRepository;
    private usersRepository;
    private eventEmitter;
    private emailService;
    private notificationsService;
    constructor(applicationsRepository: Repository<Application>, internshipsRepository: Repository<Internship>, usersRepository: Repository<User>, eventEmitter: EventEmitter2, emailService: EmailService, notificationsService: NotificationsService);
    create(createApplicationDto: CreateApplicationDto): Promise<Application>;
    private sendEmployerInAppNotification;
    private sendEmployerNotification;
    checkIfApplied(studentId: string, internshipId: string): Promise<{
        hasApplied: boolean;
    }>;
    findByStudent(studentId: string, status?: ApplicationStatus): Promise<Application[]>;
    verifyInternshipOwnership(internshipId: string, companyId: string): Promise<boolean>;
    findByInternship(internshipId: string, status?: ApplicationStatus): Promise<Application[]>;
    findOne(id: string): Promise<Application>;
    updateStatus(id: string, newStatus: ApplicationStatus, userId?: string, companyId?: string): Promise<Application>;
    private sendStatusChangeEmail;
    prepareNotificationData(applicationId: string): Promise<NotificationData>;
    getApplicationByInternshipAndStudent(internshipId: string, studentId: string): Promise<Application | null>;
    addDocuments(internshipId: string, studentId: string, newDocumentPaths: string[]): Promise<Application>;
    removeDocument(internshipId: string, studentId: string, documentPath: string): Promise<Application>;
}
