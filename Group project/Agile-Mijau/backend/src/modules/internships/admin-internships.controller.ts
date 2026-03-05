import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminInternshipsService } from './admin-internships.service';
import { InternshipStatus } from '../../common/enums/internship-status.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('api/admin/internships')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminInternshipsController {
  constructor(
    private readonly adminInternshipsService: AdminInternshipsService,
  ) {}

  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
    @Query('student') student?: string,
    @Query('company', new ParseUUIDPipe({ optional: true }))
    company?: string,
    @Query('status') status?: InternshipStatus,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    return this.adminInternshipsService.findAllInternships({
      page,
      limit,
      year,
      student,
      company,
      status,
      search,
      sortBy,
      order,
    });
  }
}
