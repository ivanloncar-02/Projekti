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
exports.CompanyMentor = void 0;
const typeorm_1 = require("typeorm");
const company_mentor_evaluation_entity_1 = require("../../evaluations/entities/company-mentor-evaluation.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const company_entity_1 = require("../../companies/entities/company.entity");
let CompanyMentor = class CompanyMentor {
    id;
    userId;
    user;
    companyId;
    company;
    isActive;
    evaluations;
    createdAt;
    updatedAt;
};
exports.CompanyMentor = CompanyMentor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CompanyMentor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], CompanyMentor.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], CompanyMentor.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], CompanyMentor.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'companyId' }),
    __metadata("design:type", company_entity_1.Company)
], CompanyMentor.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], CompanyMentor.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => company_mentor_evaluation_entity_1.CompanyMentorEvaluation, (e) => e.mentor),
    __metadata("design:type", Array)
], CompanyMentor.prototype, "evaluations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CompanyMentor.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CompanyMentor.prototype, "updatedAt", void 0);
exports.CompanyMentor = CompanyMentor = __decorate([
    (0, typeorm_1.Entity)('company_mentors')
], CompanyMentor);
//# sourceMappingURL=company-mentor.entity.js.map