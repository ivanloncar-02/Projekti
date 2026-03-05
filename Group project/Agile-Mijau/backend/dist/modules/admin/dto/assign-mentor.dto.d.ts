export declare enum MentorType {
    ACADEMIC_MENTOR = "ACADEMIC_MENTOR",
    COMPANY_MENTOR = "COMPANY_MENTOR"
}
export declare class AssignMentorDto {
    studentId: string;
    mentorId: string;
    mentorType: MentorType;
}
