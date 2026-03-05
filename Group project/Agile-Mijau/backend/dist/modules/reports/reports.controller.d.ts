import type { Response } from 'express';
import { UserRole } from '../../common/enums/user-role.enum';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    generateInternshipReport(internshipId: string, studentId: string, userId: string, role: UserRole, res: Response): Promise<void>;
}
