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
exports.CompanyMentorEvaluation = void 0;
const typeorm_1 = require("typeorm");
const internship_entity_1 = require("../../internships/entities/internship.entity");
const company_mentor_entity_1 = require("../../mentors/entities/company-mentor.entity");
let CompanyMentorEvaluation = class CompanyMentorEvaluation {
    id;
    internshipId;
    internship;
    mentorId;
    mentor;
    rating;
    technicalSkills;
    communication;
    workEthic;
    overallPerformance;
    recommendations;
    isLocked;
    submittedAt;
    updatedAt;
};
exports.CompanyMentorEvaluation = CompanyMentorEvaluation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CompanyMentorEvaluation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CompanyMentorEvaluation.prototype, "internshipId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => internship_entity_1.Internship, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'internshipId' }),
    __metadata("design:type", internship_entity_1.Internship)
], CompanyMentorEvaluation.prototype, "internship", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CompanyMentorEvaluation.prototype, "mentorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_mentor_entity_1.CompanyMentor, (mentor) => mentor.evaluations, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'mentorId' }),
    __metadata("design:type", company_mentor_entity_1.CompanyMentor)
], CompanyMentorEvaluation.prototype, "mentor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], CompanyMentorEvaluation.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], CompanyMentorEvaluation.prototype, "technicalSkills", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], CompanyMentorEvaluation.prototype, "communication", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], CompanyMentorEvaluation.prototype, "workEthic", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], CompanyMentorEvaluation.prototype, "overallPerformance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], CompanyMentorEvaluation.prototype, "recommendations", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], CompanyMentorEvaluation.prototype, "isLocked", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CompanyMentorEvaluation.prototype, "submittedAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CompanyMentorEvaluation.prototype, "updatedAt", void 0);
exports.CompanyMentorEvaluation = CompanyMentorEvaluation = __decorate([
    (0, typeorm_1.Entity)('company_mentor_evaluations'),
    (0, typeorm_1.Unique)(['internshipId']),
    (0, typeorm_1.Check)(`"rating" BETWEEN 1 AND 5`),
    (0, typeorm_1.Check)(`"technicalSkills" BETWEEN 1 AND 5`),
    (0, typeorm_1.Check)(`"communication" BETWEEN 1 AND 5`),
    (0, typeorm_1.Check)(`"workEthic" BETWEEN 1 AND 5`)
], CompanyMentorEvaluation);
//# sourceMappingURL=company-mentor-evaluation.entity.js.map