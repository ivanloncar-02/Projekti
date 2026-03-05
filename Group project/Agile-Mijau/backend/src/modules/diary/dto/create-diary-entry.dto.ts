import { IsDateString, IsNotEmpty, IsString, IsUUID, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateDiaryEntryDto {
  @IsUUID()
  @IsNotEmpty()
  internshipId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  entry: string;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Broj sati ne može biti negativan' })
  hoursWorked?: number;
}
