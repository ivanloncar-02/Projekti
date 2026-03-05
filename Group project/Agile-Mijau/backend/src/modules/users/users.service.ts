import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';

export interface FindAllUsersOptions {
  role?: UserRole;
  search?: string;
  isActive?: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(options: FindAllUsersOptions = {}): Promise<User[]> {
    const where: FindOptionsWhere<User>[] = [];

    // Build base conditions
    const baseCondition: FindOptionsWhere<User> = {};

    if (options.role) {
      baseCondition.role = options.role;
    }

    if (options.isActive !== undefined) {
      baseCondition.isActive = options.isActive;
    }

    // If search is provided, search across multiple fields
    if (options.search) {
      const searchTerm = `%${options.search}%`;
      where.push(
        { ...baseCondition, firstName: Like(searchTerm) },
        { ...baseCondition, lastName: Like(searchTerm) },
        { ...baseCondition, email: Like(searchTerm) },
      );
    } else {
      where.push(baseCondition);
    }

    return this.usersRepository.find({
      where: where.length > 0 ? where : undefined,
      relations: ['company', 'student'],
      order: { lastName: 'ASC', firstName: 'ASC' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        company: {
          id: true,
          name: true,
        },
        student: {
          id: true,
          studentNumber: true,
        },
      },
    });
  }

  async findByRoles(roles: UserRole[]): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: In(roles), isActive: true },
      relations: ['company'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['company', 'student'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, userData);
    return this.findById(id);
  }

  async updateRole(id: string, newRole: UserRole): Promise<User> {
    const user = await this.findById(id);

    // Prevent changing own role (will be checked in controller with current user)
    // Prevent removing last admin
    if (user.role === UserRole.ADMIN && newRole !== UserRole.ADMIN) {
      const adminCount = await this.usersRepository.count({
        where: { role: UserRole.ADMIN, isActive: true },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Ne možete ukloniti posljednjeg administratora');
      }
    }

    user.role = newRole;
    return this.usersRepository.save(user);
  }

  async toggleActive(id: string): Promise<User> {
    const user = await this.findById(id);

    // Prevent deactivating last admin
    if (user.role === UserRole.ADMIN && user.isActive) {
      const activeAdminCount = await this.usersRepository.count({
        where: { role: UserRole.ADMIN, isActive: true },
      });
      if (activeAdminCount <= 1) {
        throw new BadRequestException('Ne možete deaktivirati posljednjeg administratora');
      }
    }

    user.isActive = !user.isActive;
    return this.usersRepository.save(user);
  }
}
