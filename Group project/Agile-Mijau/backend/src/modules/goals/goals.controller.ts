import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('api/goals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.STUDENT, UserRole.COMPANY_MENTOR)
  create(
    @CurrentUser('studentId') studentId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body(ValidationPipe) createGoalDto: CreateGoalDto,
  ) {
    // Students create goals for themselves
    if (role === UserRole.STUDENT) {
      return this.goalsService.create(studentId, createGoalDto);
    }
    // Company mentors create goals for students on their company's internships
    if (role === UserRole.COMPANY_MENTOR) {
      return this.goalsService.createForStudent(createGoalDto.internshipId, userId, createGoalDto);
    }
    throw new ForbiddenException('Nemate ovlasti za kreiranje ciljeva');
  }

  @Get()
  @Roles(UserRole.STUDENT, UserRole.ADMIN, UserRole.ACADEMIC_MENTOR, UserRole.COMPANY_MENTOR)
  findAll(
    @CurrentUser('studentId') studentId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Query('internshipId', new ParseUUIDPipe({ optional: true }))
    internshipId?: string,
    @Query('studentId', new ParseUUIDPipe({ optional: true }))
    queryStudentId?: string,
  ) {
    // Students can only view their own goals
    if (role === UserRole.STUDENT) {
      return this.goalsService.findAll(studentId, internshipId);
    }
    // Company mentors can view goals for internships at their company
    if (role === UserRole.COMPANY_MENTOR) {
      return this.goalsService.findAll(queryStudentId, internshipId, userId, role);
    }
    // Admin can view any student's goals; Academic mentor needs authorization check
    return this.goalsService.findAll(queryStudentId, internshipId, userId, role);
  }

  @Get(':id')
  @Roles(UserRole.STUDENT, UserRole.ADMIN, UserRole.ACADEMIC_MENTOR, UserRole.COMPANY_MENTOR)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('studentId') studentId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    const goal = await this.goalsService.findOne(id);
    // Students can only view their own goals
    if (role === UserRole.STUDENT && goal.studentId !== studentId) {
      throw new ForbiddenException('You can only view your own goals');
    }
    return goal;
  }

  @Patch(':id/complete')
  @Roles(UserRole.STUDENT)
  complete(
    @CurrentUser('studentId') studentId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.goalsService.complete(id, studentId);
  }
}
