import { MentorsService } from './mentors.service';
import { UserRole } from '../../common/enums/user-role.enum';
import { UsersService } from '../users/users.service';
export declare class MentorsController {
    private readonly mentorsService;
    private readonly usersService;
    constructor(mentorsService: MentorsService, usersService: UsersService);
    findAll(): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: UserRole;
        companyName: string | undefined;
    }[]>;
    getAcademicMentorStudents(mentorUserId: string): Promise<{
        items: any[];
    }>;
    getStudentOverview(studentId: string, mentorUserId: string): Promise<{
        goals: import("../goals/entities/goal.entity").Goal[];
        diary: import("../diary/entities/diary-entry.entity").DiaryEntry[];
    }>;
    getCompanyMentorStudents(mentorUserId: string): Promise<{
        items: any[];
    }>;
}
