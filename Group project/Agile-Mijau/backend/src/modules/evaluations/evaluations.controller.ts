import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('api/evaluations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.COMPANY_MENTOR, UserRole.ADMIN)
  create(@Body(ValidationPipe) createEvaluationDto: CreateEvaluationDto) {
    return this.evaluationsService.create(createEvaluationDto);
  }

  @Get('internship/:internshipId/status')
  @Roles(UserRole.ADMIN, UserRole.ACADEMIC_MENTOR, UserRole.COMPANY_MENTOR, UserRole.STUDENT)
  async checkStatus(@Param('internshipId', ParseUUIDPipe) internshipId: string) {
    const evaluation = await this.evaluationsService.findByInternship(internshipId);
    return { completed: !!evaluation };
  }

  @Get('internship/:internshipId')
  @Roles(
    UserRole.STUDENT,
    UserRole.COMPANY_MENTOR,
    UserRole.ACADEMIC_MENTOR,
    UserRole.ADMIN,
  )
  async findByInternship(
    @Param('internshipId', ParseUUIDPipe) internshipId: string,
    @CurrentUser('studentId') studentId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    // Students can only view evaluations for their own internships
    if (role === UserRole.STUDENT) {
      const hasAccess = await this.evaluationsService.verifyStudentAccess(
        internshipId,
        studentId,
      );
      if (!hasAccess) {
        throw new ForbiddenException('You can only view evaluations for your own internships');
      }
    }
    return this.evaluationsService.findByInternship(internshipId);
  }

  @Delete('internship/:internshipId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.COMPANY_MENTOR)
  async deleteByInternship(
    @Param('internshipId', ParseUUIDPipe) internshipId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.evaluationsService.deleteByInternship(internshipId, userId, role);
  }

  @Get(':id')
  @Roles(
    UserRole.STUDENT,
    UserRole.COMPANY_MENTOR,
    UserRole.ACADEMIC_MENTOR,
    UserRole.ADMIN,
  )
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('studentId') studentId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    const evaluation = await this.evaluationsService.findOne(id);
    // Students can only view evaluations for their own internships
    if (role === UserRole.STUDENT) {
      const hasAccess = await this.evaluationsService.verifyStudentAccess(
        evaluation.internshipId,
        studentId,
      );
      if (!hasAccess) {
        throw new ForbiddenException('You can only view evaluations for your own internships');
      }
    }
    return evaluation;
  }
}
