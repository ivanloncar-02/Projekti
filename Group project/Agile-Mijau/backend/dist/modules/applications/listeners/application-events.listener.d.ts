import { Repository } from 'typeorm';
import { Application } from '../entities/application.entity';
import { ApplicationCreatedEvent, ApplicationStatusChangedEvent } from '../events/application.events';
import { NotificationsService } from '../../notifications/notifications.service';
export interface ApplicationNotificationData {
    studentName: string;
    studentEmail: string;
    studentUserId: string;
    internshipTitle: string;
    internshipId: string;
    companyName: string;
    companyEmail: string;
    status: string;
    appliedDate: Date;
}
export declare class ApplicationEventsListener {
    private applicationsRepository;
    private notificationsService;
    private readonly logger;
    constructor(applicationsRepository: Repository<Application>, notificationsService: NotificationsService);
    prepareNotificationData(applicationId: string): Promise<ApplicationNotificationData | null>;
    handleApplicationCreated(event: ApplicationCreatedEvent): Promise<void>;
    handleStatusChanged(event: ApplicationStatusChangedEvent): Promise<void>;
}
