"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
let EmailService = EmailService_1 = class EmailService {
    logger = new common_1.Logger(EmailService_1.name);
    async sendApprovalEmail(data) {
        try {
            const subject = 'Your internship application has been approved';
            this.logger.log(`📧 Sending approval email`);
            this.logger.log(`   To: ${data.studentEmail}`);
            this.logger.log(`   Subject: ${subject}`);
            this.logger.log(`   Student: ${data.studentName}`);
            this.logger.log(`   Internship: ${data.internshipTitle}`);
            this.logger.log(`   Company: ${data.companyName}`);
            this.logger.log(`   Applied: ${data.appliedDate}`);
            await new Promise((resolve) => setTimeout(resolve, 100));
            this.logger.log('✅ Approval email sent successfully');
        }
        catch (error) {
            this.logger.error(`❌ Failed to send approval email to ${data.studentEmail}`, error.stack);
        }
    }
    async sendRejectionEmail(data) {
        try {
            const subject = 'Update on your internship application';
            this.logger.log(`📧 Sending rejection email`);
            this.logger.log(`   To: ${data.studentEmail}`);
            this.logger.log(`   Subject: ${subject}`);
            this.logger.log(`   Student: ${data.studentName}`);
            this.logger.log(`   Internship: ${data.internshipTitle}`);
            this.logger.log(`   Company: ${data.companyName}`);
            this.logger.log(`   Applied: ${data.appliedDate}`);
            await new Promise((resolve) => setTimeout(resolve, 100));
            this.logger.log('✅ Rejection email sent successfully');
        }
        catch (error) {
            this.logger.error(`❌ Failed to send rejection email to ${data.studentEmail}`, error.stack);
        }
    }
    async sendApplicationNotification(data) {
        try {
            const subject = `New application for ${data.internshipTitle}`;
            this.logger.log(`📧 Sending application notification`);
            this.logger.log(`   To: ${data.employerEmail}`);
            this.logger.log(`   Subject: ${subject}`);
            this.logger.log(`   Company: ${data.companyName}`);
            this.logger.log(`   New applicant: ${data.studentName} (${data.studentEmail})`);
            this.logger.log(`   Internship: ${data.internshipTitle}`);
            this.logger.log(`   Applied: ${data.appliedDate}`);
            await new Promise((resolve) => setTimeout(resolve, 100));
            this.logger.log('✅ Application notification sent successfully');
        }
        catch (error) {
            this.logger.error(`❌ Failed to send application notification to ${data.employerEmail}`, error.stack);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)()
], EmailService);
//# sourceMappingURL=email.service.js.map