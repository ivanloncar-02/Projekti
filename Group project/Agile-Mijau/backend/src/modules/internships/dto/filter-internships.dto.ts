import { IsOptional, IsString, IsUUID, IsNumber, Min } from 'class-validator';

export class FilterInternshipsDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUUID()
  company?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsString()
  field?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxSalary?: number;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
