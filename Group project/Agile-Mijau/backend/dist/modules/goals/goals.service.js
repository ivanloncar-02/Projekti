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
exports.GoalsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const goal_entity_1 = require("./entities/goal.entity");
const academic_mentor_entity_1 = require("../mentors/entities/academic-mentor.entity");
const company_mentor_entity_1 = require("../mentors/entities/company-mentor.entity");
const student_entity_1 = require("../students/entities/student.entity");
const application_entity_1 = require("../applications/entities/application.entity");
const internship_entity_1 = require("../internships/entities/internship.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const application_status_enum_1 = require("../../common/enums/application-status.enum");
const internship_status_enum_1 = require("../../common/enums/internship-status.enum");
let GoalsService = class GoalsService {
    goalsRepository;
    academicMentorsRepository;
    companyMentorsRepository;
    studentsRepository;
    applicationsRepository;
    internshipsRepository;
    constructor(goalsRepository, academicMentorsRepository, companyMentorsRepository, studentsRepository, applicationsRepository, internshipsRepository) {
        this.goalsRepository = goalsRepository;
        this.academicMentorsRepository = academicMentorsRepository;
        this.companyMentorsRepository = companyMentorsRepository;
        this.studentsRepository = studentsRepository;
        this.applicationsRepository = applicationsRepository;
        this.internshipsRepository = internshipsRepository;
    }
    async create(studentId, createGoalDto) {
        if (createGoalDto.internshipId) {
            const internship = await this.internshipsRepository.findOne({
                where: { id: createGoalDto.internshipId },
            });
            if (!internship) {
                throw new common_1.NotFoundException('Praksa nije pronađena');
            }
            if ([internship_status_enum_1.InternshipStatus.COMPLETED, internship_status_enum_1.InternshipStatus.GRADED].includes(internship.status)) {
                throw new common_1.BadRequestException('Ne možete dodavati ciljeve za završenu ili ocijenjenu praksu');
            }
        }
        const goal = this.goalsRepository.create({
            ...createGoalDto,
            studentId,
        });
        return await this.goalsRepository.save(goal);
    }
    async findAll(studentId, internshipId, userId, role) {
        if (role === user_role_enum_1.UserRole.ACADEMIC_MENTOR && userId && studentId) {
            await this.verifyAcademicMentorAccessToStudent(studentId, userId);
        }
        if (role === user_role_enum_1.UserRole.COMPANY_MENTOR && userId && internshipId) {
            await this.verifyCompanyMentorAccessToInternship(internshipId, userId);
        }
        const queryBuilder = this.goalsRepository
            .createQueryBuilder('goal');
        if (studentId) {
            queryBuilder.where('goal.studentId = :studentId', { studentId });
        }
        if (internshipId) {
            queryBuilder.andWhere('goal.internshipId = :internshipId', {
                internshipId,
            });
        }
        const goals = await queryBuilder
            .orderBy('goal.createdAt', 'DESC')
            .getMany();
        return goals || [];
    }
    async verifyAcademicMentorAccessToStudent(studentId, userId) {
        const academicMentor = await this.academicMentorsRepository.findOne({
            where: { userId },
        });
        if (!academicMentor) {
            throw new common_1.ForbiddenException('Academic mentor not found');
        }
        const student = await this.studentsRepository.findOne({
            where: { id: studentId },
        });
        if (!student) {
            throw new common_1.NotFoundException('Student not found');
        }
        if (student.academicMentorId !== academicMentor.id) {
            throw new common_1.ForbiddenException('You can only view goals for students assigned to you');
        }
    }
    async verifyCompanyMentorAccessToInternship(internshipId, userId) {
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
            throw new common_1.ForbiddenException('Možete postavljati ciljeve samo za prakse vaše tvrtke');
        }
    }
    async createForStudent(internshipId, userId, createGoalDto) {
        await this.verifyCompanyMentorAccessToInternship(internshipId, userId);
        const application = await this.applicationsRepository.findOne({
            where: {
                internshipId,
                status: application_status_enum_1.ApplicationStatus.APPROVED,
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Nema odobrene prijave za ovu praksu');
        }
        const goal = this.goalsRepository.create({
            ...createGoalDto,
            studentId: application.studentId,
            internshipId,
        });
        return await this.goalsRepository.save(goal);
    }
    async findOne(id) {
        const goal = await this.goalsRepository.findOne({
            where: { id },
            relations: ['student', 'internship'],
        });
        if (!goal) {
            throw new common_1.NotFoundException('Goal not found');
        }
        return goal;
    }
    async complete(id, studentId) {
        const goal = await this.findOne(id);
        if (goal.studentId !== studentId) {
            throw new common_1.ForbiddenException('You can only complete your own goals');
        }
        goal.completed = true;
        goal.completedAt = new Date();
        return await this.goalsRepository.save(goal);
    }
    async verifyOwnership(goalId, studentId) {
        const goal = await this.goalsRepository.findOne({
            where: { id: goalId, studentId },
        });
        return !!goal;
    }
};
exports.GoalsService = GoalsService;
exports.GoalsService = GoalsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(goal_entity_1.Goal)),
    __param(1, (0, typeorm_1.InjectRepository)(academic_mentor_entity_1.AcademicMentor)),
    __param(2, (0, typeorm_1.InjectRepository)(company_mentor_entity_1.CompanyMentor)),
    __param(3, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(4, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __param(5, (0, typeorm_1.InjectRepository)(internship_entity_1.Internship)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], GoalsService);
//# sourceMappingURL=goals.service.js.map