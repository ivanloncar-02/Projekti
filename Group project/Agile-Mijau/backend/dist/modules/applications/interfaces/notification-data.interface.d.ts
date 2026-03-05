import { ApplicationStatus } from '../../../common/enums/application-status.enum';
export interface NotificationData {
    studentName: string;
    studentEmail: string;
    internshipTitle: string;
    companyName: string;
    employerEmail: string;
    status: ApplicationStatus;
    appliedDate: Date;
}
