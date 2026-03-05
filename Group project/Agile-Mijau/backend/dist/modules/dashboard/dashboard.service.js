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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("../students/entities/student.entity");
const application_entity_1 = require("../applications/entities/application.entity");
const internship_entity_1 = require("../internships/entities/internship.entity");
const company_entity_1 = require("../companies/entities/company.entity");
const diary_entry_entity_1 = require("../diary/entities/diary-entry.entity");
const application_status_enum_1 = require("../../common/enums/application-status.enum");
const internship_status_enum_1 = require("../../common/enums/internship-status.enum");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let DashboardService = class DashboardService {
    studentsRepository;
    applicationsRepository;
    internshipsRepository;
    companiesRepository;
    diaryRepository;
    constructor(studentsRepository, applicationsRepository, internshipsRepository, companiesRepository, diaryRepository) {
        this.studentsRepository = studentsRepository;
        this.applicationsRepository = applicationsRepository;
        this.internshipsRepository = internshipsRepository;
        this.companiesRepository = companiesRepository;
        this.diaryRepository = diaryRepository;
    }
    async getStudentDashboard(studentId) {
        const activeApplications = await this.applicationsRepository.count({
            where: {
                studentId,
                status: application_status_enum_1.ApplicationStatus.PENDING,
            },
        });
        const approvedApplications = await this.applicationsRepository.find({
            where: {
                studentId,
                status: application_status_enum_1.ApplicationStatus.APPROVED,
            },
            relations: ['internship', 'internship.company'],
            order: { statusChangedAt: 'DESC' },
        });
        const activeInternships = approvedApplications.length;
        let activeInternship;
        if (approvedApplications.length > 0) {
            const app = approvedApplications[0];
            if (app.internship) {
                activeInternship = {
                    id: app.internship.id,
                    title: app.internship.title,
                    companyName: app.internship.company?.name || 'Unknown Company',
                    status: app.internship.status,
                    grade: app.internship.grade ?? undefined,
                    gradeComment: app.internship.gradeComment ?? undefined,
                };
            }
        }
        return {
            activeApplications,
            activeInternships,
            activeInternship,
        };
    }
    async getEmployerDashboard(companyId) {
        const activeInternships = await this.internshipsRepository.count({
            where: {
                companyId,
                status: internship_status_enum_1.InternshipStatus.ACTIVE,
            },
        });
        const internships = await this.internshipsRepository.find({
            where: { companyId },
            select: ['id'],
        });
        const internshipIds = internships.map(i => i.id);
        let totalApplications = 0;
        let pendingApplications = 0;
        if (internshipIds.length > 0) {
            totalApplications = await this.applicationsRepository
                .createQueryBuilder('app')
                .where('app.internshipId IN (:...ids)', { ids: internshipIds })
                .getCount();
            pendingApplications = await this.applicationsRepository
                .createQueryBuilder('app')
                .where('app.internshipId IN (:...ids)', { ids: internshipIds })
                .andWhere('app.status = :status', { status: application_status_enum_1.ApplicationStatus.PENDING })
                .getCount();
        }
        return {
            activeInternships,
            totalApplications,
            pendingApplications,
        };
    }
    async getMentorDashboard(mentorId, role) {
        let assignedStudents = 0;
        let pendingReviews = 0;
        if (role === user_role_enum_1.UserRole.ACADEMIC_MENTOR) {
            assignedStudents = await this.studentsRepository.count({
                where: { academicMentorId: mentorId },
            });
            const students = await this.studentsRepository.find({
                where: { academicMentorId: mentorId },
                select: ['id'],
            });
            const studentIds = students.map(s => s.id);
            if (studentIds.length > 0) {
                pendingReviews = await this.diaryRepository
                    .createQueryBuilder('diary')
                    .where('diary.studentId IN (:...ids)', { ids: studentIds })
                    .andWhere('diary.isApproved = :approved', { approved: false })
                    .getCount();
            }
        }
        return {
            assignedStudents,
            pendingReviews,
        };
    }
    async getAdminDashboard() {
        const totalStudents = await this.studentsRepository.count();
        const totalCompanies = await this.companiesRepository.count();
        const totalInternships = await this.internshipsRepository.count();
        const activeInternships = await this.internshipsRepository.count({
            where: { status: internship_status_enum_1.InternshipStatus.ACTIVE },
        });
        return {
            totalStudents,
            totalCompanies,
            totalInternships,
            activeInternships,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(1, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __param(2, (0, typeorm_1.InjectRepository)(internship_entity_1.Internship)),
    __param(3, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __param(4, (0, typeorm_1.InjectRepository)(diary_entry_entity_1.DiaryEntry)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map