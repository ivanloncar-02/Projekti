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
exports.CreateCompanyEvaluationDto = void 0;
const class_validator_1 = require("class-validator");
class CreateCompanyEvaluationDto {
    rating;
    technicalSkills;
    communication;
    workEthic;
    overallPerformance;
    recommendations;
}
exports.CreateCompanyEvaluationDto = CreateCompanyEvaluationDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1, { message: 'Ukupna ocjena mora biti najmanje 1' }),
    (0, class_validator_1.Max)(5, { message: 'Ukupna ocjena može biti najviše 5' }),
    __metadata("design:type", Number)
], CreateCompanyEvaluationDto.prototype, "rating", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1, { message: 'Ocjena tehničkih znanja mora biti najmanje 1' }),
    (0, class_validator_1.Max)(5, { message: 'Ocjena tehničkih znanja može biti najviše 5' }),
    __metadata("design:type", Number)
], CreateCompanyEvaluationDto.prototype, "technicalSkills", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1, { message: 'Ocjena komunikacije mora biti najmanje 1' }),
    (0, class_validator_1.Max)(5, { message: 'Ocjena komunikacije može biti najviše 5' }),
    __metadata("design:type", Number)
], CreateCompanyEvaluationDto.prototype, "communication", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1, { message: 'Ocjena radne etike mora biti najmanje 1' }),
    (0, class_validator_1.Max)(5, { message: 'Ocjena radne etike može biti najviše 5' }),
    __metadata("design:type", Number)
], CreateCompanyEvaluationDto.prototype, "workEthic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCompanyEvaluationDto.prototype, "overallPerformance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCompanyEvaluationDto.prototype, "recommendations", void 0);
//# sourceMappingURL=create-company-evaluation.dto.js.map