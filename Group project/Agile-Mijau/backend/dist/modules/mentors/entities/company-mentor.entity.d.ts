import { CompanyMentorEvaluation } from '../../evaluations/entities/company-mentor-evaluation.entity';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';
export declare class CompanyMentor {
    id: string;
    userId: string;
    user: User;
    companyId: string;
    company: Company;
    isActive: boolean;
    evaluations: CompanyMentorEvaluation[];
    createdAt: Date;
    updatedAt: Date;
}
