import { AdminInternshipsService } from './admin-internships.service';
import { InternshipStatus } from '../../common/enums/internship-status.enum';
export declare class AdminInternshipsController {
    private readonly adminInternshipsService;
    constructor(adminInternshipsService: AdminInternshipsService);
    findAll(page?: number, limit?: number, year?: number, student?: string, company?: string, status?: InternshipStatus, search?: string, sortBy?: string, order?: 'ASC' | 'DESC'): Promise<{
        data: any[];
        meta: any;
    }>;
}
