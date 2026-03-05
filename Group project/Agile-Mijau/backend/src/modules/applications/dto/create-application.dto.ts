import { IsNotEmpty, IsOptional, IsString, IsUUID, IsArray } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  @IsNotEmpty()
  internshipId: string;

  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsOptional()
  coverLetter?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  cvPath?: string;

  @IsArray()
  @IsOptional()
  documentsPaths?: string[];
}
