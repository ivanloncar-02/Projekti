import { Repository } from 'typeorm';
import { Internship } from './entities/internship.entity';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';
import { FilterInternshipsDto } from './dto/filter-internships.dto';
import { InternshipStatus } from '../../common/enums/internship-status.enum';
import { Company } from '../companies/entities/company.entity';
import { AcademicMentor } from '../mentors/entities/academic-mentor.entity';
import { Application } from '../applications/entities/application.entity';
import { CompanyMentorEvaluation } from '../evaluations/entities/company-mentor-evaluation.entity';
export declare class InternshipsService {
    private internshipsRepository;
    private companiesRepository;
    private academicMentorsRepository;
    private applicationsRepository;
    private evaluationsRepository;
    constructor(internshipsRepository: Repository<Internship>, companiesRepository: Repository<Company>, academicMentorsRepository: Repository<AcademicMentor>, applicationsRepository: Repository<Application>, evaluationsRepository: Repository<CompanyMentorEvaluation>);
    create(createInternshipDto: CreateInternshipDto): Promise<Internship>;
    findAll(page?: number, limit?: number, filters?: {
        status?: InternshipStatus;
        year?: number;
        student?: string;
        companyId?: string;
    }): Promise<{
        items: Internship[];
        meta: any;
    }>;
    findOne(id: string): Promise<Internship>;
    verifyOwnership(internshipId: string, companyId: string): Promise<boolean>;
    update(id: string, updateInternshipDto: UpdateInternshipDto): Promise<Internship>;
    updateStatus(id: string, newStatus: InternshipStatus, userId?: string): Promise<Internship>;
    remove(id: string): Promise<void>;
    archive(id: string): Promise<Internship>;
    findByCompany(companyId: string, page?: number, limit?: number): Promise<{
        items: Internship[];
        total: number;
    }>;
    findOnePublic(id: string): Promise<Internship>;
    findPublicInternships(page?: number, limit?: number): Promise<{
        items: any[];
        meta: any;
    }>;
    approve(id: string, userId: string): Promise<Internship>;
    findFiltered(filters: FilterInternshipsDto): Promise<{
        items: Internship[];
        meta: any;
    }>;
    submitGrade(id: string, grade: number, userId: string, comment?: string): Promise<Internship>;
}
