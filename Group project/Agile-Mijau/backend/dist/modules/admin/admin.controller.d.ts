import { AdminService } from './admin.service';
import { AssignMentorDto } from './dto/assign-mentor.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    assignMentor(dto: AssignMentorDto): Promise<{
        message: string;
        studentId: string;
    }>;
}
