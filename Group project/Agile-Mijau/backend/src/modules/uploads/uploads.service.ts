import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { User } from '../users/entities/user.entity';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updateStudentCV(userId: string, filename: string): Promise<void> {
    const student = await this.studentRepository.findOne({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('Student profil nije pronađen');
    }

    // Delete old CV if exists
    if (student.cv) {
      const oldPath = join(process.cwd(), 'uploads', 'cv', student.cv);
      if (existsSync(oldPath)) {
        try {
          unlinkSync(oldPath);
        } catch (error) {
          console.error('Error deleting old CV:', error);
        }
      }
    }

    student.cv = filename;
    await this.studentRepository.save(student);
  }

  async getStudentCV(studentId: string): Promise<string | null> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });

    return student?.cv || null;
  }

  deleteFile(type: 'cv' | 'documents', filename: string): boolean {
    const filePath = join(process.cwd(), 'uploads', type, filename);
    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath);
        return true;
      } catch (error) {
        console.error('Error deleting file:', error);
        return false;
      }
    }
    return false;
  }
}
