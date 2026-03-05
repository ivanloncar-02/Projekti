import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { AdminService } from './admin.service';
import { AssignMentorDto } from './dto/assign-mentor.dto';

@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('assign-mentor')
  async assignMentor(@Body() dto: AssignMentorDto) {
    const student = await this.adminService.assignMentor(dto);
    return {
      message: 'Mentor uspješno dodijeljen',
      studentId: student.id,
    };
  }
}
