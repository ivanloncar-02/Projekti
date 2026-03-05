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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let UsersService = class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async findAll(options = {}) {
        const where = [];
        const baseCondition = {};
        if (options.role) {
            baseCondition.role = options.role;
        }
        if (options.isActive !== undefined) {
            baseCondition.isActive = options.isActive;
        }
        if (options.search) {
            const searchTerm = `%${options.search}%`;
            where.push({ ...baseCondition, firstName: (0, typeorm_2.Like)(searchTerm) }, { ...baseCondition, lastName: (0, typeorm_2.Like)(searchTerm) }, { ...baseCondition, email: (0, typeorm_2.Like)(searchTerm) });
        }
        else {
            where.push(baseCondition);
        }
        return this.usersRepository.find({
            where: where.length > 0 ? where : undefined,
            relations: ['company', 'student'],
            order: { lastName: 'ASC', firstName: 'ASC' },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                phone: true,
                isActive: true,
                createdAt: true,
                company: {
                    id: true,
                    name: true,
                },
                student: {
                    id: true,
                    studentNumber: true,
                },
            },
        });
    }
    async findByRoles(roles) {
        return this.usersRepository.find({
            where: { role: (0, typeorm_2.In)(roles), isActive: true },
            relations: ['company'],
        });
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({
            where: { email: email.toLowerCase() },
        });
    }
    async findById(id) {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: ['company', 'student'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async create(userData) {
        const user = this.usersRepository.create(userData);
        return this.usersRepository.save(user);
    }
    async update(id, userData) {
        await this.usersRepository.update(id, userData);
        return this.findById(id);
    }
    async updateRole(id, newRole) {
        const user = await this.findById(id);
        if (user.role === user_role_enum_1.UserRole.ADMIN && newRole !== user_role_enum_1.UserRole.ADMIN) {
            const adminCount = await this.usersRepository.count({
                where: { role: user_role_enum_1.UserRole.ADMIN, isActive: true },
            });
            if (adminCount <= 1) {
                throw new common_1.BadRequestException('Ne možete ukloniti posljednjeg administratora');
            }
        }
        user.role = newRole;
        return this.usersRepository.save(user);
    }
    async toggleActive(id) {
        const user = await this.findById(id);
        if (user.role === user_role_enum_1.UserRole.ADMIN && user.isActive) {
            const activeAdminCount = await this.usersRepository.count({
                where: { role: user_role_enum_1.UserRole.ADMIN, isActive: true },
            });
            if (activeAdminCount <= 1) {
                throw new common_1.BadRequestException('Ne možete deaktivirati posljednjeg administratora');
            }
        }
        user.isActive = !user.isActive;
        return this.usersRepository.save(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map