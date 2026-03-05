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
exports.MentorsController = void 0;
const common_1 = require("@nestjs/common");
const mentors_service_1 = require("./mentors.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const users_service_1 = require("../users/users.service");
let MentorsController = class MentorsController {
    mentorsService;
    usersService;
    constructor(mentorsService, usersService) {
        this.mentorsService = mentorsService;
        this.usersService = usersService;
    }
    async findAll() {
        const mentors = await this.usersService.findByRoles([
            user_role_enum_1.UserRole.ACADEMIC_MENTOR,
            user_role_enum_1.UserRole.COMPANY_MENTOR,
        ]);
        return mentors.map(mentor => ({
            id: mentor.id,
            firstName: mentor.firstName,
            lastName: mentor.lastName,
            email: mentor.email,
            role: mentor.role,
            companyName: mentor.company?.name,
        }));
    }
    async getAcademicMentorStudents(mentorUserId) {
        const items = await this.mentorsService.getAcademicMentorStudents(mentorUserId);
        return { items };
    }
    getStudentOverview(studentId, mentorUserId) {
        return this.mentorsService.getStudentOverview(mentorUserId, studentId);
    }
    async getCompanyMentorStudents(mentorUserId) {
        const items = await this.mentorsService.getCompanyMentorStudents(mentorUserId);
        return { items };
    }
};
exports.MentorsController = MentorsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MentorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('academic/students'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ACADEMIC_MENTOR),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MentorsController.prototype, "getAcademicMentorStudents", null);
__decorate([
    (0, common_1.Get)('academic/students/:studentId/overview'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ACADEMIC_MENTOR),
    __param(0, (0, common_1.Param)('studentId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MentorsController.prototype, "getStudentOverview", null);
__decorate([
    (0, common_1.Get)('company/students'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.COMPANY_MENTOR),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MentorsController.prototype, "getCompanyMentorStudents", null);
exports.MentorsController = MentorsController = __decorate([
    (0, common_1.Controller)('api/mentors'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [mentors_service_1.MentorsService,
        users_service_1.UsersService])
], MentorsController);
//# sourceMappingURL=mentors.controller.js.map