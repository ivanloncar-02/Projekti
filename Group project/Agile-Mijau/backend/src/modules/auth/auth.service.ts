import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { StudentsService } from '../students/students.service';
import { CompaniesService } from '../companies/companies.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterEmployerDto } from './dto/register-employer.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private studentsService: StudentsService,
    private companiesService: CompaniesService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user entity
    const user = await this.usersService.create({
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      phone: dto.phone,
      isActive: true,
    });

    // If user is a student, create student profile and link it to user
    if (dto.role === UserRole.STUDENT) {
      const student = await this.studentsService.createStudentProfile(user.id, {
        studentNumber: dto.studentNumber!,
        major: dto.major!,
        academicYear: dto.academicYear!,
        phone: dto.phone,
        address: dto.address,
      });
      // Update user with studentId
      await this.usersService.update(user.id, { studentId: student.id });
      user.studentId = student.id;
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const access_token = this.jwtService.sign(payload);

    // Return token and user without password
    const { password, ...userWithoutPassword } = user;
    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async registerEmployer(dto: RegisterEmployerDto): Promise<{ access_token: string; user: Omit<User, 'password'>; company: Company }> {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create company first
    const company = await this.companiesService.create({
      name: dto.name,
      oib: dto.oib,
      email: dto.email,
      address: dto.address,
      website: dto.website,
      phone: dto.phone,
      contactPerson: dto.contactPerson,
    });

    // Create user entity linked to the company
    const user = await this.usersService.create({
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      firstName: dto.contactPerson.split(' ')[0] || 'Employer',
      lastName: dto.contactPerson.split(' ').slice(1).join(' ') || 'User',
      role: UserRole.EMPLOYER,
      phone: dto.phone,
      isActive: true,
      companyId: company.id,
    });

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: company.id,
    };
    const access_token = this.jwtService.sign(payload);

    // Return token, user without password, and company
    const { password, ...userWithoutPassword } = user;
    return {
      access_token,
      user: userWithoutPassword,
      company,
    };
  }

  async login(dto: LoginDto): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    // Find user by email
    const user = await this.usersService.findByEmail(dto.email.toLowerCase());

    // For security, return generic message for both cases (user not found OR wrong password)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Compare password with bcrypt
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token with role-specific IDs
    const payload: {
      sub: string;
      email: string;
      role: UserRole;
      companyId?: string;
      studentId?: string;
    } = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Include companyId for employers and company mentors
    if (user.companyId) {
      payload.companyId = user.companyId;
    }

    // Include studentId for students
    if (user.studentId) {
      payload.studentId = user.studentId;
    }

    const access_token = this.jwtService.sign(payload);

    // Return token and user without password
    const { password, ...userWithoutPassword } = user;
    return {
      access_token,
      user: userWithoutPassword,
    };
  }
}
