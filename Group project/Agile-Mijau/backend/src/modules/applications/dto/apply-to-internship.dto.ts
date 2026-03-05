import {
  IsNotEmpty,
  IsString,
  IsOptional,
  Matches,
} from 'class-validator';

export class ApplyToInternshipDto {
  @IsString()
  @IsOptional()
  coverLetter?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[+]?[\d\s\-\(\)]+$/, { message: 'Please provide a valid phone number' })
  phone: string;

  // TODO: Add file upload validation when multer is configured
  // Files will be handled separately in controller with @UploadedFile() and @UploadedFiles()
  // cv?: Express.Multer.File (PDF, max 5MB)
  // additionalDocuments?: Express.Multer.File[] (optional, max 5 files)
}
