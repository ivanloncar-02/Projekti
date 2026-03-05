import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getMyNotifications(userId: string): Promise<import("./entities/notification.entity").Notification[]>;
    markAsRead(id: string, userId: string): Promise<import("./entities/notification.entity").Notification | null>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
    }>;
}
