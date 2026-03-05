import {
  Controller,
  Get,
  Param,
  UseGuards,
  Res,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { ReportsService } from './reports.service';

@Controller('api/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('internship/:internshipId')
  @Roles(UserRole.STUDENT, UserRole.ADMIN, UserRole.ACADEMIC_MENTOR)
  async generateInternshipReport(
    @Param('internshipId', ParseUUIDPipe) internshipId: string,
    @CurrentUser('studentId') studentId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Res() res: Response,
  ) {
    // For students, only allow downloading their own reports
    if (role === UserRole.STUDENT && !studentId) {
      throw new ForbiddenException('Nemate studentski profil');
    }

    const pdfBuffer = await this.reportsService.generateInternshipReport(
      internshipId,
      studentId,
      userId,
      role,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="izvjesce-praksa-${internshipId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
