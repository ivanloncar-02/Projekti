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
exports.InternshipParametersController = void 0;
const common_1 = require("@nestjs/common");
const internship_parameters_service_1 = require("./internship-parameters.service");
const create_internship_parameters_dto_1 = require("./dto/create-internship-parameters.dto");
const toggle_approval_lock_dto_1 = require("./dto/toggle-approval-lock.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let InternshipParametersController = class InternshipParametersController {
    parametersService;
    constructor(parametersService) {
        this.parametersService = parametersService;
    }
    async create(createDto) {
        return await this.parametersService.create(createDto);
    }
    async getActive() {
        const params = await this.parametersService.getActive();
        return params || null;
    }
    async getAll() {
        return await this.parametersService.getAll();
    }
    async toggleApprovalLock(dto) {
        return await this.parametersService.toggleApprovalLock(dto);
    }
    async getApprovalLockStatus() {
        return await this.parametersService.isApprovalLocked();
    }
};
exports.InternshipParametersController = InternshipParametersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_internship_parameters_dto_1.CreateInternshipParametersDto]),
    __metadata("design:returntype", Promise)
], InternshipParametersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.EMPLOYER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InternshipParametersController.prototype, "getActive", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InternshipParametersController.prototype, "getAll", null);
__decorate([
    (0, common_1.Patch)('approval-lock'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [toggle_approval_lock_dto_1.ToggleApprovalLockDto]),
    __metadata("design:returntype", Promise)
], InternshipParametersController.prototype, "toggleApprovalLock", null);
__decorate([
    (0, common_1.Get)('approval-lock'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InternshipParametersController.prototype, "getApprovalLockStatus", null);
exports.InternshipParametersController = InternshipParametersController = __decorate([
    (0, common_1.Controller)('api/admin/internship-parameters'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [internship_parameters_service_1.InternshipParametersService])
], InternshipParametersController);
//# sourceMappingURL=internship-parameters.controller.js.map