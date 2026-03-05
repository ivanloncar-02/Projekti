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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("../students/entities/student.entity");
const academic_mentor_entity_1 = require("../mentors/entities/academic-mentor.entity");
const user_entity_1 = require("../users/entities/user.entity");
const application_entity_1 = require("../applications/entities/application.entity");
const assign_mentor_dto_1 = require("./dto/assign-mentor.dto");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const application_status_enum_1 = require("../../common/enums/application-status.enum");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_entity_1 = require("../notifications/entities/notification.entity");
let AdminService = class AdminService {
    studentRepository;
    academicMentorRepository;
    userRepository;
    applicationRepository;
    notificationsService;
    constructor(studentRepository, academicMentorRepository, userRepository, applicationRepository, notificationsService) {
        this.studentRepository = studentRepository;
        this.academicMentorRepository = academicMentorRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.notificationsService = notificationsService;
    }
    async assignMentor(dto) {
        const student = await this.studentRepository.findOne({
            where: { id: dto.studentId },
            relations: ['user', 'academicMentor', 'companyMentor'],
        });
        if (!student) {
            throw new common_1.NotFoundException('Student nije pronađen');
        }
        let mentorUserId = null;
        let mentorTypeLabel = '';
        if (dto.mentorType === assign_mentor_dto_1.MentorType.ACADEMIC_MENTOR) {
            const academicMentor = await this.academicMentorRepository.findOne({
                where: { userId: dto.mentorId },
                relations: ['user'],
            });
            if (!academicMentor) {
                throw new common_1.NotFoundException('Akademski mentor nije pronađen');
            }
            student.academicMentorId = academicMentor.id;
            mentorUserId = academicMentor.userId;
            mentorTypeLabel = 'akademski mentor';
        }
        else if (dto.mentorType === assign_mentor_dto_1.MentorType.COMPANY_MENTOR) {
            const companyMentor = await this.userRepository.findOne({
                where: { id: dto.mentorId, role: user_role_enum_1.UserRole.COMPANY_MENTOR },
            });
            if (!companyMentor) {
                throw new common_1.NotFoundException('Mentor iz tvrtke nije pronađen');
            }
            student.companyMentorId = companyMentor.id;
            mentorUserId = companyMentor.id;
            mentorTypeLabel = 'mentor iz tvrtke';
        }
        else {
            throw new common_1.BadRequestException('Nepoznata vrsta mentora');
        }
        const savedStudent = await this.studentRepository.save(student);
        if (mentorUserId) {
            const studentName = student.user
                ? `${student.user.firstName} ${student.user.lastName}`
                : 'Student';
            const activeApplication = await this.applicationRepository.findOne({
                where: {
                    studentId: student.id,
                    status: application_status_enum_1.ApplicationStatus.APPROVED,
                },
            });
            let relatedUrl;
            if (dto.mentorType === assign_mentor_dto_1.MentorType.ACADEMIC_MENTOR) {
                relatedUrl = activeApplication
                    ? `/mentor/academic/internships/${activeApplication.internshipId}`
                    : '/mentor/academic/dashboard';
            }
            else {
                relatedUrl = activeApplication
                    ? `/mentor/company/internships/${activeApplication.internshipId}`
                    : '/mentor/company/dashboard';
            }
            await this.notificationsService.create({
                userId: mentorUserId,
                type: notification_entity_1.NotificationType.STUDENT_ASSIGNED,
                title: 'Novi student dodijeljen',
                message: `Dodijeljen vam je student ${studentName} kao ${mentorTypeLabel}.`,
                relatedId: activeApplication?.internshipId || student.id,
                relatedUrl,
            });
        }
        return savedStudent;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(1, (0, typeorm_1.InjectRepository)(academic_mentor_entity_1.AcademicMentor)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], AdminService);
//# sourceMappingURL=admin.service.js.map