import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Application } from './entities/application.entity';
import { Internship } from '../internships/entities/internship.entity';
import { User } from '../users/entities/user.entity';
import { InternshipStatus } from '../../common/enums/internship-status.enum';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateApplicationDto } from './dto/create-application.dto';
import { NotificationData } from './interfaces/notification-data.interface';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import {
  ApplicationCreatedEvent,
  ApplicationStatusChangedEvent,
} from './events/application.events';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(Internship)
    private internshipsRepository: Repository<Internship>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private eventEmitter: EventEmitter2,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createApplicationDto: CreateApplicationDto): Promise<Application> {
    const internship = await this.internshipsRepository.findOne({
      where: { id: createApplicationDto.internshipId },
    });

    if (!internship) {
      throw new NotFoundException('Internship not found');
    }

    if (internship.status !== InternshipStatus.ACTIVE) {
      throw new BadRequestException('This internship is no longer accepting applications');
    }

    const now = new Date();
    if (internship.endDate && new Date(internship.endDate) < now) {
      throw new BadRequestException('Application deadline has passed');
    }

    const existingApplication = await this.applicationsRepository.findOne({
      where: {
        internshipId: createApplicationDto.internshipId,
        studentId: createApplicationDto.studentId,
      },
    });

    if (existingApplication) {
      throw new ConflictException('You have already applied for this internship');
    }

    const application = this.applicationsRepository.create({
      ...createApplicationDto,
      status: ApplicationStatus.PENDING,
    });

    const savedApplication = await this.applicationsRepository.save(application);

    this.eventEmitter.emit(
      'application.created',
      new ApplicationCreatedEvent(
        savedApplication.id,
        savedApplication.studentId,
        savedApplication.internshipId,
        internship.companyId,
      ),
    );

    // Send employer notification asynchronously (don't await to avoid blocking)
    this.sendEmployerNotification(savedApplication.id).catch((error) => {
      // Email errors are already logged in EmailService, no need to re-throw
    });

    // Send in-app notification to company employers
    this.sendEmployerInAppNotification(savedApplication.id, internship.companyId).catch((error) => {
      // Notification errors shouldn't block the request
    });

    return savedApplication;
  }

  private async sendEmployerInAppNotification(applicationId: string, companyId: string): Promise<void> {
    try {
      // Get application details
      const application = await this.applicationsRepository.findOne({
        where: { id: applicationId },
        relations: ['student', 'student.user', 'internship'],
      });

      if (!application || !application.student?.user) return;

      // Find all employers (users) associated with this company
      const employers = await this.usersRepository.find({
        where: { companyId, role: UserRole.EMPLOYER },
      });

      const studentName = `${application.student.user.firstName} ${application.student.user.lastName}`;
      const internshipTitle = application.internship?.title || 'praksu';

      // Send notification to each employer
      const internshipId = application.internship?.id;
      for (const employer of employers) {
        await this.notificationsService.create({
          userId: employer.id,
          type: NotificationType.APPLICATION_STATUS,
          title: 'Nova prijava na praksu',
          message: `${studentName} se prijavio/la na "${internshipTitle}".`,
          relatedId: applicationId,
          relatedUrl: `/employer/internships/${internshipId}/applicants`,
        });
      }
    } catch (error) {
      // Log but don't throw - notifications shouldn't block the main flow
      console.error('Error sending in-app notification:', error);
    }
  }

  private async sendEmployerNotification(applicationId: string): Promise<void> {
    try {
      const notificationData = await this.prepareNotificationData(applicationId);
      await this.emailService.sendApplicationNotification(notificationData);
    } catch (error) {
      // Errors are already logged in prepareNotificationData and EmailService
      // No need to re-throw as email failures shouldn't block the request
    }
  }

  async checkIfApplied(
    studentId: string,
    internshipId: string,
  ): Promise<{ hasApplied: boolean }> {
    const application = await this.applicationsRepository.findOne({
      where: {
        studentId,
        internshipId,
      },
    });
    return { hasApplied: !!application };
  }

  async findByStudent(
    studentId: string,
    status?: ApplicationStatus,
  ): Promise<Application[]> {
    const queryBuilder = this.applicationsRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.internship', 'internship')
      .leftJoinAndSelect('internship.company', 'company')
      .where('application.studentId = :studentId', { studentId });

    if (status) {
      queryBuilder.andWhere('application.status = :status', { status });
    }

    const applications = await queryBuilder
      .orderBy('application.appliedAt', 'DESC')
      .getMany();

    return applications || [];
  }

  async verifyInternshipOwnership(
    internshipId: string,
    companyId: string,
  ): Promise<boolean> {
    const internship = await this.internshipsRepository.findOne({
      where: { id: internshipId },
    });
    return internship?.companyId === companyId;
  }

  async findByInternship(
    internshipId: string,
    status?: ApplicationStatus,
  ): Promise<Application[]> {
    const queryBuilder = this.applicationsRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.internship', 'internship')
      .leftJoinAndSelect('application.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .where('application.internshipId = :internshipId', { internshipId });

    if (status) {
      queryBuilder.andWhere('application.status = :status', { status });
    }

    const applications = await queryBuilder
      .orderBy('application.appliedAt', 'DESC')
      .getMany();

    return applications || [];
  }

  async findOne(id: string): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: { id },
      relations: ['internship', 'internship.company', 'student', 'student.user'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async updateStatus(
    id: string,
    newStatus: ApplicationStatus,
    userId?: string,
    companyId?: string,
  ): Promise<Application> {
    const application = await this.findOne(id);
    const oldStatus = application.status;

    if (companyId && application.internship.companyId !== companyId) {
      throw new ForbiddenException(
        'You can only update applications for your own internships',
      );
    }

    if (
      application.status === ApplicationStatus.APPROVED ||
      application.status === ApplicationStatus.REJECTED
    ) {
      throw new BadRequestException(
        `Cannot change status of ${application.status.toLowerCase()} application`,
      );
    }

    application.status = newStatus;
    application.statusChangedAt = new Date();
    if (userId) {
      application.statusChangedBy = userId;
    }

    const updatedApplication = await this.applicationsRepository.save(
      application,
    );

    this.eventEmitter.emit(
      'application.status.changed',
      new ApplicationStatusChangedEvent(
        updatedApplication.id,
        oldStatus,
        newStatus,
        updatedApplication.studentId,
      ),
    );

    // Send email notifications asynchronously (don't await to avoid blocking)
    this.sendStatusChangeEmail(id, newStatus).catch((error) => {
      // Email errors are already logged in EmailService, no need to re-throw
    });

    return updatedApplication;
  }

  private async sendStatusChangeEmail(
    applicationId: string,
    newStatus: ApplicationStatus,
  ): Promise<void> {
    try {
      const notificationData = await this.prepareNotificationData(applicationId);

      if (newStatus === ApplicationStatus.APPROVED) {
        await this.emailService.sendApprovalEmail(notificationData);
      } else if (newStatus === ApplicationStatus.REJECTED) {
        await this.emailService.sendRejectionEmail(notificationData);
      }
    } catch (error) {
      // Errors are already logged in prepareNotificationData and EmailService
      // No need to re-throw as email failures shouldn't block the request
    }
  }

  async prepareNotificationData(
    applicationId: string,
  ): Promise<NotificationData> {
    const application = await this.applicationsRepository.findOne({
      where: { id: applicationId },
      relations: ['student', 'student.user', 'internship', 'internship.company'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (!application.student?.user) {
      throw new BadRequestException(
        'Application student or user data is missing',
      );
    }

    if (!application.internship?.company) {
      throw new BadRequestException(
        'Application internship or company data is missing',
      );
    }

    return {
      studentName: `${application.student.user.firstName} ${application.student.user.lastName}`,
      studentEmail: application.student.user.email,
      internshipTitle: application.internship.title,
      companyName: application.internship.company.name,
      employerEmail: application.internship.company.email,
      status: application.status,
      appliedDate: application.appliedAt,
    };
  }

  async getApplicationByInternshipAndStudent(
    internshipId: string,
    studentId: string,
  ): Promise<Application | null> {
    return this.applicationsRepository.findOne({
      where: { internshipId, studentId },
    });
  }

  async addDocuments(
    internshipId: string,
    studentId: string,
    newDocumentPaths: string[],
  ): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: { internshipId, studentId },
    });

    if (!application) {
      throw new NotFoundException('Prijava nije pronađena');
    }

    // Merge existing documents with new ones
    const existingDocs = application.documentsPaths || [];
    const allDocs = [...existingDocs, ...newDocumentPaths];

    // Limit to 10 documents total
    if (allDocs.length > 10) {
      throw new BadRequestException('Maksimalno 10 dokumenata je dozvoljeno');
    }

    application.documentsPaths = allDocs;
    return this.applicationsRepository.save(application);
  }

  async removeDocument(
    internshipId: string,
    studentId: string,
    documentPath: string,
  ): Promise<Application> {
    const application = await this.applicationsRepository.findOne({
      where: { internshipId, studentId },
    });

    if (!application) {
      throw new NotFoundException('Prijava nije pronađena');
    }

    const docs = application.documentsPaths || [];
    application.documentsPaths = docs.filter((d) => d !== documentPath);
    return this.applicationsRepository.save(application);
  }
}
