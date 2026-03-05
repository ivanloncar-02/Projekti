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
exports.InternshipsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const internship_entity_1 = require("./entities/internship.entity");
const internship_status_enum_1 = require("../../common/enums/internship-status.enum");
const company_entity_1 = require("../companies/entities/company.entity");
const academic_mentor_entity_1 = require("../mentors/entities/academic-mentor.entity");
const application_entity_1 = require("../applications/entities/application.entity");
const application_status_enum_1 = require("../../common/enums/application-status.enum");
const company_mentor_evaluation_entity_1 = require("../evaluations/entities/company-mentor-evaluation.entity");
let InternshipsService = class InternshipsService {
    internshipsRepository;
    companiesRepository;
    academicMentorsRepository;
    applicationsRepository;
    evaluationsRepository;
    constructor(internshipsRepository, companiesRepository, academicMentorsRepository, applicationsRepository, evaluationsRepository) {
        this.internshipsRepository = internshipsRepository;
        this.companiesRepository = companiesRepository;
        this.academicMentorsRepository = academicMentorsRepository;
        this.applicationsRepository = applicationsRepository;
        this.evaluationsRepository = evaluationsRepository;
    }
    async create(createInternshipDto) {
        const company = await this.companiesRepository.findOne({
            where: { id: createInternshipDto.companyId },
        });
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        if (company.status === company_entity_1.CompanyStatus.ARCHIVED) {
            throw new common_1.BadRequestException('Cannot create offers for archived companies');
        }
        const startDate = new Date(createInternshipDto.startDate);
        const endDate = new Date(createInternshipDto.endDate);
        if (endDate <= startDate) {
            throw new common_1.BadRequestException('End date must be after start date');
        }
        const internship = this.internshipsRepository.create({
            ...createInternshipDto,
            status: createInternshipDto.status || internship_status_enum_1.InternshipStatus.PUBLISHED,
        });
        return await this.internshipsRepository.save(internship);
    }
    async findAll(page = 1, limit = 20, filters) {
        const skip = (page - 1) * limit;
        const queryBuilder = this.internshipsRepository
            .createQueryBuilder('internship')
            .leftJoinAndSelect('internship.company', 'company')
            .leftJoinAndSelect('internship.applications', 'applications')
            .leftJoinAndSelect('applications.student', 'student')
            .leftJoinAndSelect('student.user', 'studentUser')
            .leftJoinAndSelect('internship.approver', 'approver');
        if (filters?.status) {
            queryBuilder.andWhere('internship.status = :status', {
                status: filters.status,
            });
        }
        if (filters?.companyId) {
            queryBuilder.andWhere('internship.companyId = :companyId', {
                companyId: filters.companyId,
            });
        }
        if (filters?.year) {
            queryBuilder.andWhere('EXTRACT(YEAR FROM internship.startDate) = :year', {
                year: filters.year,
            });
        }
        if (filters?.student) {
            queryBuilder.andWhere('(LOWER(studentUser.firstName) LIKE LOWER(:studentName) OR LOWER(studentUser.lastName) LIKE LOWER(:studentName) OR LOWER(CONCAT(studentUser.firstName, \' \', studentUser.lastName)) LIKE LOWER(:studentName))', { studentName: `%${filters.student}%` });
        }
        const [items, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .orderBy('internship.createdAt', 'DESC')
            .getManyAndCount();
        return {
            items: items || [],
            meta: {
                total: total || 0,
                page,
                limit,
                totalPages: total > 0 ? Math.ceil(total / limit) : 0,
            },
        };
    }
    async findOne(id) {
        const internship = await this.internshipsRepository.findOne({
            where: { id },
            relations: ['company', 'applications', 'applications.student', 'applications.student.user', 'approver'],
        });
        if (!internship) {
            throw new common_1.NotFoundException('Internship not found');
        }
        return internship;
    }
    async verifyOwnership(internshipId, companyId) {
        const internship = await this.internshipsRepository.findOne({
            where: { id: internshipId },
        });
        return internship?.companyId === companyId;
    }
    async update(id, updateInternshipDto) {
        const internship = await this.findOne(id);
        if (internship.approvedBy !== null || internship.status === internship_status_enum_1.InternshipStatus.ACTIVE) {
            throw new common_1.BadRequestException('Cannot change status of approved internship');
        }
        if (updateInternshipDto.startDate || updateInternshipDto.endDate) {
            const startDate = new Date(updateInternshipDto.startDate || internship.startDate);
            const endDate = new Date(updateInternshipDto.endDate || internship.endDate);
            if (endDate <= startDate) {
                throw new common_1.BadRequestException('End date must be after start date');
            }
        }
        Object.assign(internship, updateInternshipDto);
        return await this.internshipsRepository.save(internship);
    }
    async updateStatus(id, newStatus, userId) {
        const internship = await this.findOne(id);
        if (internship.approvedBy !== null || internship.status === internship_status_enum_1.InternshipStatus.ACTIVE) {
            throw new common_1.BadRequestException('Cannot change status of approved internship');
        }
        internship.status = newStatus;
        if (newStatus === internship_status_enum_1.InternshipStatus.ACTIVE && userId) {
            internship.approvedBy = userId;
            internship.approvedAt = new Date();
        }
        return await this.internshipsRepository.save(internship);
    }
    async remove(id) {
        const internship = await this.findOne(id);
        await this.internshipsRepository.remove(internship);
    }
    async archive(id) {
        const internship = await this.findOne(id);
        if (internship.status === internship_status_enum_1.InternshipStatus.ARCHIVED) {
            internship.status = internship_status_enum_1.InternshipStatus.ACTIVE;
            internship.archivedAt = null;
        }
        else {
            internship.status = internship_status_enum_1.InternshipStatus.ARCHIVED;
            internship.archivedAt = new Date();
        }
        return await this.internshipsRepository.save(internship);
    }
    async findByCompany(companyId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [items, total] = await this.internshipsRepository.findAndCount({
            where: { companyId },
            relations: ['company'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        const itemsWithCounts = await Promise.all(items.map(async (internship) => {
            const applicationsCount = await this.applicationsRepository.count({
                where: { internshipId: internship.id },
            });
            return { ...internship, applicationsCount };
        }));
        return { items: itemsWithCounts, total };
    }
    async findOnePublic(id) {
        const internship = await this.internshipsRepository.findOne({
            where: { id, status: internship_status_enum_1.InternshipStatus.ACTIVE },
            relations: ['company'],
        });
        if (!internship) {
            throw new common_1.NotFoundException('Internship not found');
        }
        return internship;
    }
    async findPublicInternships(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [items, total] = await this.internshipsRepository
            .createQueryBuilder('internship')
            .leftJoinAndSelect('internship.company', 'company')
            .where('internship.status = :status', {
            status: internship_status_enum_1.InternshipStatus.ACTIVE,
        })
            .select([
            'internship.id',
            'internship.title',
            'internship.description',
            'internship.location',
            'internship.duration',
            'internship.salary',
            'internship.requiredSkills',
            'internship.createdAt',
            'company.name',
            'company.address',
            'company.website',
        ])
            .skip(skip)
            .take(limit)
            .orderBy('internship.createdAt', 'DESC')
            .getManyAndCount();
        return {
            items: items || [],
            meta: {
                total: total || 0,
                page,
                limit,
                totalPages: total > 0 ? Math.ceil(total / limit) : 0,
            },
        };
    }
    async approve(id, userId) {
        const internship = await this.internshipsRepository.findOne({
            where: { id },
        });
        if (!internship) {
            throw new common_1.NotFoundException('Internship not found');
        }
        if (internship.status === internship_status_enum_1.InternshipStatus.ACTIVE) {
            throw new common_1.BadRequestException('Praksa je već odobrena');
        }
        internship.status = internship_status_enum_1.InternshipStatus.ACTIVE;
        internship.approvedBy = userId;
        internship.approvedAt = new Date();
        return await this.internshipsRepository.save(internship);
    }
    async findFiltered(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        const query = this.internshipsRepository
            .createQueryBuilder('internship')
            .leftJoinAndSelect('internship.company', 'company')
            .where('internship.status = :status', { status: internship_status_enum_1.InternshipStatus.ACTIVE });
        if (filters.location) {
            query.andWhere('LOWER(internship.location) LIKE LOWER(:location)', {
                location: `%${filters.location}%`,
            });
        }
        if (filters.company) {
            query.andWhere('internship.companyId = :companyId', {
                companyId: filters.company,
            });
        }
        if (filters.duration) {
            query.andWhere('internship.duration = :duration', {
                duration: filters.duration,
            });
        }
        if (filters.field) {
            query.andWhere(':field = ANY(internship.requiredSkills)', {
                field: filters.field,
            });
        }
        if (filters.minSalary !== undefined) {
            query.andWhere('internship.salary >= :minSalary', {
                minSalary: filters.minSalary,
            });
        }
        if (filters.maxSalary !== undefined) {
            query.andWhere('internship.salary <= :maxSalary', {
                maxSalary: filters.maxSalary,
            });
        }
        const [items, total] = await query
            .skip(skip)
            .take(limit)
            .orderBy('internship.createdAt', 'DESC')
            .getManyAndCount();
        return {
            items: items || [],
            meta: {
                total: total || 0,
                page,
                limit,
                totalPages: total > 0 ? Math.ceil(total / limit) : 0,
            },
        };
    }
    async submitGrade(id, grade, userId, comment) {
        const internship = await this.internshipsRepository.findOne({
            where: { id },
            relations: ['applications', 'applications.student'],
        });
        if (!internship) {
            throw new common_1.NotFoundException('Internship not found');
        }
        if (internship.grade !== null) {
            throw new common_1.BadRequestException('Grade has already been submitted');
        }
        const evaluation = await this.evaluationsRepository.findOne({
            where: { internshipId: id },
        });
        if (!evaluation) {
            throw new common_1.BadRequestException('Evaluacija mentora iz tvrtke mora biti dovršena prije ocjenjivanja');
        }
        if (![internship_status_enum_1.InternshipStatus.ACTIVE, internship_status_enum_1.InternshipStatus.COMPLETED].includes(internship.status)) {
            throw new common_1.BadRequestException('Praksa mora biti aktivna ili završena za ocjenjivanje');
        }
        if (internship.status === internship_status_enum_1.InternshipStatus.ACTIVE) {
            internship.status = internship_status_enum_1.InternshipStatus.COMPLETED;
        }
        const academicMentor = await this.academicMentorsRepository.findOne({
            where: { userId },
        });
        if (!academicMentor) {
            throw new common_1.ForbiddenException('Only academic mentors can submit grades');
        }
        const approvedApplication = internship.applications.find((app) => app.status === application_status_enum_1.ApplicationStatus.APPROVED);
        if (!approvedApplication) {
            throw new common_1.BadRequestException('No approved application found');
        }
        if (approvedApplication.student.academicMentorId !== academicMentor.id) {
            throw new common_1.ForbiddenException('You can only grade students assigned to you');
        }
        internship.grade = grade;
        internship.gradeComment = comment || null;
        internship.gradedBy = userId;
        internship.gradedAt = new Date();
        internship.status = internship_status_enum_1.InternshipStatus.GRADED;
        return await this.internshipsRepository.save(internship);
    }
};
exports.InternshipsService = InternshipsService;
exports.InternshipsService = InternshipsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(internship_entity_1.Internship)),
    __param(1, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __param(2, (0, typeorm_1.InjectRepository)(academic_mentor_entity_1.AcademicMentor)),
    __param(3, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __param(4, (0, typeorm_1.InjectRepository)(company_mentor_evaluation_entity_1.CompanyMentorEvaluation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], InternshipsService);
//# sourceMappingURL=internships.service.js.map