import { Repository } from 'typeorm';
import { Company, CompanyStatus } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompaniesService {
    private companiesRepository;
    constructor(companiesRepository: Repository<Company>);
    create(createCompanyDto: CreateCompanyDto): Promise<Company>;
    findAll(page?: number, limit?: number, status?: CompanyStatus): Promise<{
        data: Company[];
        meta: any;
    }>;
    findOne(id: string): Promise<Company>;
    update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company>;
    archive(id: string): Promise<Company>;
}
