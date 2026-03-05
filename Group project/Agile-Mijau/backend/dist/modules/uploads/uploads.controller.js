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
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const multer_config_1 = require("./multer.config");
const uploads_service_1 = require("./uploads.service");
const fs_1 = require("fs");
const path_1 = require("path");
let UploadsController = class UploadsController {
    uploadsService;
    constructor(uploadsService) {
        this.uploadsService = uploadsService;
    }
    async uploadCV(file, userId) {
        if (!file) {
            throw new common_1.BadRequestException('Datoteka nije priložena');
        }
        await this.uploadsService.updateStudentCV(userId, file.filename);
        return {
            message: 'CV uspješno učitan',
            filename: file.filename,
            path: `/api/uploads/cv/${file.filename}`,
        };
    }
    async uploadDocuments(files, userId) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('Datoteke nisu priložene');
        }
        const filenames = files.map(f => f.filename);
        return {
            message: 'Dokumenti uspješno učitani',
            files: filenames.map(filename => ({
                filename,
                path: `/api/uploads/documents/${filename}`,
            })),
        };
    }
    async getCV(filename, res) {
        const filePath = (0, path_1.join)(process.cwd(), 'uploads', 'cv', filename);
        if (!(0, fs_1.existsSync)(filePath)) {
            throw new common_1.NotFoundException('Datoteka nije pronađena');
        }
        return res.sendFile(filePath);
    }
    async getDocument(filename, res) {
        const filePath = (0, path_1.join)(process.cwd(), 'uploads', 'documents', filename);
        if (!(0, fs_1.existsSync)(filePath)) {
            throw new common_1.NotFoundException('Datoteka nije pronađena');
        }
        return res.sendFile(filePath);
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.Post)('cv'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', multer_config_1.multerConfig.cv)),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadCV", null);
__decorate([
    (0, common_1.Post)('documents'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STUDENT),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 5, multer_config_1.multerConfig.documents)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadDocuments", null);
__decorate([
    (0, common_1.Get)('cv/:filename'),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "getCV", null);
__decorate([
    (0, common_1.Get)('documents/:filename'),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "getDocument", null);
exports.UploadsController = UploadsController = __decorate([
    (0, common_1.Controller)('api/uploads'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [uploads_service_1.UploadsService])
], UploadsController);
//# sourceMappingURL=uploads.controller.js.map