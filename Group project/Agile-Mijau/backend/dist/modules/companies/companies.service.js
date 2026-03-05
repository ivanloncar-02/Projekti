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
exports.CompaniesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const company_entity_1 = require("./entities/company.entity");
let CompaniesService = class CompaniesService {
    companiesRepository;
    constructor(companiesRepository) {
        this.companiesRepository = companiesRepository;
    }
    async create(createCompanyDto) {
        const existingCompany = await this.companiesRepository.findOne({
            where: { oib: createCompanyDto.oib },
        });
        if (existingCompany) {
            throw new common_1.ConflictException('Company with this OIB already exists');
        }
        const company = this.companiesRepository.create(createCompanyDto);
        return await this.companiesRepository.save(company);
    }
    async findAll(page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const queryBuilder = this.companiesRepository
            .createQueryBuilder('company')
            .leftJoinAndSelect('company.internships', 'internships');
        if (status) {
            queryBuilder.where('company.status = :status', { status });
        }
        const [items, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .orderBy('company.createdAt', 'DESC')
            .getManyAndCount();
        return {
            data: items || [],
            meta: {
                total: total || 0,
                page,
                limit,
                totalPages: total > 0 ? Math.ceil(total / limit) : 0,
            },
        };
    }
    async findOne(id) {
        const company = await this.companiesRepository.findOne({
            where: { id },
            relations: ['internships'],
        });
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        return company;
    }
    async update(id, updateCompanyDto) {
        const company = await this.findOne(id);
        if (updateCompanyDto.oib && updateCompanyDto.oib !== company.oib) {
            const existingCompany = await this.companiesRepository.findOne({
                where: { oib: updateCompanyDto.oib },
            });
            if (existingCompany) {
                throw new common_1.ConflictException('Company with this OIB already exists');
            }
        }
        Object.assign(company, updateCompanyDto);
        return await this.companiesRepository.save(company);
    }
    async archive(id) {
        const company = await this.findOne(id);
        company.status = company.status === company_entity_1.CompanyStatus.ARCHIVED
            ? company_entity_1.CompanyStatus.ACTIVE
            : company_entity_1.CompanyStatus.ARCHIVED;
        return await this.companiesRepository.save(company);
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CompaniesService);
//# sourceMappingURL=companies.service.js.map