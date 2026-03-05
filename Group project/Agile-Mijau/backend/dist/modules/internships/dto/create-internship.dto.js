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
exports.CreateInternshipDto = void 0;
const class_validator_1 = require("class-validator");
const internship_status_enum_1 = require("../../../common/enums/internship-status.enum");
const is_date_after_validator_1 = require("../../../common/validators/is-date-after.validator");
class CreateInternshipDto {
    companyId;
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
}
exports.CreateInternshipDto = CreateInternshipDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInternshipDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(5, { message: 'Title must be at least 5 characters long' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Title must not exceed 100 characters' }),
    __metadata("design:type", String)
], CreateInternshipDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(100, { message: 'Description must be at least 100 characters long' }),
    (0, class_validator_1.MaxLength)(2000, { message: 'Description must not exceed 2000 characters' }),
    __metadata("design:type", String)
], CreateInternshipDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(2, { message: 'Location must be at least 2 characters long' }),
    __metadata("design:type", String)
], CreateInternshipDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1, { message: 'Duration must be at least 1 month' }),
    __metadata("design:type", Number)
], CreateInternshipDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1, { message: 'Required hours must be at least 1' }),
    __metadata("design:type", Number)
], CreateInternshipDto.prototype, "requiredHours", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateInternshipDto.prototype, "requiredSkills", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0, { message: 'Salary cannot be negative' }),
    __metadata("design:type", Number)
], CreateInternshipDto.prototype, "salary", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateInternshipDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, is_date_after_validator_1.IsDateAfter)('startDate', { message: 'End date must be after start date' }),
    __metadata("design:type", String)
], CreateInternshipDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(internship_status_enum_1.InternshipStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInternshipDto.prototype, "status", void 0);
//# sourceMappingURL=create-internship.dto.js.map