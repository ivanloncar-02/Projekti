import { IsOptional, IsString, IsDateString, IsUUID, ValidateIf } from 'class-validator';

export class StatisticsFiltersDto {
  @IsOptional()
  @IsString()
  year?: string;

  @IsOptional()
  @ValidateIf((o) => o.company !== '' && o.company !== undefined)
  @IsUUID()
  company?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
