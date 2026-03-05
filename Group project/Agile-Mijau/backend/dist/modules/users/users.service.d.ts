import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
export interface FindAllUsersOptions {
    role?: UserRole;
    search?: string;
    isActive?: boolean;
}
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    findAll(options?: FindAllUsersOptions): Promise<User[]>;
    findByRoles(roles: UserRole[]): Promise<User[]>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User>;
    create(userData: Partial<User>): Promise<User>;
    update(id: string, userData: Partial<User>): Promise<User>;
    updateRole(id: string, newRole: UserRole): Promise<User>;
    toggleActive(id: string): Promise<User>;
}
