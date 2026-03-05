import { Repository } from 'typeorm';
import { CompanyMentorEvaluation } from './entities/company-mentor-evaluation.entity';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { CreateCompanyEvaluationDto } from './dto/create-company-evaluation.dto';
import { Internship } from '../internships/entities/internship.entity';
import { CompanyMentor } from '../mentors/entities/company-mentor.entity';
import { Application } from '../applications/entities/application.entity';
import { UserRole } from '../../common/enums/user-role.enum';
export declare class EvaluationsService {
    private evaluationsRepository;
    private internshipsRepository;
    private companyMentorsRepository;
    private applicationsRepository;
    constructor(evaluationsRepository: Repository<CompanyMentorEvaluation>, internshipsRepository: Repository<Internship>, companyMentorsRepository: Repository<CompanyMentor>, applicationsRepository: Repository<Application>);
    create(createEvaluationDto: CreateEvaluationDto): Promise<CompanyMentorEvaluation>;
    findByInternship(internshipId: string): Promise<CompanyMentorEvaluation | null>;
    checkCompanyEvaluationCompleted(internshipId: string): Promise<boolean>;
    findOne(id: string): Promise<CompanyMentorEvaluation>;
    submitCompanyEvaluation(internshipId: string, mentorUserId: string, dto: CreateCompanyEvaluationDto): Promise<CompanyMentorEvaluation>;
    verifyStudentAccess(internshipId: string, studentId: string): Promise<boolean>;
    deleteByInternship(internshipId: string, userId: string, role: UserRole): Promise<void>;
}
