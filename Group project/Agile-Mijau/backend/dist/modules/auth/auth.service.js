"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const users_service_1 = require("../users/users.service");
const students_service_1 = require("../students/students.service");
const companies_service_1 = require("../companies/companies.service");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let AuthService = class AuthService {
    usersService;
    studentsService;
    companiesService;
    jwtService;
    constructor(usersService, studentsService, companiesService, jwtService) {
        this.usersService = usersService;
        this.studentsService = studentsService;
        this.companiesService = companiesService;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existingUser = await this.usersService.findByEmail(dto.email);
        if (existingUser) {
            throw new common_1.ConflictException('Email already in use');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.usersService.create({
            email: dto.email.toLowerCase(),
            password: hashedPassword,
            firstName: dto.firstName,
            lastName: dto.lastName,
            role: dto.role,
            phone: dto.phone,
            isActive: true,
        });
        if (dto.role === user_role_enum_1.UserRole.STUDENT) {
            const student = await this.studentsService.createStudentProfile(user.id, {
                studentNumber: dto.studentNumber,
                major: dto.major,
                academicYear: dto.academicYear,
                phone: dto.phone,
                address: dto.address,
            });
            await this.usersService.update(user.id, { studentId: student.id });
            user.studentId = student.id;
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const access_token = this.jwtService.sign(payload);
        const { password, ...userWithoutPassword } = user;
        return {
            access_token,
            user: userWithoutPassword,
        };
    }
    async registerEmployer(dto) {
        const existingUser = await this.usersService.findByEmail(dto.email);
        if (existingUser) {
            throw new common_1.ConflictException('Email already in use');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const company = await this.companiesService.create({
            name: dto.name,
            oib: dto.oib,
            email: dto.email,
            address: dto.address,
            website: dto.website,
            phone: dto.phone,
            contactPerson: dto.contactPerson,
        });
        const user = await this.usersService.create({
            email: dto.email.toLowerCase(),
            password: hashedPassword,
            firstName: dto.contactPerson.split(' ')[0] || 'Employer',
            lastName: dto.contactPerson.split(' ').slice(1).join(' ') || 'User',
            role: user_role_enum_1.UserRole.EMPLOYER,
            phone: dto.phone,
            isActive: true,
            companyId: company.id,
        });
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            companyId: company.id,
        };
        const access_token = this.jwtService.sign(payload);
        const { password, ...userWithoutPassword } = user;
        return {
            access_token,
            user: userWithoutPassword,
            company,
        };
    }
    async login(dto) {
        const user = await this.usersService.findByEmail(dto.email.toLowerCase());
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        if (user.companyId) {
            payload.companyId = user.companyId;
        }
        if (user.studentId) {
            payload.studentId = user.studentId;
        }
        const access_token = this.jwtService.sign(payload);
        const { password, ...userWithoutPassword } = user;
        return {
            access_token,
            user: userWithoutPassword,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        students_service_1.StudentsService,
        companies_service_1.CompaniesService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map