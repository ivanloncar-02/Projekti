import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { DiaryService } from './diary.service';
import { CreateDiaryEntryDto } from './dto/create-diary-entry.dto';
import { UpdateDiaryEntryDto } from './dto/update-diary-entry.dto';
import { ApproveDiaryEntryDto } from './dto/approve-diary-entry.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/diary')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.STUDENT)
  create(
    @CurrentUser('studentId') studentId: string,
    @Body(ValidationPipe) createDiaryEntryDto: CreateDiaryEntryDto,
  ) {
    return this.diaryService.create(studentId, createDiaryEntryDto);
  }

  @Get('student/:studentId')
  @Roles(
    UserRole.STUDENT,
    UserRole.COMPANY_MENTOR,
    UserRole.ACADEMIC_MENTOR,
    UserRole.ADMIN,
  )
  findAllByStudent(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser('studentId') currentStudentId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    // Students can only view their own diary entries
    if (role === UserRole.STUDENT && studentId !== currentStudentId) {
      throw new ForbiddenException('You can only view your own diary entries');
    }
    return this.diaryService.findAllByStudent(studentId);
  }

  @Get('internship/:internshipId')
  @Roles(
    UserRole.STUDENT,
    UserRole.COMPANY_MENTOR,
    UserRole.ACADEMIC_MENTOR,
    UserRole.ADMIN,
  )
  findAllByInternship(
    @Param('internshipId', ParseUUIDPipe) internshipId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('studentId') studentId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.diaryService.findAllByInternship(internshipId, userId, role, studentId);
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
    @CurrentUser('studentId') currentStudentId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    const entry = await this.diaryService.findOne(id);
    // Students can only view their own diary entries
    if (role === UserRole.STUDENT && entry.studentId !== currentStudentId) {
      throw new ForbiddenException('You can only view your own diary entries');
    }
    return entry;
  }

  @Put(':id')
  @Roles(UserRole.STUDENT)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('studentId') studentId: string,
    @Body(ValidationPipe) updateDiaryEntryDto: UpdateDiaryEntryDto,
  ) {
    return this.diaryService.update(id, studentId, updateDiaryEntryDto);
  }

  @Patch(':id/approve')
  @Roles(UserRole.COMPANY_MENTOR, UserRole.ADMIN)
  approveDiaryEntry(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body(ValidationPipe) approveDto: ApproveDiaryEntryDto,
  ) {
    return this.diaryService.approveDiaryEntry(
      id,
      userId,
      approveDto.mentorComment,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.STUDENT)
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('studentId') studentId: string,
  ) {
    return this.diaryService.delete(id, studentId);
  }

  @Post(':id/comment')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.COMPANY_MENTOR)
  addComment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') mentorUserId: string,
    @Body(ValidationPipe) addCommentDto: AddCommentDto,
  ) {
    return this.diaryService.addComment(id, mentorUserId, addCommentDto.mentorComment);
  }
}
