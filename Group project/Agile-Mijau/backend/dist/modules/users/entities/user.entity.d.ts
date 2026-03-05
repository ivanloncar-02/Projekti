import { UserRole } from '../../../common/enums/user-role.enum';
import { Student } from '../../students/entities/student.entity';
import { Company } from '../../companies/entities/company.entity';
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    studentId: string | null;
    student: Student;
    companyId: string | null;
    company: Company | null;
}
