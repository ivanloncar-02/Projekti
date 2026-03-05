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
exports.EvaluationsController = void 0;
const common_1 = require("@nestjs/common");
const evaluations_service_1 = require("./evaluations.service");
const create_evaluation_dto_1 = require("./dto/create-evaluation.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let EvaluationsController = class EvaluationsController {
    evaluationsService;
    constructor(evaluationsService) {
        this.evaluationsService = evaluationsService;
    }
    create(createEvaluationDto) {
        return this.evaluationsService.create(createEvaluationDto);
    }
    async checkStatus(internshipId) {
        const evaluation = await this.evaluationsService.findByInternship(internshipId);
        return { completed: !!evaluation };
    }
    async findByInternship(internshipId, studentId, role) {
        if (role === user_role_enum_1.UserRole.STUDENT) {
            const hasAccess = await this.evaluationsService.verifyStudentAccess(internshipId, studentId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('You can only view evaluations for your own internships');
            }
        }
        return this.evaluationsService.findByInternship(internshipId);
    }
    async deleteByInternship(internshipId, userId, role) {
        return this.evaluationsService.deleteByInternship(internshipId, userId, role);
    }
    async findOne(id, studentId, role) {
        const evaluation = await this.evaluationsService.findOne(id);
        if (role === user_role_enum_1.UserRole.STUDENT) {
            const hasAccess = await this.evaluationsService.verifyStudentAccess(evaluation.internshipId, studentId);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('You can only view evaluations for your own internships');
            }
        }
        return evaluation;
    }
};
exports.EvaluationsController = EvaluationsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.COMPANY_MENTOR, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_evaluation_dto_1.CreateEvaluationDto]),
    __metadata("design:returntype", void 0)
], EvaluationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('internship/:internshipId/status'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.ACADEMIC_MENTOR, user_role_enum_1.UserRole.COMPANY_MENTOR, user_role_enum_1.UserRole.STUDENT),
    __param(0, (0, common_1.Param)('internshipId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "checkStatus", null);
__decorate([
    (0, common_1.Get)('internship/:internshipId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT, user_role_enum_1.UserRole.COMPANY_MENTOR, user_role_enum_1.UserRole.ACADEMIC_MENTOR, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('internshipId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "findByInternship", null);
__decorate([
    (0, common_1.Delete)('internship/:internshipId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.COMPANY_MENTOR),
    __param(0, (0, common_1.Param)('internshipId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "deleteByInternship", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT, user_role_enum_1.UserRole.COMPANY_MENTOR, user_role_enum_1.UserRole.ACADEMIC_MENTOR, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EvaluationsController.prototype, "findOne", null);
exports.EvaluationsController = EvaluationsController = __decorate([
    (0, common_1.Controller)('api/evaluations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [evaluations_service_1.EvaluationsService])
], EvaluationsController);
//# sourceMappingURL=evaluations.controller.js.map