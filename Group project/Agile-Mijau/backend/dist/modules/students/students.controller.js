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
exports.StudentsController = void 0;
const common_1 = require("@nestjs/common");
const students_service_1 = require("./students.service");
const create_student_profile_dto_1 = require("./dto/create-student-profile.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let StudentsController = class StudentsController {
    studentsService;
    constructor(studentsService) {
        this.studentsService = studentsService;
    }
    async findAll() {
        const students = await this.studentsService.findAll();
        return students.map(student => ({
            id: student.id,
            firstName: student.user?.firstName || '',
            lastName: student.user?.lastName || '',
            email: student.user?.email || '',
            indexNumber: student.studentNumber,
            academicMentor: student.academicMentor ? {
                id: student.academicMentor.id,
                firstName: student.academicMentor.user?.firstName || '',
                lastName: student.academicMentor.user?.lastName || '',
            } : null,
            companyMentor: student.companyMentor ? {
                id: student.companyMentor.id,
                firstName: student.companyMentor.firstName || '',
                lastName: student.companyMentor.lastName || '',
            } : null,
        }));
    }
    async createProfile(userId, createStudentProfileDto) {
        return await this.studentsService.createStudentProfile(userId, createStudentProfileDto);
    }
    async findOne(id, currentStudentId, role) {
        if (role === user_role_enum_1.UserRole.STUDENT && id !== currentStudentId) {
            throw new common_1.ForbiddenException('You can only view your own profile');
        }
        return await this.studentsService.findById(id);
    }
    async findByUserId(userId, currentUserId, role) {
        if (role === user_role_enum_1.UserRole.STUDENT && userId !== currentUserId) {
            throw new common_1.ForbiddenException('You can only view your own profile');
        }
        return await this.studentsService.findByUserId(userId);
    }
};
exports.StudentsController = StudentsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('profile/:userId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_student_profile_dto_1.CreateStudentProfileDto]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT, user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.ACADEMIC_MENTOR, user_role_enum_1.UserRole.COMPANY_MENTOR),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT, user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.ACADEMIC_MENTOR, user_role_enum_1.UserRole.COMPANY_MENTOR),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "findByUserId", null);
exports.StudentsController = StudentsController = __decorate([
    (0, common_1.Controller)('api/students'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [students_service_1.StudentsService])
], StudentsController);
//# sourceMappingURL=students.controller.js.map