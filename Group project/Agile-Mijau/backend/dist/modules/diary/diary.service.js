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
exports.DiaryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const diary_entry_entity_1 = require("./entities/diary-entry.entity");
const company_mentor_entity_1 = require("../mentors/entities/company-mentor.entity");
const academic_mentor_entity_1 = require("../mentors/entities/academic-mentor.entity");
const student_entity_1 = require("../students/entities/student.entity");
const application_entity_1 = require("../applications/entities/application.entity");
const internship_entity_1 = require("../internships/entities/internship.entity");
const application_status_enum_1 = require("../../common/enums/application-status.enum");
const internship_status_enum_1 = require("../../common/enums/internship-status.enum");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_entity_1 = require("../notifications/entities/notification.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let DiaryService = class DiaryService {
    diaryRepository;
    companyMentorsRepository;
    academicMentorsRepository;
    studentsRepository;
    applicationsRepository;
    internshipsRepository;
    notificationsService;
    constructor(diaryRepository, companyMentorsRepository, academicMentorsRepository, studentsRepository, applicationsRepository, internshipsRepository, notificationsService) {
        this.diaryRepository = diaryRepository;
        this.companyMentorsRepository = companyMentorsRepository;
        this.academicMentorsRepository = academicMentorsRepository;
        this.studentsRepository = studentsRepository;
        this.applicationsRepository = applicationsRepository;
        this.internshipsRepository = internshipsRepository;
        this.notificationsService = notificationsService;
    }
    async create(studentId, createDiaryEntryDto) {
        if (createDiaryEntryDto.internshipId) {
            const internship = await this.internshipsRepository.findOne({
                where: { id: createDiaryEntryDto.internshipId },
            });
            if (!internship) {
                throw new common_1.NotFoundException('Praksa nije pronađena');
            }
            if ([internship_status_enum_1.InternshipStatus.COMPLETED, internship_status_enum_1.InternshipStatus.GRADED].includes(internship.status)) {
                throw new common_1.BadRequestException('Ne možete dodavati dnevničke unose za završenu ili ocijenjenu praksu');
            }
        }
        const entryDate = new Date(createDiaryEntryDto.date);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (entryDate > today) {
            throw new common_1.BadRequestException('Datum dnevničkog unosa ne može biti u budućnosti');
        }
        const diaryEntry = this.diaryRepository.create({
            ...createDiaryEntryDto,
            studentId,
        });
        const savedEntry = await this.diaryRepository.save(diaryEntry);
        this.notifyAcademicMentor(studentId, savedEntry).catch((error) => {
            console.error('Error sending diary notification:', error);
        });
        return savedEntry;
    }
    async notifyAcademicMentor(studentId, diaryEntry) {
        const student = await this.studentsRepository.findOne({
            where: { id: studentId },
            relations: ['user', 'academicMentor'],
        });
        if (!student?.academicMentor?.userId) {
            return;
        }
        const studentName = student.user
            ? `${student.user.firstName} ${student.user.lastName}`
            : 'Student';
        const entryDate = new Date(diaryEntry.date).toLocaleDateString('hr-HR');
        await this.notificationsService.create({
            userId: student.academicMentor.userId,
            type: notification_entity_1.NotificationType.DIARY_ENTRY_SUBMITTED,
            title: 'Nova dnevnička aktivnost',
            message: `${studentName} je unio/la aktivnost za ${entryDate}.`,
            relatedId: diaryEntry.id,
            relatedUrl: `/mentor/academic/internships/${diaryEntry.internshipId}`,
        });
    }
    async findAllByStudent(studentId) {
        const entries = await this.diaryRepository.find({
            where: { studentId },
            relations: ['internship', 'approver'],
            order: { date: 'DESC' },
        });
        return entries || [];
    }
    async findAllByInternship(internshipId, userId, role, studentId) {
        if (role === user_role_enum_1.UserRole.STUDENT && studentId) {
            await this.verifyStudentAccess(internshipId, studentId);
        }
        if (role === user_role_enum_1.UserRole.ACADEMIC_MENTOR && userId) {
            await this.verifyAcademicMentorAccess(internshipId, userId);
        }
        if (role === user_role_enum_1.UserRole.COMPANY_MENTOR && userId) {
            await this.verifyCompanyMentorAccess(internshipId, userId);
        }
        const entries = await this.diaryRepository.find({
            where: { internshipId },
            relations: ['student', 'student.user', 'approver'],
            order: { date: 'DESC' },
        });
        return entries || [];
    }
    async verifyStudentAccess(internshipId, studentId) {
        const application = await this.applicationsRepository.findOne({
            where: {
                internshipId,
                studentId,
                status: application_status_enum_1.ApplicationStatus.APPROVED,
            },
        });
        if (!application) {
            throw new common_1.ForbiddenException('Možete pregledavati samo dnevničke unose za vlastite prakse');
        }
    }
    async verifyAcademicMentorAccess(internshipId, userId) {
        const academicMentor = await this.academicMentorsRepository.findOne({
            where: { userId },
        });
        if (!academicMentor) {
            throw new common_1.ForbiddenException('Academic mentor not found');
        }
        const application = await this.applicationsRepository.findOne({
            where: {
                internshipId,
                status: application_status_enum_1.ApplicationStatus.APPROVED,
            },
            relations: ['student'],
        });
        if (!application) {
            throw new common_1.NotFoundException('No approved application found for this internship');
        }
        if (application.student.academicMentorId !== academicMentor.id) {
            throw new common_1.ForbiddenException('Možete pregledavati samo dnevničke unose studenata koji su vam dodijeljeni');
        }
    }
    async verifyCompanyMentorAccess(internshipId, userId) {
        const companyMentor = await this.companyMentorsRepository.findOne({
            where: { userId },
        });
        if (!companyMentor) {
            throw new common_1.ForbiddenException('Mentor iz tvrtke nije pronađen');
        }
        const application = await this.applicationsRepository.findOne({
            where: {
                internshipId,
                status: application_status_enum_1.ApplicationStatus.APPROVED,
            },
            relations: ['internship'],
        });
        if (!application || !application.internship) {
            throw new common_1.NotFoundException('Nema odobrene prijave za ovu praksu');
        }
        if (application.internship.companyId !== companyMentor.companyId) {
            throw new common_1.ForbiddenException('Možete pregledavati samo dnevničke unose za prakse vaše tvrtke');
        }
    }
    async findOne(id) {
        const entry = await this.diaryRepository.findOne({
            where: { id },
            relations: ['student', 'student.user', 'internship', 'approver'],
        });
        if (!entry) {
            throw new common_1.NotFoundException('Diary entry not found');
        }
        return entry;
    }
    async update(id, studentId, updateDiaryEntryDto) {
        const entry = await this.findOne(id);
        if (entry.studentId !== studentId) {
            throw new common_1.ForbiddenException('You can only edit your own diary entries');
        }
        if (entry.approved) {
            throw new common_1.BadRequestException('Cannot edit approved diary entries');
        }
        if (updateDiaryEntryDto.date) {
            const entryDate = new Date(updateDiaryEntryDto.date);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            if (entryDate > today) {
                throw new common_1.BadRequestException('Diary entry date cannot be in the future');
            }
        }
        Object.assign(entry, updateDiaryEntryDto);
        return await this.diaryRepository.save(entry);
    }
    async approveDiaryEntry(id, userId, comment) {
        const entry = await this.diaryRepository.findOne({
            where: { id },
            relations: ['student', 'student.user', 'internship', 'approver'],
        });
        if (!entry) {
            throw new common_1.NotFoundException('Diary entry not found');
        }
        if (entry.approved) {
            throw new common_1.BadRequestException('Diary entry is already approved');
        }
        const companyMentor = await this.companyMentorsRepository.findOne({
            where: { userId },
        });
        if (!companyMentor) {
            throw new common_1.ForbiddenException('Only company mentors can approve diary entries');
        }
        if (companyMentor.companyId !== entry.internship.companyId) {
            throw new common_1.ForbiddenException('You can only approve diary entries for your company\'s internships');
        }
        entry.approved = true;
        entry.approvedAt = new Date();
        entry.approvedBy = companyMentor.id;
        entry.mentorComment = comment || null;
        return await this.diaryRepository.save(entry);
    }
    async delete(id, studentId) {
        const entry = await this.findOne(id);
        if (entry.studentId !== studentId) {
            throw new common_1.ForbiddenException('You can only delete your own diary entries');
        }
        if (entry.approved) {
            throw new common_1.BadRequestException('Cannot delete approved diary entries');
        }
        await this.diaryRepository.remove(entry);
    }
    async addComment(id, mentorUserId, comment) {
        const entry = await this.diaryRepository.findOne({
            where: { id },
            relations: ['student', 'internship'],
        });
        if (!entry) {
            throw new common_1.NotFoundException('Diary entry not found');
        }
        const companyMentor = await this.companyMentorsRepository.findOne({
            where: { userId: mentorUserId },
            relations: ['company'],
        });
        if (!companyMentor) {
            throw new common_1.ForbiddenException('Only company mentors can comment on diary entries');
        }
        if (companyMentor.companyId !== entry.internship.companyId) {
            throw new common_1.ForbiddenException('You can only comment on diary entries for your company\'s internships');
        }
        entry.mentorComment = comment;
        return await this.diaryRepository.save(entry);
    }
};
exports.DiaryService = DiaryService;
exports.DiaryService = DiaryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(diary_entry_entity_1.DiaryEntry)),
    __param(1, (0, typeorm_1.InjectRepository)(company_mentor_entity_1.CompanyMentor)),
    __param(2, (0, typeorm_1.InjectRepository)(academic_mentor_entity_1.AcademicMentor)),
    __param(3, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(4, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __param(5, (0, typeorm_1.InjectRepository)(internship_entity_1.Internship)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], DiaryService);
//# sourceMappingURL=diary.service.js.map