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
exports.AssignMentorDto = exports.MentorType = void 0;
const class_validator_1 = require("class-validator");
var MentorType;
(function (MentorType) {
    MentorType["ACADEMIC_MENTOR"] = "ACADEMIC_MENTOR";
    MentorType["COMPANY_MENTOR"] = "COMPANY_MENTOR";
})(MentorType || (exports.MentorType = MentorType = {}));
class AssignMentorDto {
    studentId;
    mentorId;
    mentorType;
}
exports.AssignMentorDto = AssignMentorDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AssignMentorDto.prototype, "studentId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AssignMentorDto.prototype, "mentorId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(MentorType),
    __metadata("design:type", String)
], AssignMentorDto.prototype, "mentorType", void 0);
//# sourceMappingURL=assign-mentor.dto.js.map