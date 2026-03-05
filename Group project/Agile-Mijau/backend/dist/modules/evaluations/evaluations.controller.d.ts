import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UserRole } from '../../common/enums/user-role.enum';
export declare class EvaluationsController {
    private readonly evaluationsService;
    constructor(evaluationsService: EvaluationsService);
    create(createEvaluationDto: CreateEvaluationDto): Promise<import("./entities/company-mentor-evaluation.entity").CompanyMentorEvaluation>;
    checkStatus(internshipId: string): Promise<{
        completed: boolean;
    }>;
    findByInternship(internshipId: string, studentId: string, role: UserRole): Promise<import("./entities/company-mentor-evaluation.entity").CompanyMentorEvaluation | null>;
    deleteByInternship(internshipId: string, userId: string, role: UserRole): Promise<void>;
    findOne(id: string, studentId: string, role: UserRole): Promise<import("./entities/company-mentor-evaluation.entity").CompanyMentorEvaluation>;
}
