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
exports.RegisterEmployerDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class RegisterEmployerDto {
    name;
    oib;
    email;
    password;
    address;
    website;
    phone;
    contactPerson;
}
exports.RegisterEmployerDto = RegisterEmployerDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Company name must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Company name is required' }),
    (0, class_validator_1.MinLength)(2, { message: 'Company name must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Company name must not exceed 100 characters' }),
    __metadata("design:type", String)
], RegisterEmployerDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'OIB must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'OIB is required' }),
    (0, class_validator_1.Length)(11, 11, { message: 'OIB must be exactly 11 digits' }),
    (0, class_validator_1.Matches)(/^\d{11}$/, { message: 'OIB must contain only digits' }),
    __metadata("design:type", String)
], RegisterEmployerDto.prototype, "oib", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value?.trim().toLowerCase()),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    __metadata("design:type", String)
], RegisterEmployerDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Password must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required' }),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Password must not exceed 50 characters' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
    __metadata("design:type", String)
], RegisterEmployerDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Address must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Address is required' }),
    (0, class_validator_1.MinLength)(5, { message: 'Address must be at least 5 characters long' }),
    (0, class_validator_1.MaxLength)(200, { message: 'Address must not exceed 200 characters' }),
    __metadata("design:type", String)
], RegisterEmployerDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: 'Please provide a valid URL' }),
    __metadata("design:type", String)
], RegisterEmployerDto.prototype, "website", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Phone must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Phone is required' }),
    (0, class_validator_1.MinLength)(10, { message: 'Phone must be at least 10 characters long' }),
    (0, class_validator_1.MaxLength)(15, { message: 'Phone must not exceed 15 characters' }),
    (0, class_validator_1.Matches)(/^(\+385|0)\d{8,9}$/, {
        message: 'Please provide a valid Croatian phone number',
    }),
    __metadata("design:type", String)
], RegisterEmployerDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Contact person must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Contact person is required' }),
    (0, class_validator_1.MinLength)(2, { message: 'Contact person name must be at least 2 characters long' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Contact person name must not exceed 100 characters' }),
    __metadata("design:type", String)
], RegisterEmployerDto.prototype, "contactPerson", void 0);
//# sourceMappingURL=register-employer.dto.js.map