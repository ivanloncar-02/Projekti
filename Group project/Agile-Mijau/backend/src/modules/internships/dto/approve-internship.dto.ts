import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveInternshipDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}
