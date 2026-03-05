import { Student } from '../../students/entities/student.entity';
import { Internship } from '../../internships/entities/internship.entity';
import { CompanyMentor } from '../../mentors/entities/company-mentor.entity';
export declare class DiaryEntry {
    id: string;
    studentId: string;
    student: Student;
    internshipId: string;
    internship: Internship;
    date: Date;
    entry: string;
    hoursWorked: number;
    approved: boolean;
    approvedAt: Date | null;
    approvedBy: string | null;
    approver: CompanyMentor | null;
    mentorComment: string | null;
    createdAt: Date;
    updatedAt: Date;
}
