import { Repository } from 'typeorm';
import { InternshipParameters } from './entities/internship-parameters.entity';
import { CreateInternshipParametersDto } from './dto/create-internship-parameters.dto';
import { ToggleApprovalLockDto } from './dto/toggle-approval-lock.dto';
export declare class InternshipParametersService {
    private parametersRepository;
    constructor(parametersRepository: Repository<InternshipParameters>);
    create(dto: CreateInternshipParametersDto): Promise<InternshipParameters>;
    getActive(): Promise<InternshipParameters | null>;
    getAll(): Promise<InternshipParameters[]>;
    toggleApprovalLock(dto: ToggleApprovalLockDto): Promise<InternshipParameters>;
    isApprovalLocked(): Promise<{
        isLocked: boolean;
        reason: string | null;
    }>;
}
