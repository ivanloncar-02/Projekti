import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { StudentsService } from '../students/students.service';
import { CompaniesService } from '../companies/companies.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterEmployerDto } from './dto/register-employer.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
export declare class AuthService {
    private usersService;
    private studentsService;
    private companiesService;
    private jwtService;
    constructor(usersService: UsersService, studentsService: StudentsService, companiesService: CompaniesService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
        user: Omit<User, 'password'>;
    }>;
    registerEmployer(dto: RegisterEmployerDto): Promise<{
        access_token: string;
        user: Omit<User, 'password'>;
        company: Company;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: Omit<User, 'password'>;
    }>;
}
