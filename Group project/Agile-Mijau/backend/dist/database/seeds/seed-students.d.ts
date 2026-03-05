import { User } from '../../modules/users/entities/user.entity';
import { Student } from '../../modules/students/entities/student.entity';
export declare function seedStudents(dataSource?: import("typeorm").DataSource): Promise<{
    user: User;
    student: Student;
}[]>;
