import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from './entities/user.entity';
import { IsEnum, IsOptional } from 'class-validator';

class UpdateRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}

class FindAllUsersQueryDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  search?: string;

  @IsOptional()
  isActive?: string; // Will be parsed to boolean
}

@Controller('api/admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query() query: FindAllUsersQueryDto) {
    const options = {
      role: query.role,
      search: query.search,
      isActive: query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined,
    };
    return this.usersService.findAll(options);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id/role')
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() currentUser: User,
  ) {
    // Prevent changing own role
    if (currentUser.id === id) {
      throw new BadRequestException('Ne možete promijeniti vlastitu ulogu');
    }

    // Only ADMIN can change roles
    if (currentUser.role !== UserRole.ADMIN) {
      throw new BadRequestException('Samo administrator može mijenjati uloge korisnika');
    }

    return this.usersService.updateRole(id, dto.role);
  }

  @Patch(':id/toggle-active')
  async toggleActive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    // Prevent deactivating self
    if (currentUser.id === id) {
      throw new BadRequestException('Ne možete deaktivirati vlastiti račun');
    }

    // Only ADMIN can toggle active status
    if (currentUser.role !== UserRole.ADMIN) {
      throw new BadRequestException('Samo administrator može aktivirati/deaktivirati korisnike');
    }

    return this.usersService.toggleActive(id);
  }
}
