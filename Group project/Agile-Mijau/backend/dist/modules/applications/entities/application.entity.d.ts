import { Internship } from '../../internships/entities/internship.entity';
import { Student } from '../../students/entities/student.entity';
import { ApplicationStatus } from '../../../common/enums/application-status.enum';
export declare class Application {
    id: string;
    internshipId: string;
    internship: Internship;
    studentId: string;
    student: Student;
    status: ApplicationStatus;
    coverLetter: string | null;
    phone: string | null;
    cvPath: string | null;
    documentsPaths: string[] | null;
    statusChangedAt: Date | null;
    statusChangedBy: string | null;
    appliedAt: Date;
    updatedAt: Date;
}
