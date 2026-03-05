import { InternshipParametersService } from './internship-parameters.service';
import { CreateInternshipParametersDto } from './dto/create-internship-parameters.dto';
import { ToggleApprovalLockDto } from './dto/toggle-approval-lock.dto';
export declare class InternshipParametersController {
    private readonly parametersService;
    constructor(parametersService: InternshipParametersService);
    create(createDto: CreateInternshipParametersDto): Promise<import("./entities/internship-parameters.entity").InternshipParameters>;
    getActive(): Promise<import("./entities/internship-parameters.entity").InternshipParameters | null>;
    getAll(): Promise<import("./entities/internship-parameters.entity").InternshipParameters[]>;
    toggleApprovalLock(dto: ToggleApprovalLockDto): Promise<import("./entities/internship-parameters.entity").InternshipParameters>;
    getApprovalLockStatus(): Promise<{
        isLocked: boolean;
        reason: string | null;
    }>;
}
