import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateGoalDto {
  @IsUUID()
  @IsNotEmpty()
  internshipId: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
