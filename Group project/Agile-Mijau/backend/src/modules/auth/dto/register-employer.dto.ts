import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Matches,
  IsOptional,
  IsUrl,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterEmployerDto {
  @IsString({ message: 'Company name must be a string' })
  @IsNotEmpty({ message: 'Company name is required' })
  @MinLength(2, { message: 'Company name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Company name must not exceed 100 characters' })
  name: string;

  @IsString({ message: 'OIB must be a string' })
  @IsNotEmpty({ message: 'OIB is required' })
  @Length(11, 11, { message: 'OIB must be exactly 11 digits' })
  @Matches(/^\d{11}$/, { message: 'OIB must contain only digits' })
  oib: string;

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

  @IsString({ message: 'Address must be a string' })
  @IsNotEmpty({ message: 'Address is required' })
  @MinLength(5, { message: 'Address must be at least 5 characters long' })
  @MaxLength(200, { message: 'Address must not exceed 200 characters' })
  address: string;

  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid URL' })
  website?: string;

  @IsString({ message: 'Phone must be a string' })
  @IsNotEmpty({ message: 'Phone is required' })
  @MinLength(10, { message: 'Phone must be at least 10 characters long' })
  @MaxLength(15, { message: 'Phone must not exceed 15 characters' })
  @Matches(/^(\+385|0)\d{8,9}$/, {
    message: 'Please provide a valid Croatian phone number',
  })
  phone: string;

  @IsString({ message: 'Contact person must be a string' })
  @IsNotEmpty({ message: 'Contact person is required' })
  @MinLength(2, { message: 'Contact person name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Contact person name must not exceed 100 characters' })
  contactPerson: string;
}
