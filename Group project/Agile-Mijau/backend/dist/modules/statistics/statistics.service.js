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
exports.StatisticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const application_entity_1 = require("../applications/entities/application.entity");
const internship_entity_1 = require("../internships/entities/internship.entity");
const application_status_enum_1 = require("../../common/enums/application-status.enum");
const internship_status_enum_1 = require("../../common/enums/internship-status.enum");
let StatisticsService = class StatisticsService {
    applicationsRepository;
    internshipsRepository;
    constructor(applicationsRepository, internshipsRepository) {
        this.applicationsRepository = applicationsRepository;
        this.internshipsRepository = internshipsRepository;
    }
    async calculateStatistics(filters) {
        const applicationQuery = this.applicationsRepository.createQueryBuilder('application');
        const internshipQuery = this.internshipsRepository.createQueryBuilder('internship');
        if (filters) {
            if (filters.year) {
                const [startYear] = filters.year.split('/').map(Number);
                if (startYear) {
                    const academicYearStart = new Date(startYear, 8, 1);
                    const academicYearEnd = new Date(startYear + 1, 7, 31);
                    applicationQuery.andWhere('application.appliedAt BETWEEN :startDate AND :endDate', { startDate: academicYearStart, endDate: academicYearEnd });
                    internshipQuery.andWhere('internship.startDate BETWEEN :startDate AND :endDate', { startDate: academicYearStart, endDate: academicYearEnd });
                }
            }
            if (filters.company) {
                applicationQuery
                    .leftJoin('application.internship', 'internship')
                    .andWhere('internship.companyId = :companyId', {
                    companyId: filters.company,
                });
                internshipQuery.andWhere('internship.companyId = :companyId', {
                    companyId: filters.company,
                });
            }
            if (filters.startDate && filters.endDate) {
                applicationQuery.andWhere('application.createdAt BETWEEN :startDate AND :endDate', {
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                });
                internshipQuery.andWhere('internship.startDate BETWEEN :startDate AND :endDate', {
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                });
            }
        }
        const totalApplications = await applicationQuery.getCount();
        const pendingApplications = await applicationQuery
            .clone()
            .andWhere('application.status = :status', {
            status: application_status_enum_1.ApplicationStatus.PENDING,
        })
            .getCount();
        const approvedInternships = await internshipQuery
            .clone()
            .andWhere('internship.status IN (:...statuses)', {
            statuses: [internship_status_enum_1.InternshipStatus.ACTIVE, internship_status_enum_1.InternshipStatus.APPROVED],
        })
            .getCount();
        const completedInternships = await internshipQuery
            .clone()
            .andWhere('internship.status IN (:...statuses)', {
            statuses: [internship_status_enum_1.InternshipStatus.COMPLETED, internship_status_enum_1.InternshipStatus.GRADED],
        })
            .getCount();
        const activeOffers = await internshipQuery
            .clone()
            .andWhere('internship.status = :status', {
            status: internship_status_enum_1.InternshipStatus.PUBLISHED,
        })
            .getCount();
        const avgGradeResult = await internshipQuery
            .clone()
            .select('AVG(internship.grade)', 'average')
            .where('internship.grade IS NOT NULL')
            .getRawOne();
        const averageGrade = avgGradeResult?.average
            ? parseFloat(avgGradeResult.average)
            : 0;
        return {
            totalApplications: totalApplications || 0,
            approvedInternships: approvedInternships || 0,
            averageGrade: averageGrade || 0,
            completedInternships: completedInternships || 0,
            pendingApplications: pendingApplications || 0,
            activeOffers: activeOffers || 0,
        };
    }
};
exports.StatisticsService = StatisticsService;
exports.StatisticsService = StatisticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __param(1, (0, typeorm_1.InjectRepository)(internship_entity_1.Internship)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], StatisticsService);
//# sourceMappingURL=statistics.service.js.map