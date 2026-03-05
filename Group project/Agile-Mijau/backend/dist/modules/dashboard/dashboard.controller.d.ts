import { DashboardService } from './dashboard.service';
import { UserRole } from '../../common/enums/user-role.enum';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getMyDashboard(role: UserRole, studentId: string, companyId: string, userId: string): Promise<{}>;
}
