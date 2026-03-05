import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ValidationPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ForbiddenException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../uploads/multer.config';
import { InternshipsService } from './internships.service';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';
import { UpdateInternshipStatusDto } from './dto/update-internship-status.dto';
import { ApproveInternshipDto } from './dto/approve-internship.dto';
import { FilterInternshipsDto } from './dto/filter-internships.dto';
import { SubmitGradeDto } from './dto/submit-grade.dto';
import { InternshipStatus } from '../../common/enums/internship-status.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { EvaluationsService } from '../evaluations/evaluations.service';
import { CreateCompanyEvaluationDto } from '../evaluations/dto/create-company-evaluation.dto';
import { ApplicationsService } from '../applications/applications.service';
import { ApplyToInternshipDto } from '../applications/dto/apply-to-internship.dto';

@Controller('api/internships')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InternshipsController {
  constructor(
    private readonly internshipsService: InternshipsService,
    private readonly evaluationsService: EvaluationsService,
    private readonly applicationsService: ApplicationsService,
  ) {}

  @Get('public')
  @Public()
  findPublic(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.internshipsService.findPublicInternships(page, limit);
  }

  @Get('public/:id')
  @Public()
  findOnePublic(@Param('id', ParseUUIDPipe) id: string) {
    return this.internshipsService.findOnePublic(id);
  }

  @Get('filter')
  @Public()
  findFiltered(
    @Query('location') location?: string,
    @Query('company', new ParseUUIDPipe({ optional: true })) company?: string,
    @Query('duration', new ParseIntPipe({ optional: true })) duration?: number,
    @Query('field') field?: string,
    @Query('minSalary', new ParseIntPipe({ optional: true })) minSalary?: number,
    @Query('maxSalary', new ParseIntPipe({ optional: true })) maxSalary?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const filters: FilterInternshipsDto = {
      location,
      company,
      duration,
      field,
      minSalary,
      maxSalary,
      page,
      limit,
    };
    return this.internshipsService.findFiltered(filters);
  }

  @Get('my')
  @Roles(UserRole.EMPLOYER)
  findMyInternships(
    @CurrentUser('companyId') companyId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.internshipsService.findByCompany(companyId, page, limit);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  create(
    @Body(ValidationPipe) createInternshipDto: CreateInternshipDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    // Employers can only create internships for their own company
    if (role === UserRole.EMPLOYER) {
      return this.internshipsService.create({
        ...createInternshipDto,
        companyId,
      });
    }
    // Admin can create for any company
    return this.internshipsService.create(createInternshipDto);
  }

  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('status') status?: InternshipStatus,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
    @Query('student') student?: string,
    @Query('companyId', new ParseUUIDPipe({ optional: true }))
    companyId?: string,
  ) {
    return this.internshipsService.findAll(page, limit, {
      status,
      year,
      student,
      companyId,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.internshipsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateInternshipDto: UpdateInternshipDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    // Employers can only update their own company's internships
    if (role === UserRole.EMPLOYER) {
      const isOwner = await this.internshipsService.verifyOwnership(id, companyId);
      if (!isOwner) {
        throw new ForbiddenException('You can only update your own internships');
      }
    }
    return this.internshipsService.update(id, updateInternshipDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateStatusDto: UpdateInternshipStatusDto,
  ) {
    // TODO: Extract userId from authenticated user
    return this.internshipsService.updateStatus(id, updateStatusDto.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    // Employers can only delete their own company's internships
    if (role === UserRole.EMPLOYER) {
      const isOwner = await this.internshipsService.verifyOwnership(id, companyId);
      if (!isOwner) {
        throw new ForbiddenException('You can only delete your own internships');
      }
    }
    return this.internshipsService.remove(id);
  }

  @Patch(':id/archive')
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  async archive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    // Employers can only archive their own company's internships
    if (role === UserRole.EMPLOYER) {
      const isOwner = await this.internshipsService.verifyOwnership(id, companyId);
      if (!isOwner) {
        throw new ForbiddenException('You can only archive your own internships');
      }
    }
    return this.internshipsService.archive(id);
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body(ValidationPipe) approveDto: ApproveInternshipDto,
  ) {
    return this.internshipsService.approve(id, userId);
  }

  @Post(':id/grade')
  @Roles(UserRole.ACADEMIC_MENTOR)
  submitGrade(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) submitGradeDto: SubmitGradeDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.internshipsService.submitGrade(
      id,
      submitGradeDto.grade,
      userId,
      submitGradeDto.comment,
    );
  }

  @Get(':id/company-evaluation')
  @Roles(UserRole.STUDENT, UserRole.COMPANY_MENTOR, UserRole.ACADEMIC_MENTOR, UserRole.ADMIN)
  async getCompanyEvaluation(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('studentId') studentId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    // Students can only view evaluations for their own internships
    if (role === UserRole.STUDENT) {
      const hasAccess = await this.evaluationsService.verifyStudentAccess(id, studentId);
      if (!hasAccess) {
        throw new ForbiddenException('Možete pregledavati samo evaluacije za vlastite prakse');
      }
    }
    return this.evaluationsService.findByInternship(id);
  }

  @Post(':id/company-evaluation')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.COMPANY_MENTOR)
  submitCompanyEvaluation(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') mentorUserId: string,
    @Body(ValidationPipe) createEvaluationDto: CreateCompanyEvaluationDto,
  ) {
    return this.evaluationsService.submitCompanyEvaluation(
      id,
      mentorUserId,
      createEvaluationDto,
    );
  }

  @Post(':id/apply')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.STUDENT)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'cv', maxCount: 1 },
        { name: 'additionalDocuments', maxCount: 5 },
      ],
      {
        storage: multerConfig.documents.storage,
        fileFilter: multerConfig.documents.fileFilter,
        limits: multerConfig.documents.limits,
      },
    ),
  )
  async applyToInternship(
    @Param('id', ParseUUIDPipe) internshipId: string,
    @CurrentUser('studentId') studentId: string,
    @Body() applyDto: ApplyToInternshipDto,
    @UploadedFiles()
    files: {
      cv?: Express.Multer.File[];
      additionalDocuments?: Express.Multer.File[];
    },
  ) {
    // Extract file paths if files were uploaded
    const cvPath = files?.cv?.[0]
      ? `/api/uploads/documents/${files.cv[0].filename}`
      : undefined;
    const documentsPaths = files?.additionalDocuments?.map(
      (f) => `/api/uploads/documents/${f.filename}`,
    );

    const application = await this.applicationsService.create({
      internshipId,
      studentId,
      coverLetter: applyDto.coverLetter,
      phone: applyDto.phone,
      cvPath,
      documentsPaths,
    });

    return application;
  }
}
