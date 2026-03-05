import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SubmitGradeDto {
  @IsInt()
  @Min(1)
  @Max(5)
  grade: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
