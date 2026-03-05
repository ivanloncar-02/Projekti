import { Repository } from 'typeorm';
import { Application } from '../applications/entities/application.entity';
import { Internship } from '../internships/entities/internship.entity';
import { StatisticsFiltersDto } from './dto/statistics-filters.dto';
interface StatisticsResult {
    totalApplications: number;
    approvedInternships: number;
    averageGrade: number;
    completedInternships: number;
    pendingApplications: number;
    activeOffers: number;
}
export declare class StatisticsService {
    private applicationsRepository;
    private internshipsRepository;
    constructor(applicationsRepository: Repository<Application>, internshipsRepository: Repository<Internship>);
    calculateStatistics(filters?: StatisticsFiltersDto): Promise<StatisticsResult>;
}
export {};
