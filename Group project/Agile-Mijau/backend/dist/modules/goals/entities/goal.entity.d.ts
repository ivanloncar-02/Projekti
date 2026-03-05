import { Student } from '../../students/entities/student.entity';
import { Internship } from '../../internships/entities/internship.entity';
export declare class Goal {
    id: string;
    studentId: string;
    student: Student;
    internshipId: string;
    internship: Internship;
    title: string;
    description: string;
    completed: boolean;
    completedAt: Date | null;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
