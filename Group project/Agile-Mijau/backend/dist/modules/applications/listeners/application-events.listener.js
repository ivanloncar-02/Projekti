"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ApplicationEventsListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationEventsListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const application_entity_1 = require("../entities/application.entity");
const application_events_1 = require("../events/application.events");
const notifications_service_1 = require("../../notifications/notifications.service");
const notification_entity_1 = require("../../notifications/entities/notification.entity");
let ApplicationEventsListener = ApplicationEventsListener_1 = class ApplicationEventsListener {
    applicationsRepository;
    notificationsService;
    logger = new common_1.Logger(ApplicationEventsListener_1.name);
    constructor(applicationsRepository, notificationsService) {
        this.applicationsRepository = applicationsRepository;
        this.notificationsService = notificationsService;
    }
    async prepareNotificationData(applicationId) {
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
    async handleApplicationCreated(event) {
        const notificationData = await this.prepareNotificationData(event.applicationId);
        if (notificationData) {
            this.logger.log(`New application: ${notificationData.studentName} applied to ${notificationData.internshipTitle} at ${notificationData.companyName}`);
        }
    }
    async handleStatusChanged(event) {
        const notificationData = await this.prepareNotificationData(event.applicationId);
        if (notificationData) {
            this.logger.log(`Application status changed to ${event.newStatus}: ${notificationData.studentName} - ${notificationData.internshipTitle}`);
            try {
                let title;
                let message;
                let relatedUrl;
                if (event.newStatus === 'APPROVED') {
                    title = 'Prijava odobrena!';
                    message = `Vaša prijava za "${notificationData.internshipTitle}" u tvrtki ${notificationData.companyName} je odobrena. Možete započeti s praksom.`;
                    relatedUrl = `/student/my-internship/${notificationData.internshipId}`;
                }
                else if (event.newStatus === 'REJECTED') {
                    title = 'Prijava odbijena';
                    message = `Nažalost, vaša prijava za "${notificationData.internshipTitle}" u tvrtki ${notificationData.companyName} nije prihvaćena.`;
                    relatedUrl = '/student/applications';
                }
                else {
                    title = 'Status prijave promijenjen';
                    message = `Status vaše prijave za "${notificationData.internshipTitle}" je promijenjen na ${event.newStatus}.`;
                    relatedUrl = '/student/applications';
                }
                await this.notificationsService.create({
                    userId: notificationData.studentUserId,
                    type: notification_entity_1.NotificationType.APPLICATION_STATUS,
                    title,
                    message,
                    relatedId: event.applicationId,
                    relatedUrl,
                });
                this.logger.log(`Notification sent to student ${notificationData.studentName}`);
            }
            catch (error) {
                this.logger.error(`Failed to send notification to student: ${error}`);
            }
        }
    }
};
exports.ApplicationEventsListener = ApplicationEventsListener;
__decorate([
    (0, event_emitter_1.OnEvent)('application.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [application_events_1.ApplicationCreatedEvent]),
    __metadata("design:returntype", Promise)
], ApplicationEventsListener.prototype, "handleApplicationCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('application.status.changed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [application_events_1.ApplicationStatusChangedEvent]),
    __metadata("design:returntype", Promise)
], ApplicationEventsListener.prototype, "handleStatusChanged", null);
exports.ApplicationEventsListener = ApplicationEventsListener = ApplicationEventsListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], ApplicationEventsListener);
//# sourceMappingURL=application-events.listener.js.map