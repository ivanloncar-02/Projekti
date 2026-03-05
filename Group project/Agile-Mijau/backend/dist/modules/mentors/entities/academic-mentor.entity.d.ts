import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';
export declare class AcademicMentor {
    id: string;
    userId: string;
    user: User;
    department: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    students: Student[];
}
