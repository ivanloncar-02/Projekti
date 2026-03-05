import { IsEnum, IsNotEmpty } from 'class-validator';
import { InternshipStatus } from '../../../common/enums/internship-status.enum';

export class UpdateInternshipStatusDto {
  @IsEnum(InternshipStatus)
  @IsNotEmpty()
  status: InternshipStatus;
}
