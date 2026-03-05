import { IsOptional, IsString } from 'class-validator';

export class ApproveDiaryEntryDto {
  @IsOptional()
  @IsString()
  mentorComment?: string;
}
