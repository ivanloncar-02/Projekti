import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
export declare class NotificationsService {
    private notificationsRepository;
    constructor(notificationsRepository: Repository<Notification>);
    create(data: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        relatedId?: string;
        relatedUrl?: string;
    }): Promise<Notification>;
    findByUser(userId: string): Promise<Notification[]>;
    markAsRead(id: string, userId: string): Promise<Notification | null>;
    markAllAsRead(userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
}
