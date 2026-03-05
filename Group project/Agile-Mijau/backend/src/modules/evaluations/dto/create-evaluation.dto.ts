import { IsOptional, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';

export class CreateEvaluationDto {
  @IsUUID()
  internshipId: string;

  @IsUUID()
  mentorId: string;

  @Min(1)
  @Max(5)
  technicalSkills: number;

  @Min(1)
  @Max(5)
  communication: number;

  @Min(1)
  @Max(5)
  workEthic: number;

  @IsString()
  @MinLength(50)
  overallPerformance: string;

  @IsOptional()
  @IsString()
  recommendations?: string;
}
