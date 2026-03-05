import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiaryEntry } from './entities/diary-entry.entity';
import { CreateDiaryEntryDto } from './dto/create-diary-entry.dto';
import { UpdateDiaryEntryDto } from './dto/update-diary-entry.dto';
import { CompanyMentor } from '../mentors/entities/company-mentor.entity';
import { AcademicMentor } from '../mentors/entities/academic-mentor.entity';
import { Student } from '../students/entities/student.entity';
import { Application } from '../applications/entities/application.entity';
import { Internship } from '../internships/entities/internship.entity';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
import { InternshipStatus } from '../../common/enums/internship-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class DiaryService {
  constructor(
    @InjectRepository(DiaryEntry)
    private diaryRepository: Repository<DiaryEntry>,
    @InjectRepository(CompanyMentor)
    private companyMentorsRepository: Repository<CompanyMentor>,
    @InjectRepository(AcademicMentor)
    private academicMentorsRepository: Repository<AcademicMentor>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(Internship)
    private internshipsRepository: Repository<Internship>,
    private notificationsService: NotificationsService,
  ) {}

  async create(
    studentId: string,
    createDiaryEntryDto: CreateDiaryEntryDto,
  ): Promise<DiaryEntry> {
    // Check if internship is still active
    if (createDiaryEntryDto.internshipId) {
      const internship = await this.internshipsRepository.findOne({
        where: { id: createDiaryEntryDto.internshipId },
      });

      if (!internship) {
        throw new NotFoundException('Praksa nije pronađena');
      }

      if ([InternshipStatus.COMPLETED, InternshipStatus.GRADED].includes(internship.status)) {
        throw new BadRequestException('Ne možete dodavati dnevničke unose za završenu ili ocijenjenu praksu');
      }
    }

    // Validate date is not in the future
    const entryDate = new Date(createDiaryEntryDto.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (entryDate > today) {
      throw new BadRequestException('Datum dnevničkog unosa ne može biti u budućnosti');
    }

    const diaryEntry = this.diaryRepository.create({
      ...createDiaryEntryDto,
      studentId,
    });

    const savedEntry = await this.diaryRepository.save(diaryEntry);

    // Send notification to academic mentor
    this.notifyAcademicMentor(studentId, savedEntry).catch((error) => {
      console.error('Error sending diary notification:', error);
    });

    return savedEntry;
  }

  private async notifyAcademicMentor(studentId: string, diaryEntry: DiaryEntry): Promise<void> {
    const student = await this.studentsRepository.findOne({
      where: { id: studentId },
      relations: ['user', 'academicMentor'],
    });

    if (!student?.academicMentor?.userId) {
      return; // No academic mentor assigned
    }

    const studentName = student.user
      ? `${student.user.firstName} ${student.user.lastName}`
      : 'Student';

    const entryDate = new Date(diaryEntry.date).toLocaleDateString('hr-HR');

    await this.notificationsService.create({
      userId: student.academicMentor.userId,
      type: NotificationType.DIARY_ENTRY_SUBMITTED,
      title: 'Nova dnevnička aktivnost',
      message: `${studentName} je unio/la aktivnost za ${entryDate}.`,
      relatedId: diaryEntry.id,
      relatedUrl: `/mentor/academic/internships/${diaryEntry.internshipId}`,
    });
  }

  async findAllByStudent(studentId: string): Promise<DiaryEntry[]> {
    const entries = await this.diaryRepository.find({
      where: { studentId },
      relations: ['internship', 'approver'],
      order: { date: 'DESC' },
    });

    return entries || [];
  }

  async findAllByInternship(
    internshipId: string,
    userId?: string,
    role?: UserRole,
    studentId?: string,
  ): Promise<DiaryEntry[]> {
    // Authorization check for students - verify they own this internship
    if (role === UserRole.STUDENT && studentId) {
      await this.verifyStudentAccess(internshipId, studentId);
    }

    // Authorization check for academic mentors
    if (role === UserRole.ACADEMIC_MENTOR && userId) {
      await this.verifyAcademicMentorAccess(internshipId, userId);
    }

    // Authorization check for company mentors
    if (role === UserRole.COMPANY_MENTOR && userId) {
      await this.verifyCompanyMentorAccess(internshipId, userId);
    }

    const entries = await this.diaryRepository.find({
      where: { internshipId },
      relations: ['student', 'student.user', 'approver'],
      order: { date: 'DESC' },
    });

    return entries || [];
  }

  private async verifyStudentAccess(
    internshipId: string,
    studentId: string,
  ): Promise<void> {
    // Check if the student has an approved application for this internship
    const application = await this.applicationsRepository.findOne({
      where: {
        internshipId,
        studentId,
        status: ApplicationStatus.APPROVED,
      },
    });

    if (!application) {
      throw new ForbiddenException(
        'Možete pregledavati samo dnevničke unose za vlastite prakse',
      );
    }
  }

  private async verifyAcademicMentorAccess(
    internshipId: string,
    userId: string,
  ): Promise<void> {
    // Find the academic mentor by userId
    const academicMentor = await this.academicMentorsRepository.findOne({
      where: { userId },
    });

    if (!academicMentor) {
      throw new ForbiddenException('Academic mentor not found');
    }

    // Find the approved application for this internship to get the student
    const application = await this.applicationsRepository.findOne({
      where: {
        internshipId,
        status: ApplicationStatus.APPROVED,
      },
      relations: ['student'],
    });

    if (!application) {
      throw new NotFoundException('No approved application found for this internship');
    }

    // Check if the student is assigned to this academic mentor
    if (application.student.academicMentorId !== academicMentor.id) {
      throw new ForbiddenException(
        'Možete pregledavati samo dnevničke unose studenata koji su vam dodijeljeni',
      );
    }
  }

  private async verifyCompanyMentorAccess(
    internshipId: string,
    userId: string,
  ): Promise<void> {
    // Find the company mentor by userId
    const companyMentor = await this.companyMentorsRepository.findOne({
      where: { userId },
    });

    if (!companyMentor) {
      throw new ForbiddenException('Mentor iz tvrtke nije pronađen');
    }

    // Find the internship to check company ownership
    const application = await this.applicationsRepository.findOne({
      where: {
        internshipId,
        status: ApplicationStatus.APPROVED,
      },
      relations: ['internship'],
    });

    if (!application || !application.internship) {
      throw new NotFoundException('Nema odobrene prijave za ovu praksu');
    }

    // Check if the internship belongs to the mentor's company
    if (application.internship.companyId !== companyMentor.companyId) {
      throw new ForbiddenException(
        'Možete pregledavati samo dnevničke unose za prakse vaše tvrtke',
      );
    }
  }

  async findOne(id: string): Promise<DiaryEntry> {
    const entry = await this.diaryRepository.findOne({
      where: { id },
      relations: ['student', 'student.user', 'internship', 'approver'],
    });

    if (!entry) {
      throw new NotFoundException('Diary entry not found');
    }

    return entry;
  }

  async update(
    id: string,
    studentId: string,
    updateDiaryEntryDto: UpdateDiaryEntryDto,
  ): Promise<DiaryEntry> {
    const entry = await this.findOne(id);

    // Verify ownership
    if (entry.studentId !== studentId) {
      throw new ForbiddenException('You can only edit your own diary entries');
    }

    // Prevent editing approved entries
    if (entry.approved) {
      throw new BadRequestException('Cannot edit approved diary entries');
    }

    // Validate date if being updated
    if (updateDiaryEntryDto.date) {
      const entryDate = new Date(updateDiaryEntryDto.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (entryDate > today) {
        throw new BadRequestException(
          'Diary entry date cannot be in the future',
        );
      }
    }

    Object.assign(entry, updateDiaryEntryDto);
    return await this.diaryRepository.save(entry);
  }

  async approveDiaryEntry(
    id: string,
    userId: string,
    comment?: string,
  ): Promise<DiaryEntry> {
    const entry = await this.diaryRepository.findOne({
      where: { id },
      relations: ['student', 'student.user', 'internship', 'approver'],
    });

    if (!entry) {
      throw new NotFoundException('Diary entry not found');
    }

    if (entry.approved) {
      throw new BadRequestException('Diary entry is already approved');
    }

    const companyMentor = await this.companyMentorsRepository.findOne({
      where: { userId },
    });

    if (!companyMentor) {
      throw new ForbiddenException('Only company mentors can approve diary entries');
    }

    if (companyMentor.companyId !== entry.internship.companyId) {
      throw new ForbiddenException(
        'You can only approve diary entries for your company\'s internships',
      );
    }

    entry.approved = true;
    entry.approvedAt = new Date();
    entry.approvedBy = companyMentor.id;
    // Always update comment - if empty/undefined, clear it; if provided, set it
    entry.mentorComment = comment || null;

    return await this.diaryRepository.save(entry);
  }

  async delete(id: string, studentId: string): Promise<void> {
    const entry = await this.findOne(id);

    // Verify ownership
    if (entry.studentId !== studentId) {
      throw new ForbiddenException('You can only delete your own diary entries');
    }

    // Prevent deleting approved entries
    if (entry.approved) {
      throw new BadRequestException('Cannot delete approved diary entries');
    }

    await this.diaryRepository.remove(entry);
  }

  async addComment(
    id: string,
    mentorUserId: string,
    comment: string,
  ): Promise<DiaryEntry> {
    const entry = await this.diaryRepository.findOne({
      where: { id },
      relations: ['student', 'internship'],
    });

    if (!entry) {
      throw new NotFoundException('Diary entry not found');
    }

    // Verify current user is company mentor
    const companyMentor = await this.companyMentorsRepository.findOne({
      where: { userId: mentorUserId },
      relations: ['company'],
    });

    if (!companyMentor) {
      throw new ForbiddenException('Only company mentors can comment on diary entries');
    }

    // Verify mentor is from the same company as the internship
    if (companyMentor.companyId !== entry.internship.companyId) {
      throw new ForbiddenException(
        'You can only comment on diary entries for your company\'s internships',
      );
    }

    // Add/overwrite comment
    entry.mentorComment = comment;

    return await this.diaryRepository.save(entry);
  }
}
