import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class AddCommentDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'Komentar je obavezan' })
  @MaxLength(500, { message: 'Komentar može imati maksimalno 500 znakova' })
  mentorComment: string;
}
