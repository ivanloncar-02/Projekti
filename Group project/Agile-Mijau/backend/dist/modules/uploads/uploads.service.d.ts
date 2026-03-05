import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { User } from '../users/entities/user.entity';
export declare class UploadsService {
    private readonly studentRepository;
    private readonly userRepository;
    constructor(studentRepository: Repository<Student>, userRepository: Repository<User>);
    updateStudentCV(userId: string, filename: string): Promise<void>;
    getStudentCV(studentId: string): Promise<string | null>;
    deleteFile(type: 'cv' | 'documents', filename: string): boolean;
}
