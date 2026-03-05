import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternshipParameters } from './entities/internship-parameters.entity';
import { CreateInternshipParametersDto } from './dto/create-internship-parameters.dto';
import { ToggleApprovalLockDto } from './dto/toggle-approval-lock.dto';

@Injectable()
export class InternshipParametersService {
  constructor(
    @InjectRepository(InternshipParameters)
    private parametersRepository: Repository<InternshipParameters>,
  ) {}

  async create(dto: CreateInternshipParametersDto): Promise<InternshipParameters> {
    // Validate dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const applicationDeadline = new Date(dto.applicationDeadline);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    if (applicationDeadline >= startDate) {
      throw new BadRequestException('Application deadline must be before start date');
    }

    // Deactivate all previous parameters
    await this.parametersRepository.update(
      { isActive: true },
      { isActive: false },
    );

    // Create new parameters with isActive = true
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

  async getActive(): Promise<InternshipParameters | null> {
    return await this.parametersRepository.findOne({
      where: { isActive: true },
    });
  }

  async getAll(): Promise<InternshipParameters[]> {
    return await this.parametersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async toggleApprovalLock(dto: ToggleApprovalLockDto): Promise<InternshipParameters> {
    const activeParams = await this.getActive();

    if (!activeParams) {
      throw new NotFoundException('Nema aktivnih parametara prakse');
    }

    activeParams.isApprovalLocked = dto.isLocked;
    activeParams.approvalLockedReason = dto.isLocked ? (dto.reason || null) : null;

    return await this.parametersRepository.save(activeParams);
  }

  async isApprovalLocked(): Promise<{ isLocked: boolean; reason: string | null }> {
    const activeParams = await this.getActive();

    if (!activeParams) {
      return { isLocked: false, reason: null };
    }

    return {
      isLocked: activeParams.isApprovalLocked,
      reason: activeParams.approvalLockedReason,
    };
  }
}
