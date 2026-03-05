import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Goal } from '../goals/entities/goal.entity';
import { DiaryEntry } from '../diary/entities/diary-entry.entity';
import { Application } from '../applications/entities/application.entity';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
import { AcademicMentor } from './entities/academic-mentor.entity';

@Injectable()
export class MentorsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Goal)
    private goalsRepository: Repository<Goal>,
    @InjectRepository(DiaryEntry)
    private diaryRepository: Repository<DiaryEntry>,
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(AcademicMentor)
    private academicMentorsRepository: Repository<AcademicMentor>,
  ) {}

  async getStudentOverview(
    mentorUserId: string,
    studentId: string,
  ): Promise<{ goals: Goal[]; diary: DiaryEntry[] }> {
    // Find student with academic mentor relationship
    const student = await this.studentsRepository.findOne({
      where: { id: studentId },
      relations: ['academicMentor', 'academicMentor.user'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Verify mentor-student relationship
    if (!student.academicMentor || student.academicMentor.user.id !== mentorUserId) {
      throw new ForbiddenException('You are not assigned as the academic mentor for this student');
    }

    // Fetch goals for this student
    const goals = await this.goalsRepository.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });

    // Fetch diary entries for this student
    const diary = await this.diaryRepository.find({
      where: { studentId },
      order: { date: 'DESC' },
    });

    return { goals, diary };
  }

  async getCompanyMentorStudents(mentorUserId: string): Promise<any[]> {
    // Find all students assigned to this company mentor
    const students = await this.studentsRepository.find({
      where: { companyMentorId: mentorUserId },
      relations: ['user', 'companyMentor'],
    });

    // For each student, get their approved applications with internship details
    const result = await Promise.all(
      students.map(async (student) => {
        // Find approved applications for this student
        const applications = await this.applicationsRepository.find({
          where: {
            studentId: student.id,
            status: ApplicationStatus.APPROVED,
          },
          relations: ['internship', 'internship.company'],
        });

        // Get diary entries for each application
        const applicationsWithDiary = await Promise.all(
          applications.map(async (application) => {
            const diaryEntries = await this.diaryRepository.find({
              where: {
                studentId: student.id,
                internshipId: application.internshipId,
              },
              order: { date: 'DESC' },
            });

            return {
              id: application.internship.id,
              title: application.internship.title,
              student: {
                id: student.id,
                user: {
                  firstName: student.user.firstName,
                  lastName: student.user.lastName,
                  email: student.user.email,
                },
              },
              company: {
                name: application.internship.company?.name || '',
              },
              startDate: application.internship.startDate,
              endDate: application.internship.endDate,
              status: application.internship.status,
              diaryEntries: diaryEntries.map(entry => ({
                id: entry.id,
                date: entry.date,
                description: entry.entry,
                approved: entry.approved,
                mentorComment: entry.mentorComment,
              })),
            };
          }),
        );

        return applicationsWithDiary;
      }),
    );

    // Flatten the array
    return result.flat();
  }

  async getAcademicMentorStudents(mentorUserId: string): Promise<any[]> {
    // Find the academic mentor by userId
    const academicMentor = await this.academicMentorsRepository.findOne({
      where: { userId: mentorUserId },
    });

    if (!academicMentor) {
      throw new NotFoundException('Academic mentor not found');
    }

    // Find all students assigned to this academic mentor
    const students = await this.studentsRepository.find({
      where: { academicMentorId: academicMentor.id },
      relations: ['user'],
    });

    // For each student, get their approved applications with internship details
    const result = await Promise.all(
      students.map(async (student) => {
        // Find approved applications for this student
        const applications = await this.applicationsRepository.find({
          where: {
            studentId: student.id,
            status: ApplicationStatus.APPROVED,
          },
          relations: ['internship', 'internship.company'],
        });

        // Get diary entries and goals for each application
        const applicationsWithDetails = await Promise.all(
          applications.map(async (application) => {
            const diaryEntries = await this.diaryRepository.find({
              where: {
                studentId: student.id,
                internshipId: application.internshipId,
              },
              order: { date: 'DESC' },
            });

            const goals = await this.goalsRepository.find({
              where: {
                studentId: student.id,
                internshipId: application.internshipId,
              },
            });

            const totalDiaryEntries = diaryEntries.length;
            const approvedDiaryEntries = diaryEntries.filter(e => e.approved).length;

            return {
              id: application.internship.id,
              title: application.internship.title,
              student: {
                id: student.id,
                user: {
                  firstName: student.user.firstName,
                  lastName: student.user.lastName,
                  email: student.user.email,
                },
              },
              company: {
                name: application.internship.company?.name || '',
              },
              startDate: application.internship.startDate,
              endDate: application.internship.endDate,
              status: application.internship.status,
              grade: application.internship.grade,
              gradeComment: application.internship.gradeComment,
              totalDiaryEntries,
              approvedDiaryEntries,
              goalsCount: goals.length,
            };
          }),
        );

        return applicationsWithDetails;
      }),
    );

    // Flatten the array
    return result.flat();
  }
}
