import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  ValidationPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApplicationStatus } from '../../common/enums/application-status.enum';

@Controller('api/applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.STUDENT)
  create(
    @Body() createApplicationDto: CreateApplicationDto,
    @CurrentUser('studentId') studentId: string,
  ) {
    // Override studentId from authenticated user to prevent creating applications for others
    return this.applicationsService.create({
      ...createApplicationDto,
      studentId,
    });
  }

  @Get('me')
  @Roles(UserRole.STUDENT)
  getMyApplications(
    @CurrentUser('studentId') studentId: string,
    @Query('status') status?: ApplicationStatus,
  ) {
    return this.applicationsService.findByStudent(studentId, status);
  }

  @Get('check/:internshipId')
  @Roles(UserRole.STUDENT)
  checkIfApplied(
    @Param('internshipId', ParseUUIDPipe) internshipId: string,
    @CurrentUser('studentId') studentId: string,
  ) {
    return this.applicationsService.checkIfApplied(studentId, internshipId);
  }

  @Get('student/:studentId')
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  findByStudent(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser('studentId') currentStudentId: string,
    @CurrentUser('role') role: UserRole,
    @Query('status') status?: ApplicationStatus,
  ) {
    // Students can only view their own applications
    if (role === UserRole.STUDENT && studentId !== currentStudentId) {
      throw new ForbiddenException('You can only view your own applications');
    }
    return this.applicationsService.findByStudent(studentId, status);
  }

  @Get('internship/:internshipId')
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  async findByInternship(
    @Param('internshipId', ParseUUIDPipe) internshipId: string,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('role') role: UserRole,
    @Query('status') status?: ApplicationStatus,
  ) {
    // Employers can only view applications for their own internships
    if (role === UserRole.EMPLOYER) {
      // Verify internship ownership before fetching applications
      const ownershipCheck = await this.applicationsService.verifyInternshipOwnership(
        internshipId,
        companyId,
      );
      if (!ownershipCheck) {
        throw new ForbiddenException('You can only view applications for your own internships');
      }
    }
    return this.applicationsService.findByInternship(internshipId, status);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('studentId') studentId: string,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    const application = await this.applicationsService.findOne(id);

    // Check authorization based on role
    if (role === UserRole.STUDENT && application.studentId !== studentId) {
      throw new ForbiddenException('You can only view your own applications');
    }

    if (role === UserRole.EMPLOYER && application.internship?.companyId !== companyId) {
      throw new ForbiddenException('You can only view applications for your own internships');
    }

    // Admin can view all
    return application;
  }

  @Patch(':id/status')
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateStatusDto: UpdateApplicationStatusDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.applicationsService.updateStatus(
      id,
      updateStatusDto.status,
      userId,
      companyId,
    );
  }

  @Patch(':id/approve')
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  approveApplication(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.applicationsService.updateStatus(
      id,
      ApplicationStatus.APPROVED,
      userId,
      companyId,
    );
  }

  @Patch(':id/reject')
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  rejectApplication(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.applicationsService.updateStatus(
      id,
      ApplicationStatus.REJECTED,
      userId,
      companyId,
    );
  }

  @Get('internship/:internshipId/my')
  @Roles(UserRole.STUDENT)
  async getMyApplicationForInternship(
    @Param('internshipId', ParseUUIDPipe) internshipId: string,
    @CurrentUser('studentId') studentId: string,
  ) {
    return this.applicationsService.getApplicationByInternshipAndStudent(
      internshipId,
      studentId,
    );
  }

  @Patch('internship/:internshipId/documents')
  @Roles(UserRole.STUDENT)
  async addDocuments(
    @Param('internshipId', ParseUUIDPipe) internshipId: string,
    @CurrentUser('studentId') studentId: string,
    @Body('documentPaths') documentPaths: string[],
  ) {
    return this.applicationsService.addDocuments(
      internshipId,
      studentId,
      documentPaths,
    );
  }

  @Patch('internship/:internshipId/documents/remove')
  @Roles(UserRole.STUDENT)
  async removeDocument(
    @Param('internshipId', ParseUUIDPipe) internshipId: string,
    @CurrentUser('studentId') studentId: string,
    @Body('documentPath') documentPath: string,
  ) {
    return this.applicationsService.removeDocument(
      internshipId,
      studentId,
      documentPath,
    );
  }
}
