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
exports.InternshipParametersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const internship_parameters_entity_1 = require("./entities/internship-parameters.entity");
let InternshipParametersService = class InternshipParametersService {
    parametersRepository;
    constructor(parametersRepository) {
        this.parametersRepository = parametersRepository;
    }
    async create(dto) {
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);
        const applicationDeadline = new Date(dto.applicationDeadline);
        if (endDate <= startDate) {
            throw new common_1.BadRequestException('End date must be after start date');
        }
        if (applicationDeadline >= startDate) {
            throw new common_1.BadRequestException('Application deadline must be before start date');
        }
        await this.parametersRepository.update({ isActive: true }, { isActive: false });
        const parameters = this.parametersRepository.create({
            duration: dto.duration,
            requiredHours: dto.requiredHours,
            applicationDeadline: dto.applicationDeadline,
            startDate: dto.startDate,
            endDate: dto.endDate,
            isActive: true,
        });
        return await this.parametersRepository.save(parameters);
    }
    async getActive() {
        return await this.parametersRepository.findOne({
            where: { isActive: true },
        });
    }
    async getAll() {
        return await this.parametersRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async toggleApprovalLock(dto) {
        const activeParams = await this.getActive();
        if (!activeParams) {
            throw new common_1.NotFoundException('Nema aktivnih parametara prakse');
        }
        activeParams.isApprovalLocked = dto.isLocked;
        activeParams.approvalLockedReason = dto.isLocked ? (dto.reason || null) : null;
        return await this.parametersRepository.save(activeParams);
    }
    async isApprovalLocked() {
        const activeParams = await this.getActive();
        if (!activeParams) {
            return { isLocked: false, reason: null };
        }
        return {
            isLocked: activeParams.isApprovalLocked,
            reason: activeParams.approvalLockedReason,
        };
    }
};
exports.InternshipParametersService = InternshipParametersService;
exports.InternshipParametersService = InternshipParametersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(internship_parameters_entity_1.InternshipParameters)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InternshipParametersService);
//# sourceMappingURL=internship-parameters.service.js.map