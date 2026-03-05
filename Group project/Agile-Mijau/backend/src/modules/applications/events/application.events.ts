import { ApplicationStatus } from '../../../common/enums/application-status.enum';

export class ApplicationCreatedEvent {
  constructor(
    public readonly applicationId: string,
    public readonly studentId: string,
    public readonly internshipId: string,
    public readonly companyId: string,
  ) {}
}

export class ApplicationStatusChangedEvent {
  constructor(
    public readonly applicationId: string,
    public readonly oldStatus: ApplicationStatus,
    public readonly newStatus: ApplicationStatus,
    public readonly studentId: string,
  ) {}
}
