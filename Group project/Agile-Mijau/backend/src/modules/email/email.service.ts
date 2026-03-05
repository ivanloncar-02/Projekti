import { Injectable, Logger } from '@nestjs/common';
import { NotificationData } from '../applications/interfaces/notification-data.interface';

/**
 * EmailService handles sending email notifications to students and employers.
 *
 * TODO: Configure SMTP settings:
 * 1. Install @nestjs-modules/mailer and nodemailer
 * 2. Add SMTP configuration to .env:
 *    - SMTP_HOST
 *    - SMTP_PORT
 *    - SMTP_USER
 *    - SMTP_PASSWORD
 *    - SMTP_FROM
 * 3. Configure MailerModule in email.module.ts
 * 4. Create email templates in templates/ folder
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  /**
   * Sends approval email to student when their application is approved.
   * Template: templates/approval-email.hbs
   */
  async sendApprovalEmail(data: NotificationData): Promise<void> {
    try {
      const subject = 'Your internship application has been approved';

      // TODO: Replace with actual mailer service
      // await this.mailerService.sendMail({
      //   to: data.studentEmail,
      //   subject: subject,
      //   template: './approval-email',
      //   context: {
      //     studentName: data.studentName,
      //     internshipTitle: data.internshipTitle,
      //     companyName: data.companyName,
      //     appliedDate: data.appliedDate,
      //   },
      // });

      this.logger.log(`📧 Sending approval email`);
      this.logger.log(`   To: ${data.studentEmail}`);
      this.logger.log(`   Subject: ${subject}`);
      this.logger.log(`   Student: ${data.studentName}`);
      this.logger.log(`   Internship: ${data.internshipTitle}`);
      this.logger.log(`   Company: ${data.companyName}`);
      this.logger.log(`   Applied: ${data.appliedDate}`);

      // Simulate async email sending
      await new Promise((resolve) => setTimeout(resolve, 100));

      this.logger.log('✅ Approval email sent successfully');
    } catch (error) {
      // Log error but don't throw - email failures shouldn't block the request
      this.logger.error(
        `❌ Failed to send approval email to ${data.studentEmail}`,
        error.stack,
      );
    }
  }

  /**
   * Sends rejection email to student when their application is rejected.
   * Template: templates/rejection-email.hbs
   */
  async sendRejectionEmail(data: NotificationData): Promise<void> {
    try {
      const subject = 'Update on your internship application';

      // TODO: Replace with actual mailer service
      // await this.mailerService.sendMail({
      //   to: data.studentEmail,
      //   subject: subject,
      //   template: './rejection-email',
      //   context: {
      //     studentName: data.studentName,
      //     internshipTitle: data.internshipTitle,
      //     companyName: data.companyName,
      //     appliedDate: data.appliedDate,
      //   },
      // });

      this.logger.log(`📧 Sending rejection email`);
      this.logger.log(`   To: ${data.studentEmail}`);
      this.logger.log(`   Subject: ${subject}`);
      this.logger.log(`   Student: ${data.studentName}`);
      this.logger.log(`   Internship: ${data.internshipTitle}`);
      this.logger.log(`   Company: ${data.companyName}`);
      this.logger.log(`   Applied: ${data.appliedDate}`);

      // Simulate async email sending
      await new Promise((resolve) => setTimeout(resolve, 100));

      this.logger.log('✅ Rejection email sent successfully');
    } catch (error) {
      // Log error but don't throw - email failures shouldn't block the request
      this.logger.error(
        `❌ Failed to send rejection email to ${data.studentEmail}`,
        error.stack,
      );
    }
  }

  /**
   * Sends notification email to employer when a new application is received.
   * Template: templates/application-notification.hbs
   */
  async sendApplicationNotification(data: NotificationData): Promise<void> {
    try {
      const subject = `New application for ${data.internshipTitle}`;

      // TODO: Replace with actual mailer service
      // await this.mailerService.sendMail({
      //   to: data.employerEmail,
      //   subject: subject,
      //   template: './application-notification',
      //   context: {
      //     companyName: data.companyName,
      //     studentName: data.studentName,
      //     studentEmail: data.studentEmail,
      //     internshipTitle: data.internshipTitle,
      //     appliedDate: data.appliedDate,
      //     reviewLink: `${process.env.FRONTEND_URL}/applications/${data.appliedDate}`,
      //   },
      // });

      this.logger.log(`📧 Sending application notification`);
      this.logger.log(`   To: ${data.employerEmail}`);
      this.logger.log(`   Subject: ${subject}`);
      this.logger.log(`   Company: ${data.companyName}`);
      this.logger.log(`   New applicant: ${data.studentName} (${data.studentEmail})`);
      this.logger.log(`   Internship: ${data.internshipTitle}`);
      this.logger.log(`   Applied: ${data.appliedDate}`);

      // Simulate async email sending
      await new Promise((resolve) => setTimeout(resolve, 100));

      this.logger.log('✅ Application notification sent successfully');
    } catch (error) {
      // Log error but don't throw - email failures shouldn't block the request
      this.logger.error(
        `❌ Failed to send application notification to ${data.employerEmail}`,
        error.stack,
      );
    }
  }
}
