import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('api/students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    const students = await this.studentsService.findAll();
    return students.map(student => ({
      id: student.id,
      firstName: student.user?.firstName || '',
      lastName: student.user?.lastName || '',
      email: student.user?.email || '',
      indexNumber: student.studentNumber,
      academicMentor: student.academicMentor ? {
        id: student.academicMentor.id,
        firstName: student.academicMentor.user?.firstName || '',
        lastName: student.academicMentor.user?.lastName || '',
      } : null,
      companyMentor: student.companyMentor ? {
        id: student.companyMentor.id,
        firstName: student.companyMentor.firstName || '',
        lastName: student.companyMentor.lastName || '',
      } : null,
    }));
  }

  @Post('profile/:userId')
  @Roles(UserRole.ADMIN)
  async createProfile(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() createStudentProfileDto: CreateStudentProfileDto,
  ) {
    return await this.studentsService.createStudentProfile(userId, createStudentProfileDto);
  }

  @Get(':id')
  @Roles(UserRole.STUDENT, UserRole.ADMIN, UserRole.ACADEMIC_MENTOR, UserRole.COMPANY_MENTOR)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('studentId') currentStudentId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    // Students can only view their own profile
    if (role === UserRole.STUDENT && id !== currentStudentId) {
      throw new ForbiddenException('You can only view your own profile');
    }
    return await this.studentsService.findById(id);
  }

  @Get('user/:userId')
  @Roles(UserRole.STUDENT, UserRole.ADMIN, UserRole.ACADEMIC_MENTOR, UserRole.COMPANY_MENTOR)
  async findByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    // Students can only view their own profile
    if (role === UserRole.STUDENT && userId !== currentUserId) {
      throw new ForbiddenException('You can only view your own profile');
    }
    return await this.studentsService.findByUserId(userId);
  }
}
