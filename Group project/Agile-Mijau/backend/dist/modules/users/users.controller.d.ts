import { UsersService } from './users.service';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from './entities/user.entity';
declare class UpdateRoleDto {
    role: UserRole;
}
declare class FindAllUsersQueryDto {
    role?: UserRole;
    search?: string;
    isActive?: string;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(query: FindAllUsersQueryDto): Promise<User[]>;
    findOne(id: string): Promise<User>;
    updateRole(id: string, dto: UpdateRoleDto, currentUser: User): Promise<User>;
    toggleActive(id: string, currentUser: User): Promise<User>;
}
export {};
