import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsFiltersDto } from './dto/statistics-filters.dto';
import { StatisticsResponse } from './interfaces/statistics-response.interface';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('api/statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  async getStatistics(
    @Query('year') year?: string,
    @Query('company') company?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<StatisticsResponse> {
    const filters: StatisticsFiltersDto = {
      year: year || undefined,
      company: company || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    const statistics = await this.statisticsService.calculateStatistics(
      filters,
    );

    return {
      ...statistics,
      filters: {
        year: filters.year,
        company: filters.company,
        startDate: filters.startDate,
        endDate: filters.endDate,
      },
    };
  }
}
