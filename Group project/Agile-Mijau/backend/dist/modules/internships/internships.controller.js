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
exports.InternshipsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_config_1 = require("../uploads/multer.config");
const internships_service_1 = require("./internships.service");
const create_internship_dto_1 = require("./dto/create-internship.dto");
const update_internship_dto_1 = require("./dto/update-internship.dto");
const update_internship_status_dto_1 = require("./dto/update-internship-status.dto");
const approve_internship_dto_1 = require("./dto/approve-internship.dto");
const submit_grade_dto_1 = require("./dto/submit-grade.dto");
const internship_status_enum_1 = require("../../common/enums/internship-status.enum");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const evaluations_service_1 = require("../evaluations/evaluations.service");
const create_company_evaluation_dto_1 = require("../evaluations/dto/create-company-evaluation.dto");
const applications_service_1 = require("../applications/applications.service");
const apply_to_internship_dto_1 = require("../applications/dto/apply-to-internship.dto");
let InternshipsController = class InternshipsController {
    internshipsService;
    evaluationsService;
    applicationsService;
    constructor(internshipsService, evaluationsService, applicationsService) {
        this.internshipsService = internshipsService;
        this.evaluationsService = evaluationsService;
        this.applicationsService = applicationsService;
    }
    findPublic(page, limit) {
        return this.internshipsService.findPublicInternships(page, limit);
    }
    findOnePublic(id) {
        return this.internshipsService.findOnePublic(id);
    }
    findFiltered(location, company, duration, field, minSalary, maxSalary, page, limit) {
        const filters = {
            location,
            company,
            duration,
            field,
            minSalary,
            maxSalary,
            page,
            limit,
        };
        return this.internshipsService.findFiltered(filters);
    }
    findMyInternships(companyId, page, limit) {
        return this.internshipsService.findByCompany(companyId, page, limit);
    }
    create(createInternshipDto, companyId, role) {
        if (role === user_role_enum_1.UserRole.EMPLOYER) {
            return this.internshipsService.create({
                ...createInternshipDto,
                companyId,
            });
        }
        return this.internshipsService.create(createInternshipDto);
    }
    findAll(page, limit, status, year, student, companyId) {
        return this.internshipsService.findAll(page, limit, {
            status,
            year,
            student,
            companyId,
        });
    }
    findOne(id) {
        return this.internshipsService.findOne(id);
    }
    async update(id, updateInternshipDto, companyId, role) {
        if (role === user_role_enum_1.UserRole.EMPLOYER) {
            const isOwner = await this.internshipsService.verifyOwnership(id, companyId);
            if (!isOwner) {
                throw new common_1.ForbiddenException('You can only update your own internships');
            }
        }
        return this.internshipsService.update(id, updateInternshipDto);
    }
    updateStatus(id, updateStatusDto) {
        return this.internshipsService.updateStatus(id, updateStatusDto.status);
    }
    async remove(id, companyId, role) {
        if (role === user_role_enum_1.UserRole.EMPLOYER) {
            const isOwner = await this.internshipsService.verifyOwnership(id, companyId);
            if (!isOwner) {
                throw new common_1.ForbiddenException('You can only delete your own internships');
            }
        }
        return this.internshipsService.remove(id);
    }
    async archive(id, companyId, role) {
        if (role === user_role_enum_1.UserRole.EMPLOYER) {
            const isOwner = await this.internshipsService.verifyOwnership(id, companyId);
            if (!isOwner) {
                throw new common_1.ForbiddenException('You can only archive your own internships');
            }
        }
        return this.internshipsService.archive(id);
    }
    approve(id, userId, approveDto) {
        return this.internshipsService.approve(id, userId);
    }
    submitGrade(id, submitGradeDto, userId) {
        return this.internshipsService.submitGrade(id, submitGradeDto.grade, userId, submitGradeDto.comment);
    }
    async getCompanyEvaluation(id, studentId, role) {
        if (role === user_role_enum_1.UserRole.STUDENT) {
            const hasAccess = await this.evaluationsService.verifyStudentAccess(id, studentId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('Možete pregledavati samo evaluacije za vlastite prakse');
            }
        }
        return this.evaluationsService.findByInternship(id);
    }
    submitCompanyEvaluation(id, mentorUserId, createEvaluationDto) {
        return this.evaluationsService.submitCompanyEvaluation(id, mentorUserId, createEvaluationDto);
    }
    async applyToInternship(internshipId, studentId, applyDto, files) {
        const cvPath = files?.cv?.[0]
            ? `/api/uploads/documents/${files.cv[0].filename}`
            : undefined;
        const documentsPaths = files?.additionalDocuments?.map((f) => `/api/uploads/documents/${f.filename}`);
        const application = await this.applicationsService.create({
            internshipId,
            studentId,
            coverLetter: applyDto.coverLetter,
            phone: applyDto.phone,
            cvPath,
            documentsPaths,
        });
        return application;
    }
};
exports.InternshipsController = InternshipsController;
__decorate([
    (0, common_1.Get)('public'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], InternshipsController.prototype, "findPublic", null);
__decorate([
    (0, common_1.Get)('public/:id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InternshipsController.prototype, "findOnePublic", null);
__decorate([
    (0, common_1.Get)('filter'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Query)('location')),
    __param(1, (0, common_1.Query)('company', new common_1.ParseUUIDPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('duration', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('field')),
    __param(4, (0, common_1.Query)('minSalary', new common_1.ParseIntPipe({ optional: true }))),
    __param(5, (0, common_1.Query)('maxSalary', new common_1.ParseIntPipe({ optional: true }))),
    __param(6, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(7, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, String, Number, Number, Number, Number]),
    __metadata("design:returntype", void 0)
], InternshipsController.prototype, "findFiltered", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.EMPLOYER),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], InternshipsController.prototype, "findMyInternships", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.EMPLOYER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_internship_dto_1.CreateInternshipDto, String, String]),
    __metadata("design:returntype", void 0)
], InternshipsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('year', new common_1.ParseIntPipe({ optional: true }))),
    __param(4, (0, common_1.Query)('student')),
    __param(5, (0, common_1.Query)('companyId', new common_1.ParseUUIDPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, Number, String, String]),
    __metadata("design:returntype", void 0)
], InternshipsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InternshipsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.EMPLOYER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_internship_dto_1.UpdateInternshipDto, String, String]),
    __metadata("design:returntype", Promise)
], InternshipsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_internship_status_dto_1.UpdateInternshipStatusDto]),
    __metadata("design:returntype", void 0)
], InternshipsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.EMPLOYER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], InternshipsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/archive'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.EMPLOYER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], InternshipsController.prototype, "archive", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, approve_internship_dto_1.ApproveInternshipDto]),
    __metadata("design:returntype", void 0)
], InternshipsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/grade'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ACADEMIC_MENTOR),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, submit_grade_dto_1.SubmitGradeDto, String]),
    __metadata("design:returntype", void 0)
], InternshipsController.prototype, "submitGrade", null);
__decorate([
    (0, common_1.Get)(':id/company-evaluation'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT, user_role_enum_1.UserRole.COMPANY_MENTOR, user_role_enum_1.UserRole.ACADEMIC_MENTOR, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], InternshipsController.prototype, "getCompanyEvaluation", null);
__decorate([
    (0, common_1.Post)(':id/company-evaluation'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.COMPANY_MENTOR),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_company_evaluation_dto_1.CreateCompanyEvaluationDto]),
    __metadata("design:returntype", void 0)
], InternshipsController.prototype, "submitCompanyEvaluation", null);
__decorate([
    (0, common_1.Post)(':id/apply'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'cv', maxCount: 1 },
        { name: 'additionalDocuments', maxCount: 5 },
    ], {
        storage: multer_config_1.multerConfig.documents.storage,
        fileFilter: multer_config_1.multerConfig.documents.fileFilter,
        limits: multer_config_1.multerConfig.documents.limits,
    })),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, apply_to_internship_dto_1.ApplyToInternshipDto, Object]),
    __metadata("design:returntype", Promise)
], InternshipsController.prototype, "applyToInternship", null);
exports.InternshipsController = InternshipsController = __decorate([
    (0, common_1.Controller)('api/internships'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [internships_service_1.InternshipsService,
        evaluations_service_1.EvaluationsService,
        applications_service_1.ApplicationsService])
], InternshipsController);
//# sourceMappingURL=internships.controller.js.map