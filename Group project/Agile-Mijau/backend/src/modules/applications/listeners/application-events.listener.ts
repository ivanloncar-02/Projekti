import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../entities/application.entity';
import {
  ApplicationCreatedEvent,
  ApplicationStatusChangedEvent,
} from '../events/application.events';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/entities/notification.entity';

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

@Injectable()
export class ApplicationEventsListener {
  private readonly logger = new Logger(ApplicationEventsListener.name);

  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    private notificationsService: NotificationsService,
  ) {}

  async prepareNotificationData(
    applicationId: string,
  ): Promise<ApplicationNotificationData | null> {
    const application = await this.applicationsRepository.findOne({
      where: { id: applicationId },
      relations: ['student', 'student.user', 'internship', 'internship.company'],
    });

    if (!application) {
      return null;
    }

    return {
      studentName: `${application.student.user.firstName} ${application.student.user.lastName}`,
      studentEmail: application.student.user.email,
      studentUserId: application.student.user.id,
      internshipTitle: application.internship.title,
      internshipId: application.internship.id,
      companyName: application.internship.company.name,
      companyEmail: application.internship.company.email,
      status: application.status,
      appliedDate: application.appliedAt,
    };
  }

  @OnEvent('application.created')
  async handleApplicationCreated(event: ApplicationCreatedEvent) {
    const notificationData = await this.prepareNotificationData(event.applicationId);
    if (notificationData) {
      this.logger.log(
        `New application: ${notificationData.studentName} applied to ${notificationData.internshipTitle} at ${notificationData.companyName}`,
      );
    }
  }

  @OnEvent('application.status.changed')
  async handleStatusChanged(event: ApplicationStatusChangedEvent) {
    const notificationData = await this.prepareNotificationData(event.applicationId);
    if (notificationData) {
      this.logger.log(
        `Application status changed to ${event.newStatus}: ${notificationData.studentName} - ${notificationData.internshipTitle}`,
      );

      // Send notification to student
      try {
        let title: string;
        let message: string;
        let relatedUrl: string;

        if (event.newStatus === 'APPROVED') {
          title = 'Prijava odobrena!';
          message = `Vaša prijava za "${notificationData.internshipTitle}" u tvrtki ${notificationData.companyName} je odobrena. Možete započeti s praksom.`;
          relatedUrl = `/student/my-internship/${notificationData.internshipId}`;
        } else if (event.newStatus === 'REJECTED') {
          title = 'Prijava odbijena';
          message = `Nažalost, vaša prijava za "${notificationData.internshipTitle}" u tvrtki ${notificationData.companyName} nije prihvaćena.`;
          relatedUrl = '/student/applications';
        } else {
          title = 'Status prijave promijenjen';
          message = `Status vaše prijave za "${notificationData.internshipTitle}" je promijenjen na ${event.newStatus}.`;
          relatedUrl = '/student/applications';
        }

        await this.notificationsService.create({
          userId: notificationData.studentUserId,
          type: NotificationType.APPLICATION_STATUS,
          title,
          message,
          relatedId: event.applicationId,
          relatedUrl,
        });

        this.logger.log(`Notification sent to student ${notificationData.studentName}`);
      } catch (error) {
        this.logger.error(`Failed to send notification to student: ${error}`);
      }
    }
  }
}
