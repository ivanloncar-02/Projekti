import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) {}

  async createStudentProfile(userId: string, data: CreateStudentProfileDto): Promise<Student> {
    // Check if student profile already exists for this user
    const existingProfile = await this.studentsRepository.findOne({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictException('Student profile already exists for this user');
    }

    // Check if student number is already taken
    const existingStudentNumber = await this.studentsRepository.findOne({
      where: { studentNumber: data.studentNumber },
    });

    if (existingStudentNumber) {
      throw new ConflictException('Student number already exists');
    }

    // Create new student profile
    const student = new Student();
    student.userId = userId;
    student.studentNumber = data.studentNumber;
    student.major = data.major;
    student.academicYear = data.academicYear;
    student.academicMentorId = data.academicMentorId || null;
    student.phone = data.phone || null;
    student.address = data.address || null;
    student.cv = data.cv || null;

    return await this.studentsRepository.save(student);
  }

  async findAll(): Promise<Student[]> {
    return this.studentsRepository.find({
      relations: ['user', 'academicMentor', 'academicMentor.user', 'companyMentor'],
    });
  }

  async findByUserId(userId: string): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: { userId },
      relations: ['user', 'academicMentor'],
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    return student;
  }

  async findById(id: string): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: { id },
      relations: ['user', 'academicMentor'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }
}
