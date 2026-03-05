import { Repository } from 'typeorm';
import { Internship } from './entities/internship.entity';
import { InternshipStatus } from '../../common/enums/internship-status.enum';
interface AdminInternshipsFilters {
    page?: number;
    limit?: number;
    year?: number;
    student?: string;
    company?: string;
    status?: InternshipStatus;
    search?: string;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
}
export declare class AdminInternshipsService {
    private internshipsRepository;
    constructor(internshipsRepository: Repository<Internship>);
    findAllInternships(filters: AdminInternshipsFilters): Promise<{
        data: any[];
        meta: any;
    }>;
}
export {};
