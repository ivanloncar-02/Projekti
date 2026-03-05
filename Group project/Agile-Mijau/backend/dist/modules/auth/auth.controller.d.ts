import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterEmployerDto } from './dto/register-employer.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: Omit<import("../users/entities/user.entity").User, "password">;
    }>;
    registerEmployer(registerEmployerDto: RegisterEmployerDto): Promise<{
        access_token: string;
        user: Omit<import("../users/entities/user.entity").User, "password">;
        company: import("../companies/entities/company.entity").Company;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: Omit<import("../users/entities/user.entity").User, "password">;
    }>;
}
