import { StudentsService } from './students.service';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { UserRole } from '../../common/enums/user-role.enum';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    findAll(): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        indexNumber: string;
        academicMentor: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        companyMentor: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    }[]>;
    createProfile(userId: string, createStudentProfileDto: CreateStudentProfileDto): Promise<import("./entities/student.entity").Student>;
    findOne(id: string, currentStudentId: string, role: UserRole): Promise<import("./entities/student.entity").Student>;
    findByUserId(userId: string, currentUserId: string, role: UserRole): Promise<import("./entities/student.entity").Student>;
}
