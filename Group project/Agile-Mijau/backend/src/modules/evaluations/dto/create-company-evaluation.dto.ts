import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateCompanyEvaluationDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'Ukupna ocjena mora biti najmanje 1' })
  @Max(5, { message: 'Ukupna ocjena može biti najviše 5' })
  rating: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'Ocjena tehničkih znanja mora biti najmanje 1' })
  @Max(5, { message: 'Ocjena tehničkih znanja može biti najviše 5' })
  technicalSkills: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'Ocjena komunikacije mora biti najmanje 1' })
  @Max(5, { message: 'Ocjena komunikacije može biti najviše 5' })
  communication: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'Ocjena radne etike mora biti najmanje 1' })
  @Max(5, { message: 'Ocjena radne etike može biti najviše 5' })
  workEthic: number;

  @IsOptional()
  @IsString()
  overallPerformance?: string;

  @IsOptional()
  @IsString()
  recommendations?: string;
}
