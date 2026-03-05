import { NotificationData } from '../applications/interfaces/notification-data.interface';
export declare class EmailService {
    private readonly logger;
    sendApprovalEmail(data: NotificationData): Promise<void>;
    sendRejectionEmail(data: NotificationData): Promise<void>;
    sendApplicationNotification(data: NotificationData): Promise<void>;
}
