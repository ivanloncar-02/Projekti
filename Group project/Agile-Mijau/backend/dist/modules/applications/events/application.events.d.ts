import { ApplicationStatus } from '../../../common/enums/application-status.enum';
export declare class ApplicationCreatedEvent {
    readonly applicationId: string;
    readonly studentId: string;
    readonly internshipId: string;
    readonly companyId: string;
    constructor(applicationId: string, studentId: string, internshipId: string, companyId: string);
}
export declare class ApplicationStatusChangedEvent {
    readonly applicationId: string;
    readonly oldStatus: ApplicationStatus;
    readonly newStatus: ApplicationStatus;
    readonly studentId: string;
    constructor(applicationId: string, oldStatus: ApplicationStatus, newStatus: ApplicationStatus, studentId: string);
}
