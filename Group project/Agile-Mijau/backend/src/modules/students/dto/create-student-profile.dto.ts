import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateStudentProfileDto {
  @IsString()
  @IsNotEmpty()
  studentNumber: string;

  @IsString()
  @IsNotEmpty()
  major: string;

  @IsString()
  @IsNotEmpty()
  academicYear: string;

  @IsOptional()
  @IsUUID()
  academicMentorId?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  cv?: string;
}
