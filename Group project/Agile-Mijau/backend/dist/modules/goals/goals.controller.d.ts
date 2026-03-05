import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UserRole } from '../../common/enums/user-role.enum';
export declare class GoalsController {
    private readonly goalsService;
    constructor(goalsService: GoalsService);
    create(studentId: string, userId: string, role: UserRole, createGoalDto: CreateGoalDto): Promise<import("./entities/goal.entity").Goal>;
    findAll(studentId: string, userId: string, role: UserRole, internshipId?: string, queryStudentId?: string): Promise<import("./entities/goal.entity").Goal[]>;
    findOne(id: string, studentId: string, role: UserRole): Promise<import("./entities/goal.entity").Goal>;
    complete(studentId: string, id: string): Promise<import("./entities/goal.entity").Goal>;
}
