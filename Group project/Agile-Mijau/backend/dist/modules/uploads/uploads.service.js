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
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("../students/entities/student.entity");
const user_entity_1 = require("../users/entities/user.entity");
const fs_1 = require("fs");
const path_1 = require("path");
let UploadsService = class UploadsService {
    studentRepository;
    userRepository;
    constructor(studentRepository, userRepository) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }
    async updateStudentCV(userId, filename) {
        const student = await this.studentRepository.findOne({
            where: { userId },
        });
        if (!student) {
            throw new common_1.NotFoundException('Student profil nije pronađen');
        }
        if (student.cv) {
            const oldPath = (0, path_1.join)(process.cwd(), 'uploads', 'cv', student.cv);
            if ((0, fs_1.existsSync)(oldPath)) {
                try {
                    (0, fs_1.unlinkSync)(oldPath);
                }
                catch (error) {
                    console.error('Error deleting old CV:', error);
                }
            }
        }
        student.cv = filename;
        await this.studentRepository.save(student);
    }
    async getStudentCV(studentId) {
        const student = await this.studentRepository.findOne({
            where: { id: studentId },
        });
        return student?.cv || null;
    }
    deleteFile(type, filename) {
        const filePath = (0, path_1.join)(process.cwd(), 'uploads', type, filename);
        if ((0, fs_1.existsSync)(filePath)) {
            try {
                (0, fs_1.unlinkSync)(filePath);
                return true;
            }
            catch (error) {
                console.error('Error deleting file:', error);
                return false;
            }
        }
        return false;
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UploadsService);
//# sourceMappingURL=uploads.service.js.map