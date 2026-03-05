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
exports.AdminInternshipsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const internship_entity_1 = require("./entities/internship.entity");
const application_status_enum_1 = require("../../common/enums/application-status.enum");
let AdminInternshipsService = class AdminInternshipsService {
    internshipsRepository;
    constructor(internshipsRepository) {
        this.internshipsRepository = internshipsRepository;
    }
    async findAllInternships(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        const sortBy = filters.sortBy || 'createdAt';
        const order = filters.order || 'DESC';
        const queryBuilder = this.internshipsRepository
            .createQueryBuilder('internship')
            .leftJoinAndSelect('internship.company', 'company')
            .leftJoinAndSelect('internship.applications', 'applications')
            .leftJoinAndSelect('applications.student', 'student')
            .leftJoinAndSelect('student.user', 'user')
            .leftJoinAndSelect('internship.approver', 'approver');
        if (filters.status) {
            queryBuilder.andWhere('internship.status = :status', {
                status: filters.status,
            });
        }
        if (filters.company) {
            queryBuilder.andWhere('internship.companyId = :companyId', {
                companyId: filters.company,
            });
        }
        if (filters.year) {
            queryBuilder.andWhere('EXTRACT(YEAR FROM internship.startDate) = :year', {
                year: filters.year,
            });
        }
        if (filters.student) {
            queryBuilder.andWhere('(user.firstName ILIKE :student OR user.lastName ILIKE :student)', { student: `%${filters.student}%` });
        }
        if (filters.search) {
            queryBuilder.andWhere('(internship.title ILIKE :search OR company.name ILIKE :search)', { search: `%${filters.search}%` });
        }
        const [items, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .orderBy(`internship.${sortBy}`, order)
            .getManyAndCount();
        const transformedItems = items.map((internship) => {
            const approvedApplication = internship.applications?.find((app) => app.status === application_status_enum_1.ApplicationStatus.APPROVED);
            return {
                ...internship,
                applicationsCount: internship.applications?.length || 0,
                student: approvedApplication?.student || null,
            };
        });
        return {
            data: transformedItems,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                filters: {
                    year: filters.year,
                    student: filters.student,
                    company: filters.company,
                    status: filters.status,
                },
            },
        };
    }
};
exports.AdminInternshipsService = AdminInternshipsService;
exports.AdminInternshipsService = AdminInternshipsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(internship_entity_1.Internship)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AdminInternshipsService);
//# sourceMappingURL=admin-internships.service.js.map