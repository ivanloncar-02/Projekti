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
exports.GoalsController = void 0;
const common_1 = require("@nestjs/common");
const goals_service_1 = require("./goals.service");
const create_goal_dto_1 = require("./dto/create-goal.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let GoalsController = class GoalsController {
    goalsService;
    constructor(goalsService) {
        this.goalsService = goalsService;
    }
    create(studentId, userId, role, createGoalDto) {
        if (role === user_role_enum_1.UserRole.STUDENT) {
            return this.goalsService.create(studentId, createGoalDto);
        }
        if (role === user_role_enum_1.UserRole.COMPANY_MENTOR) {
            return this.goalsService.createForStudent(createGoalDto.internshipId, userId, createGoalDto);
        }
        throw new common_1.ForbiddenException('Nemate ovlasti za kreiranje ciljeva');
    }
    findAll(studentId, userId, role, internshipId, queryStudentId) {
        if (role === user_role_enum_1.UserRole.STUDENT) {
            return this.goalsService.findAll(studentId, internshipId);
        }
        if (role === user_role_enum_1.UserRole.COMPANY_MENTOR) {
            return this.goalsService.findAll(queryStudentId, internshipId, userId, role);
        }
        return this.goalsService.findAll(queryStudentId, internshipId, userId, role);
    }
    async findOne(id, studentId, role) {
        const goal = await this.goalsService.findOne(id);
        if (role === user_role_enum_1.UserRole.STUDENT && goal.studentId !== studentId) {
            throw new common_1.ForbiddenException('You can only view your own goals');
        }
        return goal;
    }
    complete(studentId, id) {
        return this.goalsService.complete(id, studentId);
    }
};
exports.GoalsController = GoalsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT, user_role_enum_1.UserRole.COMPANY_MENTOR),
    __param(0, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __param(3, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, create_goal_dto_1.CreateGoalDto]),
    __metadata("design:returntype", void 0)
], GoalsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT, user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.ACADEMIC_MENTOR, user_role_enum_1.UserRole.COMPANY_MENTOR),
    __param(0, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __param(3, (0, common_1.Query)('internshipId', new common_1.ParseUUIDPipe({ optional: true }))),
    __param(4, (0, common_1.Query)('studentId', new common_1.ParseUUIDPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], GoalsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT, user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.ACADEMIC_MENTOR, user_role_enum_1.UserRole.COMPANY_MENTOR),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GoalsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GoalsController.prototype, "complete", null);
exports.GoalsController = GoalsController = __decorate([
    (0, common_1.Controller)('api/goals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [goals_service_1.GoalsService])
], GoalsController);
//# sourceMappingURL=goals.controller.js.map