import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('api/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('me')
  async getMyDashboard(
    @CurrentUser('role') role: UserRole,
    @CurrentUser('studentId') studentId: string,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('id') userId: string,
  ) {
    switch (role) {
      case UserRole.STUDENT:
        return this.dashboardService.getStudentDashboard(studentId);

      case UserRole.EMPLOYER:
        return this.dashboardService.getEmployerDashboard(companyId);

      case UserRole.ACADEMIC_MENTOR:
      case UserRole.COMPANY_MENTOR:
        return this.dashboardService.getMentorDashboard(userId, role);

      case UserRole.ADMIN:
        return this.dashboardService.getAdminDashboard();

      default:
        return {};
    }
  }
}
