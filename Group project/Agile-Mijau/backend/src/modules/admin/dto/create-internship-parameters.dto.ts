import { IsNotEmpty, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateInternshipParametersDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  duration: number; // months

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  requiredHours: number;

  @IsDateString()
  @IsNotEmpty()
  applicationDeadline: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
