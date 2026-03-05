import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { MentorsService } from './mentors.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';

@Controller('api/mentors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MentorsController {
  constructor(
    private readonly mentorsService: MentorsService,
    private readonly usersService: UsersService,
  ) {}

  // List all mentors (academic and company) for admin assignment
  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    const mentors = await this.usersService.findByRoles([
      UserRole.ACADEMIC_MENTOR,
      UserRole.COMPANY_MENTOR,
    ]);
    return mentors.map(mentor => ({
      id: mentor.id,
      firstName: mentor.firstName,
      lastName: mentor.lastName,
      email: mentor.email,
      role: mentor.role,
      // Company mentors have company info, academic mentors don't
      companyName: mentor.company?.name,
    }));
  }

  // Academic mentor - get assigned students with internships
  @Get('academic/students')
  @Roles(UserRole.ACADEMIC_MENTOR)
  async getAcademicMentorStudents(@CurrentUser('id') mentorUserId: string) {
    const items = await this.mentorsService.getAcademicMentorStudents(mentorUserId);
    return { items };
  }

  // Academic mentor specific endpoint
  @Get('academic/students/:studentId/overview')
  @Roles(UserRole.ACADEMIC_MENTOR)
  getStudentOverview(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser('id') mentorUserId: string,
  ) {
    return this.mentorsService.getStudentOverview(mentorUserId, studentId);
  }

  // Company mentor - get assigned students with internships
  @Get('company/students')
  @Roles(UserRole.COMPANY_MENTOR)
  async getCompanyMentorStudents(@CurrentUser('id') mentorUserId: string) {
    const items = await this.mentorsService.getCompanyMentorStudents(mentorUserId);
    return { items };
  }
}
