import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  Matches,
  IsNotEmpty,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../../../common/enums/user-role.enum';

export class RegisterDto {
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName: string;

  @IsEnum(UserRole, { message: 'Invalid user role' })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MinLength(10, { message: 'Phone must be at least 10 characters long' })
  @MaxLength(15, { message: 'Phone must not exceed 15 characters' })
  phone?: string;

  // Student-specific fields (required if role is STUDENT)
  @ValidateIf(o => o.role === UserRole.STUDENT)
  @IsNotEmpty({ message: 'Student number is required for student registration' })
  @IsString()
  studentNumber?: string;

  @ValidateIf(o => o.role === UserRole.STUDENT)
  @IsNotEmpty({ message: 'Major is required for student registration' })
  @IsString()
  major?: string;

  @ValidateIf(o => o.role === UserRole.STUDENT)
  @IsNotEmpty({ message: 'Academic year is required for student registration' })
  @IsString()
  academicYear?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
