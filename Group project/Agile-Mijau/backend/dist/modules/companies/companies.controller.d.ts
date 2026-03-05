import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyStatus } from './entities/company.entity';
export declare class CompaniesController {
    private readonly companiesService;
    constructor(companiesService: CompaniesService);
    findOneById(id: string): Promise<import("./entities/company.entity").Company>;
}
export declare class AdminCompaniesController {
    private readonly companiesService;
    constructor(companiesService: CompaniesService);
    create(createCompanyDto: CreateCompanyDto): Promise<import("./entities/company.entity").Company>;
    findAll(page?: number, limit?: number, status?: CompanyStatus): Promise<{
        data: import("./entities/company.entity").Company[];
        meta: any;
    }>;
    findOne(id: string): Promise<import("./entities/company.entity").Company>;
    update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<import("./entities/company.entity").Company>;
    archive(id: string): Promise<import("./entities/company.entity").Company>;
}
