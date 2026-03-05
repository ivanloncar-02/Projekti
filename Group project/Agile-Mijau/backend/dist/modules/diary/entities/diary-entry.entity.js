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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiaryEntry = void 0;
const typeorm_1 = require("typeorm");
const student_entity_1 = require("../../students/entities/student.entity");
const internship_entity_1 = require("../../internships/entities/internship.entity");
const company_mentor_entity_1 = require("../../mentors/entities/company-mentor.entity");
let DiaryEntry = class DiaryEntry {
    id;
    studentId;
    student;
    internshipId;
    internship;
    date;
    entry;
    hoursWorked;
    approved;
    approvedAt;
    approvedBy;
    approver;
    mentorComment;
    createdAt;
    updatedAt;
};
exports.DiaryEntry = DiaryEntry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DiaryEntry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DiaryEntry.prototype, "studentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_entity_1.Student, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'studentId' }),
    __metadata("design:type", student_entity_1.Student)
], DiaryEntry.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DiaryEntry.prototype, "internshipId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => internship_entity_1.Internship, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'internshipId' }),
    __metadata("design:type", internship_entity_1.Internship)
], DiaryEntry.prototype, "internship", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], DiaryEntry.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DiaryEntry.prototype, "entry", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DiaryEntry.prototype, "hoursWorked", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], DiaryEntry.prototype, "approved", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], DiaryEntry.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], DiaryEntry.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_mentor_entity_1.CompanyMentor, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'approvedBy' }),
    __metadata("design:type", Object)
], DiaryEntry.prototype, "approver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], DiaryEntry.prototype, "mentorComment", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DiaryEntry.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DiaryEntry.prototype, "updatedAt", void 0);
exports.DiaryEntry = DiaryEntry = __decorate([
    (0, typeorm_1.Entity)('diary_entries')
], DiaryEntry);
//# sourceMappingURL=diary-entry.entity.js.map