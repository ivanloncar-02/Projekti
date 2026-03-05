import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InternshipParametersService } from './internship-parameters.service';
import { CreateInternshipParametersDto } from './dto/create-internship-parameters.dto';
import { ToggleApprovalLockDto } from './dto/toggle-approval-lock.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('api/admin/internship-parameters')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class InternshipParametersController {
  constructor(
    private readonly parametersService: InternshipParametersService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createDto: CreateInternshipParametersDto,
  ) {
    return await this.parametersService.create(createDto);
  }

  @Get('active')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYER)
  async getActive() {
    const params = await this.parametersService.getActive();
    return params || null;
  }

  @Get()
  async getAll() {
    return await this.parametersService.getAll();
  }

  @Patch('approval-lock')
  @HttpCode(HttpStatus.OK)
  async toggleApprovalLock(
    @Body(ValidationPipe) dto: ToggleApprovalLockDto,
  ) {
    return await this.parametersService.toggleApprovalLock(dto);
  }

  @Get('approval-lock')
  async getApprovalLockStatus() {
    return await this.parametersService.isApprovalLocked();
  }
}
