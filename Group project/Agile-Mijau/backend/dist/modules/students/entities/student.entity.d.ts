import { User } from '../../users/entities/user.entity';
import { AcademicMentor } from '../../mentors/entities/academic-mentor.entity';
export declare class Student {
    id: string;
    userId: string;
    user: User;
    studentNumber: string;
    major: string;
    academicYear: string;
    academicMentorId: string | null;
    academicMentor: AcademicMentor | null;
    companyMentorId: string | null;
    companyMentor: User | null;
    phone: string | null;
    address: string | null;
    cv: string | null;
    createdAt: Date;
    updatedAt: Date;
}
