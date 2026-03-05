import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ToggleApprovalLockDto {
  @IsBoolean()
  isLocked: boolean;

  @IsString()
  @IsOptional()
  reason?: string;
}
