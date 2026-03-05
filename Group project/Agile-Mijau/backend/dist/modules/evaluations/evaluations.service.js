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
exports.EvaluationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const company_mentor_evaluation_entity_1 = require("./entities/company-mentor-evaluation.entity");
const internship_entity_1 = require("../internships/entities/internship.entity");
const company_mentor_entity_1 = require("../mentors/entities/company-mentor.entity");
const application_entity_1 = require("../applications/entities/application.entity");
const internship_status_enum_1 = require("../../common/enums/internship-status.enum");
const application_status_enum_1 = require("../../common/enums/application-status.enum");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let EvaluationsService = class EvaluationsService {
    evaluationsRepository;
    internshipsRepository;
    companyMentorsRepository;
    applicationsRepository;
    constructor(evaluationsRepository, internshipsRepository, companyMentorsRepository, applicationsRepository) {
        this.evaluationsRepository = evaluationsRepository;
        this.internshipsRepository = internshipsRepository;
        this.companyMentorsRepository = companyMentorsRepository;
        this.applicationsRepository = applicationsRepository;
    }
    async create(createEvaluationDto) {
        const internship = await this.internshipsRepository.findOne({
            where: { id: createEvaluationDto.internshipId },
        });
        if (!internship) {
            throw new common_1.NotFoundException('Internship not found');
        }
        if (![internship_status_enum_1.InternshipStatus.ACTIVE, internship_status_enum_1.InternshipStatus.COMPLETED].includes(internship.status)) {
            throw new common_1.BadRequestException('Can only evaluate ACTIVE or COMPLETED internships');
        }
        const existingEvaluation = await this.evaluationsRepository.findOne({
            where: { internshipId: createEvaluationDto.internshipId },
        });
        if (existingEvaluation) {
            throw new common_1.BadRequestException('Evaluation for this internship already exists');
        }
        const evaluation = this.evaluationsRepository.create(createEvaluationDto);
        return await this.evaluationsRepository.save(evaluation);
    }
    async findByInternship(internshipId) {
        const evaluation = await this.evaluationsRepository.findOne({
            where: { internshipId },
            relations: ['mentor', 'internship'],
        });
        return evaluation;
    }
    async checkCompanyEvaluationCompleted(internshipId) {
        const evaluation = await this.evaluationsRepository.findOne({
            where: { internshipId },
        });
        return !!evaluation;
    }
    async findOne(id) {
        const evaluation = await this.evaluationsRepository.findOne({
            where: { id },
            relations: ['mentor', 'internship'],
        });
        if (!evaluation) {
            throw new common_1.NotFoundException('Evaluation not found');
        }
        return evaluation;
    }
    async submitCompanyEvaluation(internshipId, mentorUserId, dto) {
        const internship = await this.internshipsRepository.findOne({
            where: { id: internshipId },
            relations: ['company'],
        });
        if (!internship) {
            throw new common_1.NotFoundException('Internship not found');
        }
        const companyMentor = await this.companyMentorsRepository.findOne({
            where: { userId: mentorUserId },
        });
        if (!companyMentor) {
            throw new common_1.ForbiddenException('Only company mentors can submit evaluations');
        }
        if (companyMentor.companyId !== internship.companyId) {
            throw new common_1.ForbiddenException('You can only evaluate internships from your company');
        }
        const existingEvaluation = await this.evaluationsRepository.findOne({
            where: { internshipId },
        });
        if (existingEvaluation && existingEvaluation.isLocked) {
            throw new common_1.BadRequestException('Evaluation for this internship is already submitted and locked');
        }
        const evaluation = this.evaluationsRepository.create({
            internshipId,
            mentorId: companyMentor.id,
            rating: dto.rating,
            technicalSkills: dto.technicalSkills,
            communication: dto.communication,
            workEthic: dto.workEthic,
            overallPerformance: dto.overallPerformance,
            recommendations: dto.recommendations,
            isLocked: true,
        });
        const savedEvaluation = await this.evaluationsRepository.save(evaluation);
        internship.status = internship_status_enum_1.InternshipStatus.COMPLETED;
        await this.internshipsRepository.save(internship);
        return savedEvaluation;
    }
    async verifyStudentAccess(internshipId, studentId) {
        const application = await this.applicationsRepository.findOne({
            where: {
                internshipId,
                studentId,
                status: application_status_enum_1.ApplicationStatus.APPROVED,
            },
        });
        return !!application;
    }
    async deleteByInternship(internshipId, userId, role) {
        const evaluation = await this.evaluationsRepository.findOne({
            where: { internshipId },
            relations: ['internship'],
        });
        if (!evaluation) {
            throw new common_1.NotFoundException('Evaluacija nije pronađena');
        }
        if (role === user_role_enum_1.UserRole.COMPANY_MENTOR) {
            const companyMentor = await this.companyMentorsRepository.findOne({
                where: { userId },
            });
            if (!companyMentor) {
                throw new common_1.ForbiddenException('Mentor iz tvrtke nije pronađen');
            }
            if (evaluation.internship.companyId !== companyMentor.companyId) {
                throw new common_1.ForbiddenException('Možete brisati samo evaluacije za prakse vaše tvrtke');
            }
        }
        await this.evaluationsRepository.remove(evaluation);
    }
};
exports.EvaluationsService = EvaluationsService;
exports.EvaluationsService = EvaluationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(company_mentor_evaluation_entity_1.CompanyMentorEvaluation)),
    __param(1, (0, typeorm_1.InjectRepository)(internship_entity_1.Internship)),
    __param(2, (0, typeorm_1.InjectRepository)(company_mentor_entity_1.CompanyMentor)),
    __param(3, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], EvaluationsService);
//# sourceMappingURL=evaluations.service.js.map