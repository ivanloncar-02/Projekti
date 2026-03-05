import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
export declare class StudentsService {
    private studentsRepository;
    constructor(studentsRepository: Repository<Student>);
    createStudentProfile(userId: string, data: CreateStudentProfileDto): Promise<Student>;
    findAll(): Promise<Student[]>;
    findByUserId(userId: string): Promise<Student>;
    findById(id: string): Promise<Student>;
}
