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
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("./entities/student.entity");
let StudentsService = class StudentsService {
    studentsRepository;
    constructor(studentsRepository) {
        this.studentsRepository = studentsRepository;
    }
    async createStudentProfile(userId, data) {
        const existingProfile = await this.studentsRepository.findOne({
            where: { userId },
        });
        if (existingProfile) {
            throw new common_1.ConflictException('Student profile already exists for this user');
        }
        const existingStudentNumber = await this.studentsRepository.findOne({
            where: { studentNumber: data.studentNumber },
        });
        if (existingStudentNumber) {
            throw new common_1.ConflictException('Student number already exists');
        }
        const student = new student_entity_1.Student();
        student.userId = userId;
        student.studentNumber = data.studentNumber;
        student.major = data.major;
        student.academicYear = data.academicYear;
        student.academicMentorId = data.academicMentorId || null;
        student.phone = data.phone || null;
        student.address = data.address || null;
        student.cv = data.cv || null;
        return await this.studentsRepository.save(student);
    }
    async findAll() {
        return this.studentsRepository.find({
            relations: ['user', 'academicMentor', 'academicMentor.user', 'companyMentor'],
        });
    }
    async findByUserId(userId) {
        const student = await this.studentsRepository.findOne({
            where: { userId },
            relations: ['user', 'academicMentor'],
        });
        if (!student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        return student;
    }
    async findById(id) {
        const student = await this.studentsRepository.findOne({
            where: { id },
            relations: ['user', 'academicMentor'],
        });
        if (!student) {
            throw new common_1.NotFoundException('Student not found');
        }
        return student;
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StudentsService);
//# sourceMappingURL=students.service.js.map