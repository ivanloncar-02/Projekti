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
exports.ApplicationsController = void 0;
const common_1 = require("@nestjs/common");
const applications_service_1 = require("./applications.service");
const create_application_dto_1 = require("./dto/create-application.dto");
const update_application_status_dto_1 = require("./dto/update-application-status.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const application_status_enum_1 = require("../../common/enums/application-status.enum");
let ApplicationsController = class ApplicationsController {
    applicationsService;
    constructor(applicationsService) {
        this.applicationsService = applicationsService;
    }
    create(createApplicationDto, studentId) {
        return this.applicationsService.create({
            ...createApplicationDto,
            studentId,
        });
    }
    getMyApplications(studentId, status) {
        return this.applicationsService.findByStudent(studentId, status);
    }
    checkIfApplied(internshipId, studentId) {
        return this.applicationsService.checkIfApplied(studentId, internshipId);
    }
    findByStudent(studentId, currentStudentId, role, status) {
        if (role === user_role_enum_1.UserRole.STUDENT && studentId !== currentStudentId) {
            throw new common_1.ForbiddenException('You can only view your own applications');
        }
        return this.applicationsService.findByStudent(studentId, status);
    }
    async findByInternship(internshipId, companyId, role, status) {
        if (role === user_role_enum_1.UserRole.EMPLOYER) {
            const ownershipCheck = await this.applicationsService.verifyInternshipOwnership(internshipId, companyId);
            if (!ownershipCheck) {
                throw new common_1.ForbiddenException('You can only view applications for your own internships');
            }
        }
        return this.applicationsService.findByInternship(internshipId, status);
    }
    async findOne(id, studentId, companyId, role) {
        const application = await this.applicationsService.findOne(id);
        if (role === user_role_enum_1.UserRole.STUDENT && application.studentId !== studentId) {
            throw new common_1.ForbiddenException('You can only view your own applications');
        }
        if (role === user_role_enum_1.UserRole.EMPLOYER && application.internship?.companyId !== companyId) {
            throw new common_1.ForbiddenException('You can only view applications for your own internships');
        }
        return application;
    }
    updateStatus(id, updateStatusDto, userId, companyId) {
        return this.applicationsService.updateStatus(id, updateStatusDto.status, userId, companyId);
    }
    approveApplication(id, userId, companyId) {
        return this.applicationsService.updateStatus(id, application_status_enum_1.ApplicationStatus.APPROVED, userId, companyId);
    }
    rejectApplication(id, userId, companyId) {
        return this.applicationsService.updateStatus(id, application_status_enum_1.ApplicationStatus.REJECTED, userId, companyId);
    }
    async getMyApplicationForInternship(internshipId, studentId) {
        return this.applicationsService.getApplicationByInternshipAndStudent(internshipId, studentId);
    }
    async addDocuments(internshipId, studentId, documentPaths) {
        return this.applicationsService.addDocuments(internshipId, studentId, documentPaths);
    }
    async removeDocument(internshipId, studentId, documentPath) {
        return this.applicationsService.removeDocument(internshipId, studentId, documentPath);
    }
};
exports.ApplicationsController = ApplicationsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_application_dto_1.CreateApplicationDto, String]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "getMyApplications", null);
__decorate([
    (0, common_1.Get)('check/:internshipId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT),
    __param(0, (0, common_1.Param)('internshipId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "checkIfApplied", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('studentId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "findByStudent", null);
__decorate([
    (0, common_1.Get)('internship/:internshipId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.EMPLOYER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('internshipId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "findByInternship", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.EMPLOYER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_application_status_dto_1.UpdateApplicationStatusDto, String, String]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.EMPLOYER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "approveApplication", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.EMPLOYER, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "rejectApplication", null);
__decorate([
    (0, common_1.Get)('internship/:internshipId/my'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT),
    __param(0, (0, common_1.Param)('internshipId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getMyApplicationForInternship", null);
__decorate([
    (0, common_1.Patch)('internship/:internshipId/documents'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT),
    __param(0, (0, common_1.Param)('internshipId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __param(2, (0, common_1.Body)('documentPaths')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "addDocuments", null);
__decorate([
    (0, common_1.Patch)('internship/:internshipId/documents/remove'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT),
    __param(0, (0, common_1.Param)('internshipId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __param(2, (0, common_1.Body)('documentPath')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "removeDocument", null);
exports.ApplicationsController = ApplicationsController = __decorate([
    (0, common_1.Controller)('api/applications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [applications_service_1.ApplicationsService])
], ApplicationsController);
//# sourceMappingURL=applications.controller.js.map