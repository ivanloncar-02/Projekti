import { IsUUID, IsEnum } from 'class-validator';

export enum MentorType {
  ACADEMIC_MENTOR = 'ACADEMIC_MENTOR',
  COMPANY_MENTOR = 'COMPANY_MENTOR',
}

export class AssignMentorDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  mentorId: string;

  @IsEnum(MentorType)
  mentorType: MentorType;
}
