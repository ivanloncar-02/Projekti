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
exports.MentorsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("../students/entities/student.entity");
const goal_entity_1 = require("../goals/entities/goal.entity");
const diary_entry_entity_1 = require("../diary/entities/diary-entry.entity");
const application_entity_1 = require("../applications/entities/application.entity");
const application_status_enum_1 = require("../../common/enums/application-status.enum");
const academic_mentor_entity_1 = require("./entities/academic-mentor.entity");
let MentorsService = class MentorsService {
    studentsRepository;
    goalsRepository;
    diaryRepository;
    applicationsRepository;
    academicMentorsRepository;
    constructor(studentsRepository, goalsRepository, diaryRepository, applicationsRepository, academicMentorsRepository) {
        this.studentsRepository = studentsRepository;
        this.goalsRepository = goalsRepository;
        this.diaryRepository = diaryRepository;
        this.applicationsRepository = applicationsRepository;
        this.academicMentorsRepository = academicMentorsRepository;
    }
    async getStudentOverview(mentorUserId, studentId) {
        const student = await this.studentsRepository.findOne({
            where: { id: studentId },
            relations: ['academicMentor', 'academicMentor.user'],
        });
        if (!student) {
            throw new common_1.NotFoundException('Student not found');
        }
        if (!student.academicMentor || student.academicMentor.user.id !== mentorUserId) {
            throw new common_1.ForbiddenException('You are not assigned as the academic mentor for this student');
        }
        const goals = await this.goalsRepository.find({
            where: { studentId },
            order: { createdAt: 'DESC' },
        });
        const diary = await this.diaryRepository.find({
            where: { studentId },
            order: { date: 'DESC' },
        });
        return { goals, diary };
    }
    async getCompanyMentorStudents(mentorUserId) {
        const students = await this.studentsRepository.find({
            where: { companyMentorId: mentorUserId },
            relations: ['user', 'companyMentor'],
        });
        const result = await Promise.all(students.map(async (student) => {
            const applications = await this.applicationsRepository.find({
                where: {
                    studentId: student.id,
                    status: application_status_enum_1.ApplicationStatus.APPROVED,
                },
                relations: ['internship', 'internship.company'],
            });
            const applicationsWithDiary = await Promise.all(applications.map(async (application) => {
                const diaryEntries = await this.diaryRepository.find({
                    where: {
                        studentId: student.id,
                        internshipId: application.internshipId,
                    },
                    order: { date: 'DESC' },
                });
                return {
                    id: application.internship.id,
                    title: application.internship.title,
                    student: {
                        id: student.id,
                        user: {
                            firstName: student.user.firstName,
                            lastName: student.user.lastName,
                            email: student.user.email,
                        },
                    },
                    company: {
                        name: application.internship.company?.name || '',
                    },
                    startDate: application.internship.startDate,
                    endDate: application.internship.endDate,
                    status: application.internship.status,
                    diaryEntries: diaryEntries.map(entry => ({
                        id: entry.id,
                        date: entry.date,
                        description: entry.entry,
                        approved: entry.approved,
                        mentorComment: entry.mentorComment,
                    })),
                };
            }));
            return applicationsWithDiary;
        }));
        return result.flat();
    }
    async getAcademicMentorStudents(mentorUserId) {
        const academicMentor = await this.academicMentorsRepository.findOne({
            where: { userId: mentorUserId },
        });
        if (!academicMentor) {
            throw new common_1.NotFoundException('Academic mentor not found');
        }
        const students = await this.studentsRepository.find({
            where: { academicMentorId: academicMentor.id },
            relations: ['user'],
        });
        const result = await Promise.all(students.map(async (student) => {
            const applications = await this.applicationsRepository.find({
                where: {
                    studentId: student.id,
                    status: application_status_enum_1.ApplicationStatus.APPROVED,
                },
                relations: ['internship', 'internship.company'],
            });
            const applicationsWithDetails = await Promise.all(applications.map(async (application) => {
                const diaryEntries = await this.diaryRepository.find({
                    where: {
                        studentId: student.id,
                        internshipId: application.internshipId,
                    },
                    order: { date: 'DESC' },
                });
                const goals = await this.goalsRepository.find({
                    where: {
                        studentId: student.id,
                        internshipId: application.internshipId,
                    },
                });
                const totalDiaryEntries = diaryEntries.length;
                const approvedDiaryEntries = diaryEntries.filter(e => e.approved).length;
                return {
                    id: application.internship.id,
                    title: application.internship.title,
                    student: {
                        id: student.id,
                        user: {
                            firstName: student.user.firstName,
                            lastName: student.user.lastName,
                            email: student.user.email,
                        },
                    },
                    company: {
                        name: application.internship.company?.name || '',
                    },
                    startDate: application.internship.startDate,
                    endDate: application.internship.endDate,
                    status: application.internship.status,
                    grade: application.internship.grade,
                    gradeComment: application.internship.gradeComment,
                    totalDiaryEntries,
                    approvedDiaryEntries,
                    goalsCount: goals.length,
                };
            }));
            return applicationsWithDetails;
        }));
        return result.flat();
    }
};
exports.MentorsService = MentorsService;
exports.MentorsService = MentorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(1, (0, typeorm_1.InjectRepository)(goal_entity_1.Goal)),
    __param(2, (0, typeorm_1.InjectRepository)(diary_entry_entity_1.DiaryEntry)),
    __param(3, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __param(4, (0, typeorm_1.InjectRepository)(academic_mentor_entity_1.AcademicMentor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MentorsService);
//# sourceMappingURL=mentors.service.js.map