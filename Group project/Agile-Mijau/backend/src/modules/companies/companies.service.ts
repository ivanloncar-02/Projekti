import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company, CompanyStatus } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    // Check if OIB already exists
    const existingCompany = await this.companiesRepository.findOne({
      where: { oib: createCompanyDto.oib },
    });

    if (existingCompany) {
      throw new ConflictException('Company with this OIB already exists');
    }

    const company = this.companiesRepository.create(createCompanyDto);
    return await this.companiesRepository.save(company);
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    status?: CompanyStatus,
  ): Promise<{ data: Company[]; meta: any }> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.companiesRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.internships', 'internships');

    if (status) {
      queryBuilder.where('company.status = :status', { status });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('company.createdAt', 'DESC')
      .getManyAndCount();

    // Task 7: Always return structure even when empty
    return {
      data: items || [],
      meta: {
        total: total || 0,
        page,
        limit,
        totalPages: total > 0 ? Math.ceil(total / limit) : 0,
      },
    };
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: { id },
      relations: ['internships'],
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const company = await this.findOne(id);

    // If OIB is being changed, check for uniqueness
    if (updateCompanyDto.oib && updateCompanyDto.oib !== company.oib) {
      const existingCompany = await this.companiesRepository.findOne({
        where: { oib: updateCompanyDto.oib },
      });

      if (existingCompany) {
        throw new ConflictException('Company with this OIB already exists');
      }
    }

    Object.assign(company, updateCompanyDto);
    return await this.companiesRepository.save(company);
  }

  async archive(id: string): Promise<Company> {
    const company = await this.findOne(id);
    // Toggle between ARCHIVED and ACTIVE
    company.status = company.status === CompanyStatus.ARCHIVED
      ? CompanyStatus.ACTIVE
      : CompanyStatus.ARCHIVED;
    return await this.companiesRepository.save(company);
  }
}
