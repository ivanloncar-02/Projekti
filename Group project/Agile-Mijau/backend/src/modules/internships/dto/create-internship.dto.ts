import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { InternshipStatus } from '../../../common/enums/internship-status.enum';
import { IsDateAfter } from '../../../common/validators/is-date-after.validator';

export class CreateInternshipDto {
  @IsUUID()
  @IsOptional()
  companyId?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(100, { message: 'Description must be at least 100 characters long' })
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Location must be at least 2 characters long' })
  location: string;

  @IsNumber()
  @Min(1, { message: 'Duration must be at least 1 month' })
  duration: number;

  @IsNumber()
  @Min(1, { message: 'Required hours must be at least 1' })
  requiredHours: number;

  @IsArray()
  @IsString({ each: true })
  requiredSkills: string[];

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Salary cannot be negative' })
  salary?: number;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  @IsDateAfter('startDate', { message: 'End date must be after start date' })
  endDate: string;

  @IsEnum(InternshipStatus)
  @IsOptional()
  status?: InternshipStatus;
}
