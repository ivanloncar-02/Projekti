import { User } from '../../users/entities/user.entity';
export declare enum NotificationType {
    STUDENT_ASSIGNED = "STUDENT_ASSIGNED",
    DIARY_ENTRY_SUBMITTED = "DIARY_ENTRY_SUBMITTED",
    FINAL_REPORT_SUBMITTED = "FINAL_REPORT_SUBMITTED",
    APPLICATION_STATUS = "APPLICATION_STATUS"
}
export declare class Notification {
    id: string;
    userId: string;
    user: User;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    relatedId: string;
    relatedUrl: string;
    createdAt: Date;
}
