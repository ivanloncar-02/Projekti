import { InternshipsService } from './internships.service';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';
import { UpdateInternshipStatusDto } from './dto/update-internship-status.dto';
import { ApproveInternshipDto } from './dto/approve-internship.dto';
import { SubmitGradeDto } from './dto/submit-grade.dto';
import { InternshipStatus } from '../../common/enums/internship-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { EvaluationsService } from '../evaluations/evaluations.service';
import { CreateCompanyEvaluationDto } from '../evaluations/dto/create-company-evaluation.dto';
import { ApplicationsService } from '../applications/applications.service';
import { ApplyToInternshipDto } from '../applications/dto/apply-to-internship.dto';
export declare class InternshipsController {
    private readonly internshipsService;
    private readonly evaluationsService;
    private readonly applicationsService;
    constructor(internshipsService: InternshipsService, evaluationsService: EvaluationsService, applicationsService: ApplicationsService);
    findPublic(page?: number, limit?: number): Promise<{
        items: any[];
        meta: any;
    }>;
    findOnePublic(id: string): Promise<import("./entities/internship.entity").Internship>;
    findFiltered(location?: string, company?: string, duration?: number, field?: string, minSalary?: number, maxSalary?: number, page?: number, limit?: number): Promise<{
        items: import("./entities/internship.entity").Internship[];
        meta: any;
    }>;
    findMyInternships(companyId: string, page?: number, limit?: number): Promise<{
        items: import("./entities/internship.entity").Internship[];
        total: number;
    }>;
    create(createInternshipDto: CreateInternshipDto, companyId: string, role: UserRole): Promise<import("./entities/internship.entity").Internship>;
    findAll(page?: number, limit?: number, status?: InternshipStatus, year?: number, student?: string, companyId?: string): Promise<{
        items: import("./entities/internship.entity").Internship[];
        meta: any;
    }>;
    findOne(id: string): Promise<import("./entities/internship.entity").Internship>;
    update(id: string, updateInternshipDto: UpdateInternshipDto, companyId: string, role: UserRole): Promise<import("./entities/internship.entity").Internship>;
    updateStatus(id: string, updateStatusDto: UpdateInternshipStatusDto): Promise<import("./entities/internship.entity").Internship>;
    remove(id: string, companyId: string, role: UserRole): Promise<void>;
    archive(id: string, companyId: string, role: UserRole): Promise<import("./entities/internship.entity").Internship>;
    approve(id: string, userId: string, approveDto: ApproveInternshipDto): Promise<import("./entities/internship.entity").Internship>;
    submitGrade(id: string, submitGradeDto: SubmitGradeDto, userId: string): Promise<import("./entities/internship.entity").Internship>;
    getCompanyEvaluation(id: string, studentId: string, role: UserRole): Promise<import("../evaluations/entities/company-mentor-evaluation.entity").CompanyMentorEvaluation | null>;
    submitCompanyEvaluation(id: string, mentorUserId: string, createEvaluationDto: CreateCompanyEvaluationDto): Promise<import("../evaluations/entities/company-mentor-evaluation.entity").CompanyMentorEvaluation>;
    applyToInternship(internshipId: string, studentId: string, applyDto: ApplyToInternshipDto, files: {
        cv?: Express.Multer.File[];
        additionalDocuments?: Express.Multer.File[];
    }): Promise<import("../applications/entities/application.entity").Application>;
}
