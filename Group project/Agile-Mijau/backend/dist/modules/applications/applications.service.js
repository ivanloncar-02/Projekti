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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const application_entity_1 = require("./entities/application.entity");
const internship_entity_1 = require("../internships/entities/internship.entity");
const user_entity_1 = require("../users/entities/user.entity");
const internship_status_enum_1 = require("../../common/enums/internship-status.enum");
const application_status_enum_1 = require("../../common/enums/application-status.enum");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const email_service_1 = require("../email/email.service");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_entity_1 = require("../notifications/entities/notification.entity");
const application_events_1 = require("./events/application.events");
let ApplicationsService = class ApplicationsService {
    applicationsRepository;
    internshipsRepository;
    usersRepository;
    eventEmitter;
    emailService;
    notificationsService;
    constructor(applicationsRepository, internshipsRepository, usersRepository, eventEmitter, emailService, notificationsService) {
        this.applicationsRepository = applicationsRepository;
        this.internshipsRepository = internshipsRepository;
        this.usersRepository = usersRepository;
        this.eventEmitter = eventEmitter;
        this.emailService = emailService;
        this.notificationsService = notificationsService;
    }
    async create(createApplicationDto) {
        const internship = await this.internshipsRepository.findOne({
            where: { id: createApplicationDto.internshipId },
        });
        if (!internship) {
            throw new common_1.NotFoundException('Internship not found');
        }
        if (internship.status !== internship_status_enum_1.InternshipStatus.ACTIVE) {
            throw new common_1.BadRequestException('This internship is no longer accepting applications');
        }
        const now = new Date();
        if (internship.endDate && new Date(internship.endDate) < now) {
            throw new common_1.BadRequestException('Application deadline has passed');
        }
        const existingApplication = await this.applicationsRepository.findOne({
            where: {
                internshipId: createApplicationDto.internshipId,
                studentId: createApplicationDto.studentId,
            },
        });
        if (existingApplication) {
            throw new common_1.ConflictException('You have already applied for this internship');
        }
        const application = this.applicationsRepository.create({
            ...createApplicationDto,
            status: application_status_enum_1.ApplicationStatus.PENDING,
        });
        const savedApplication = await this.applicationsRepository.save(application);
        this.eventEmitter.emit('application.created', new application_events_1.ApplicationCreatedEvent(savedApplication.id, savedApplication.studentId, savedApplication.internshipId, internship.companyId));
        this.sendEmployerNotification(savedApplication.id).catch((error) => {
        });
        this.sendEmployerInAppNotification(savedApplication.id, internship.companyId).catch((error) => {
        });
        return savedApplication;
    }
    async sendEmployerInAppNotification(applicationId, companyId) {
        try {
            const application = await this.applicationsRepository.findOne({
                where: { id: applicationId },
                relations: ['student', 'student.user', 'internship'],
            });
            if (!application || !application.student?.user)
                return;
            const employers = await this.usersRepository.find({
                where: { companyId, role: user_role_enum_1.UserRole.EMPLOYER },
            });
            const studentName = `${application.student.user.firstName} ${application.student.user.lastName}`;
            const internshipTitle = application.internship?.title || 'praksu';
            const internshipId = application.internship?.id;
            for (const employer of employers) {
                await this.notificationsService.create({
                    userId: employer.id,
                    type: notification_entity_1.NotificationType.APPLICATION_STATUS,
                    title: 'Nova prijava na praksu',
                    message: `${studentName} se prijavio/la na "${internshipTitle}".`,
                    relatedId: applicationId,
                    relatedUrl: `/employer/internships/${internshipId}/applicants`,
                });
            }
        }
        catch (error) {
            console.error('Error sending in-app notification:', error);
        }
    }
    async sendEmployerNotification(applicationId) {
        try {
            const notificationData = await this.prepareNotificationData(applicationId);
            await this.emailService.sendApplicationNotification(notificationData);
        }
        catch (error) {
        }
    }
    async checkIfApplied(studentId, internshipId) {
        const application = await this.applicationsRepository.findOne({
            where: {
                studentId,
                internshipId,
            },
        });
        return { hasApplied: !!application };
    }
    async findByStudent(studentId, status) {
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
    async verifyInternshipOwnership(internshipId, companyId) {
        const internship = await this.internshipsRepository.findOne({
            where: { id: internshipId },
        });
        return internship?.companyId === companyId;
    }
    async findByInternship(internshipId, status) {
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
    async findOne(id) {
        const application = await this.applicationsRepository.findOne({
            where: { id },
            relations: ['internship', 'internship.company', 'student', 'student.user'],
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        return application;
    }
    async updateStatus(id, newStatus, userId, companyId) {
        const application = await this.findOne(id);
        const oldStatus = application.status;
        if (companyId && application.internship.companyId !== companyId) {
            throw new common_1.ForbiddenException('You can only update applications for your own internships');
        }
        if (application.status === application_status_enum_1.ApplicationStatus.APPROVED ||
            application.status === application_status_enum_1.ApplicationStatus.REJECTED) {
            throw new common_1.BadRequestException(`Cannot change status of ${application.status.toLowerCase()} application`);
        }
        application.status = newStatus;
        application.statusChangedAt = new Date();
        if (userId) {
            application.statusChangedBy = userId;
        }
        const updatedApplication = await this.applicationsRepository.save(application);
        this.eventEmitter.emit('application.status.changed', new application_events_1.ApplicationStatusChangedEvent(updatedApplication.id, oldStatus, newStatus, updatedApplication.studentId));
        this.sendStatusChangeEmail(id, newStatus).catch((error) => {
        });
        return updatedApplication;
    }
    async sendStatusChangeEmail(applicationId, newStatus) {
        try {
            const notificationData = await this.prepareNotificationData(applicationId);
            if (newStatus === application_status_enum_1.ApplicationStatus.APPROVED) {
                await this.emailService.sendApprovalEmail(notificationData);
            }
            else if (newStatus === application_status_enum_1.ApplicationStatus.REJECTED) {
                await this.emailService.sendRejectionEmail(notificationData);
            }
        }
        catch (error) {
        }
    }
    async prepareNotificationData(applicationId) {
        const application = await this.applicationsRepository.findOne({
            where: { id: applicationId },
            relations: ['student', 'student.user', 'internship', 'internship.company'],
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (!application.student?.user) {
            throw new common_1.BadRequestException('Application student or user data is missing');
        }
        if (!application.internship?.company) {
            throw new common_1.BadRequestException('Application internship or company data is missing');
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
    async getApplicationByInternshipAndStudent(internshipId, studentId) {
        return this.applicationsRepository.findOne({
            where: { internshipId, studentId },
        });
    }
    async addDocuments(internshipId, studentId, newDocumentPaths) {
        const application = await this.applicationsRepository.findOne({
            where: { internshipId, studentId },
        });
        if (!application) {
            throw new common_1.NotFoundException('Prijava nije pronađena');
        }
        const existingDocs = application.documentsPaths || [];
        const allDocs = [...existingDocs, ...newDocumentPaths];
        if (allDocs.length > 10) {
            throw new common_1.BadRequestException('Maksimalno 10 dokumenata je dozvoljeno');
        }
        application.documentsPaths = allDocs;
        return this.applicationsRepository.save(application);
    }
    async removeDocument(internshipId, studentId, documentPath) {
        const application = await this.applicationsRepository.findOne({
            where: { internshipId, studentId },
        });
        if (!application) {
            throw new common_1.NotFoundException('Prijava nije pronađena');
        }
        const docs = application.documentsPaths || [];
        application.documentsPaths = docs.filter((d) => d !== documentPath);
        return this.applicationsRepository.save(application);
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __param(1, (0, typeorm_1.InjectRepository)(internship_entity_1.Internship)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2,
        email_service_1.EmailService,
        notifications_service_1.NotificationsService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map