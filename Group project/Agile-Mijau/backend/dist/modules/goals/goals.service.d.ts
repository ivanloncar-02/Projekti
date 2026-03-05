import { Repository } from 'typeorm';
import { Goal } from './entities/goal.entity';
import { AcademicMentor } from '../mentors/entities/academic-mentor.entity';
import { CompanyMentor } from '../mentors/entities/company-mentor.entity';
import { Student } from '../students/entities/student.entity';
import { Application } from '../applications/entities/application.entity';
import { Internship } from '../internships/entities/internship.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UserRole } from '../../common/enums/user-role.enum';
export declare class GoalsService {
    private goalsRepository;
    private academicMentorsRepository;
    private companyMentorsRepository;
    private studentsRepository;
    private applicationsRepository;
    private internshipsRepository;
    constructor(goalsRepository: Repository<Goal>, academicMentorsRepository: Repository<AcademicMentor>, companyMentorsRepository: Repository<CompanyMentor>, studentsRepository: Repository<Student>, applicationsRepository: Repository<Application>, internshipsRepository: Repository<Internship>);
    create(studentId: string, createGoalDto: CreateGoalDto): Promise<Goal>;
    findAll(studentId?: string, internshipId?: string, userId?: string, role?: UserRole): Promise<Goal[]>;
    private verifyAcademicMentorAccessToStudent;
    private verifyCompanyMentorAccessToInternship;
    createForStudent(internshipId: string, userId: string, createGoalDto: CreateGoalDto): Promise<Goal>;
    findOne(id: string): Promise<Goal>;
    complete(id: string, studentId: string): Promise<Goal>;
    verifyOwnership(goalId: string, studentId: string): Promise<boolean>;
}
