import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { AcademicMentor } from '../mentors/entities/academic-mentor.entity';
import { User } from '../users/entities/user.entity';
import { Application } from '../applications/entities/application.entity';
import { AssignMentorDto, MentorType } from './dto/assign-mentor.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(AcademicMentor)
    private readonly academicMentorRepository: Repository<AcademicMentor>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async assignMentor(dto: AssignMentorDto): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id: dto.studentId },
      relations: ['user', 'academicMentor', 'companyMentor'],
    });

    if (!student) {
      throw new NotFoundException('Student nije pronađen');
    }

    let mentorUserId: string | null = null;
    let mentorTypeLabel: string = '';

    if (dto.mentorType === MentorType.ACADEMIC_MENTOR) {
      // For academic mentor, we need to find the AcademicMentor entity by userId
      const academicMentor = await this.academicMentorRepository.findOne({
        where: { userId: dto.mentorId },
        relations: ['user'],
      });

      if (!academicMentor) {
        throw new NotFoundException('Akademski mentor nije pronađen');
      }

      student.academicMentorId = academicMentor.id;
      mentorUserId = academicMentor.userId;
      mentorTypeLabel = 'akademski mentor';
    } else if (dto.mentorType === MentorType.COMPANY_MENTOR) {
      // For company mentor, we assign the User directly
      const companyMentor = await this.userRepository.findOne({
        where: { id: dto.mentorId, role: UserRole.COMPANY_MENTOR },
      });

      if (!companyMentor) {
        throw new NotFoundException('Mentor iz tvrtke nije pronađen');
      }

      student.companyMentorId = companyMentor.id;
      mentorUserId = companyMentor.id;
      mentorTypeLabel = 'mentor iz tvrtke';
    } else {
      throw new BadRequestException('Nepoznata vrsta mentora');
    }

    const savedStudent = await this.studentRepository.save(student);

    // Send notification to the mentor
    if (mentorUserId) {
      const studentName = student.user
        ? `${student.user.firstName} ${student.user.lastName}`
        : 'Student';

      // Check if student has an active internship to link to
      const activeApplication = await this.applicationRepository.findOne({
        where: {
          studentId: student.id,
          status: ApplicationStatus.APPROVED,
        },
      });

      // Determine correct URL based on mentor type and if internship exists
      let relatedUrl: string;
      if (dto.mentorType === MentorType.ACADEMIC_MENTOR) {
        relatedUrl = activeApplication
          ? `/mentor/academic/internships/${activeApplication.internshipId}`
          : '/mentor/academic/dashboard';
      } else {
        relatedUrl = activeApplication
          ? `/mentor/company/internships/${activeApplication.internshipId}`
          : '/mentor/company/dashboard';
      }

      await this.notificationsService.create({
        userId: mentorUserId,
        type: NotificationType.STUDENT_ASSIGNED,
        title: 'Novi student dodijeljen',
        message: `Dodijeljen vam je student ${studentName} kao ${mentorTypeLabel}.`,
        relatedId: activeApplication?.internshipId || student.id,
        relatedUrl,
      });
    }

    return savedStudent;
  }
}
