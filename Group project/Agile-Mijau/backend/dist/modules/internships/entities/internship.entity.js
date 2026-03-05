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
exports.Internship = void 0;
const typeorm_1 = require("typeorm");
const internship_status_enum_1 = require("../../../common/enums/internship-status.enum");
const company_entity_1 = require("../../companies/entities/company.entity");
const application_entity_1 = require("../../applications/entities/application.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let Internship = class Internship {
    id;
    companyId;
    company;
    title;
    description;
    location;
    duration;
    requiredHours;
    requiredSkills;
    salary;
    startDate;
    endDate;
    status;
    approvedBy;
    approver;
    approvedAt;
    archivedAt;
    grade;
    gradeComment;
    gradedBy;
    grader;
    gradedAt;
    applications;
    createdAt;
    updatedAt;
};
exports.Internship = Internship;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Internship.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Internship.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, (company) => company.internships, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'companyId' }),
    __metadata("design:type", company_entity_1.Company)
], Internship.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Internship.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Internship.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Internship.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Internship.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Internship.prototype, "requiredHours", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        array: true,
        default: () => 'ARRAY[]::text[]',
    }),
    __metadata("design:type", Array)
], Internship.prototype, "requiredSkills", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', nullable: true }),
    __metadata("design:type", Object)
], Internship.prototype, "salary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Internship.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Internship.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: internship_status_enum_1.InternshipStatus,
        default: internship_status_enum_1.InternshipStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Internship.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Internship.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'approvedBy' }),
    __metadata("design:type", Object)
], Internship.prototype, "approver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Internship.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Internship.prototype, "archivedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Internship.prototype, "grade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Internship.prototype, "gradeComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Internship.prototype, "gradedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'gradedBy' }),
    __metadata("design:type", Object)
], Internship.prototype, "grader", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Internship.prototype, "gradedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => application_entity_1.Application, (application) => application.internship),
    __metadata("design:type", Array)
], Internship.prototype, "applications", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Internship.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Internship.prototype, "updatedAt", void 0);
exports.Internship = Internship = __decorate([
    (0, typeorm_1.Entity)('internships'),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['companyId']),
    (0, typeorm_1.Index)(['createdAt'])
], Internship);
//# sourceMappingURL=internship.entity.js.map