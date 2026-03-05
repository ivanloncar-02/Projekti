import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { AcademicMentor } from '../mentors/entities/academic-mentor.entity';
import { User } from '../users/entities/user.entity';
import { Application } from '../applications/entities/application.entity';
import { AssignMentorDto } from './dto/assign-mentor.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AdminService {
    private readonly studentRepository;
    private readonly academicMentorRepository;
    private readonly userRepository;
    private readonly applicationRepository;
    private readonly notificationsService;
    constructor(studentRepository: Repository<Student>, academicMentorRepository: Repository<AcademicMentor>, userRepository: Repository<User>, applicationRepository: Repository<Application>, notificationsService: NotificationsService);
    assignMentor(dto: AssignMentorDto): Promise<Student>;
}
