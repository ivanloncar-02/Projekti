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
exports.DiaryController = void 0;
const common_1 = require("@nestjs/common");
const diary_service_1 = require("./diary.service");
const create_diary_entry_dto_1 = require("./dto/create-diary-entry.dto");
const update_diary_entry_dto_1 = require("./dto/update-diary-entry.dto");
const approve_diary_entry_dto_1 = require("./dto/approve-diary-entry.dto");
const add_comment_dto_1 = require("./dto/add-comment.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let DiaryController = class DiaryController {
    diaryService;
    constructor(diaryService) {
        this.diaryService = diaryService;
    }
    create(studentId, createDiaryEntryDto) {
        return this.diaryService.create(studentId, createDiaryEntryDto);
    }
    findAllByStudent(studentId, currentStudentId, role) {
        if (role === user_role_enum_1.UserRole.STUDENT && studentId !== currentStudentId) {
            throw new common_1.ForbiddenException('You can only view your own diary entries');
        }
        return this.diaryService.findAllByStudent(studentId);
    }
    findAllByInternship(internshipId, userId, studentId, role) {
        return this.diaryService.findAllByInternship(internshipId, userId, role, studentId);
    }
    async findOne(id, currentStudentId, role) {
        const entry = await this.diaryService.findOne(id);
        if (role === user_role_enum_1.UserRole.STUDENT && entry.studentId !== currentStudentId) {
            throw new common_1.ForbiddenException('You can only view your own diary entries');
        }
        return entry;
    }
    update(id, studentId, updateDiaryEntryDto) {
        return this.diaryService.update(id, studentId, updateDiaryEntryDto);
    }
    approveDiaryEntry(id, userId, approveDto) {
        return this.diaryService.approveDiaryEntry(id, userId, approveDto.mentorComment);
    }
    delete(id, studentId) {
        return this.diaryService.delete(id, studentId);
    }
    addComment(id, mentorUserId, addCommentDto) {
        return this.diaryService.addComment(id, mentorUserId, addCommentDto.mentorComment);
    }
};
exports.DiaryController = DiaryController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_diary_entry_dto_1.CreateDiaryEntryDto]),
    __metadata("design:returntype", void 0)
], DiaryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT, user_role_enum_1.UserRole.COMPANY_MENTOR, user_role_enum_1.UserRole.ACADEMIC_MENTOR, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('studentId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], DiaryController.prototype, "findAllByStudent", null);
__decorate([
    (0, common_1.Get)('internship/:internshipId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT, user_role_enum_1.UserRole.COMPANY_MENTOR, user_role_enum_1.UserRole.ACADEMIC_MENTOR, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('internshipId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], DiaryController.prototype, "findAllByInternship", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT, user_role_enum_1.UserRole.COMPANY_MENTOR, user_role_enum_1.UserRole.ACADEMIC_MENTOR, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DiaryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_diary_entry_dto_1.UpdateDiaryEntryDto]),
    __metadata("design:returntype", void 0)
], DiaryController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.COMPANY_MENTOR, user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, approve_diary_entry_dto_1.ApproveDiaryEntryDto]),
    __metadata("design:returntype", void 0)
], DiaryController.prototype, "approveDiaryEntry", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DiaryController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/comment'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.COMPANY_MENTOR),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, add_comment_dto_1.AddCommentDto]),
    __metadata("design:returntype", void 0)
], DiaryController.prototype, "addComment", null);
exports.DiaryController = DiaryController = __decorate([
    (0, common_1.Controller)('api/diary'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [diary_service_1.DiaryService])
], DiaryController);
//# sourceMappingURL=diary.controller.js.map