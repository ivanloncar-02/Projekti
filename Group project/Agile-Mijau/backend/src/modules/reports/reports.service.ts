import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import { Internship } from '../internships/entities/internship.entity';

// Font paths for Unicode support (Croatian characters)
// Use bundled fonts for portability, fallback to system fonts
const getFontPaths = () => {
  // Try bundled fonts first (relative to src/modules/reports)
  const bundledPath = path.join(__dirname, '../../assets/fonts');
  const systemPath = '/usr/share/fonts/TTF';

  const basePath = fs.existsSync(path.join(bundledPath, 'DejaVuSans.ttf'))
    ? bundledPath
    : fs.existsSync(path.join(systemPath, 'DejaVuSans.ttf'))
    ? systemPath
    : null;

  if (!basePath) {
    return null;
  }

  return {
    regular: path.join(basePath, 'DejaVuSans.ttf'),
    bold: path.join(basePath, 'DejaVuSans-Bold.ttf'),
    italic: path.join(basePath, 'DejaVuSans-Oblique.ttf'),
  };
};
import { DiaryEntry } from '../diary/entities/diary-entry.entity';
import { Goal } from '../goals/entities/goal.entity';
import { CompanyMentorEvaluation } from '../evaluations/entities/company-mentor-evaluation.entity';
import { Application } from '../applications/entities/application.entity';
import { Student } from '../students/entities/student.entity';
import { AcademicMentor } from '../mentors/entities/academic-mentor.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { ApplicationStatus } from '../../common/enums/application-status.enum';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Internship)
    private readonly internshipRepository: Repository<Internship>,
    @InjectRepository(DiaryEntry)
    private readonly diaryRepository: Repository<DiaryEntry>,
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    @InjectRepository(CompanyMentorEvaluation)
    private readonly evaluationRepository: Repository<CompanyMentorEvaluation>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(AcademicMentor)
    private readonly academicMentorRepository: Repository<AcademicMentor>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async generateInternshipReport(
    internshipId: string,
    studentId: string,
    userId?: string,
    role?: UserRole,
  ): Promise<Buffer> {
    // For academic mentors, verify they are assigned to the student
    if (role === UserRole.ACADEMIC_MENTOR && userId) {
      await this.verifyAcademicMentorAccess(internshipId, userId);
    }

    // Get internship with relations - for academic mentors, find by internshipId only
    let application;
    if (role === UserRole.ACADEMIC_MENTOR) {
      application = await this.applicationRepository.findOne({
        where: { internshipId, status: ApplicationStatus.APPROVED },
        relations: ['internship', 'internship.company', 'student', 'student.user', 'student.academicMentor'],
      });
    } else {
      application = await this.applicationRepository.findOne({
        where: { internshipId, studentId },
        relations: ['internship', 'internship.company', 'student', 'student.user', 'student.academicMentor'],
      });
    }

    if (!application) {
      throw new NotFoundException('Prijava na praksu nije pronađena');
    }

    const internship = application.internship;
    const student = application.student;

    // Get goals
    const goals = await this.goalRepository.find({
      where: { internshipId, studentId },
      order: { createdAt: 'ASC' },
    });

    // Get diary entries
    const diaryEntries = await this.diaryRepository.find({
      where: { internshipId, studentId },
      order: { date: 'ASC' },
    });

    // Get evaluation
    const evaluation = await this.evaluationRepository.findOne({
      where: { internshipId },
    });

    // Send notification to academic mentor only when student downloads/submits their report
    // Don't send notification when academic mentor views the report
    if (role === UserRole.STUDENT && student.academicMentor?.userId) {
      const studentName = `${student.user?.firstName || ''} ${student.user?.lastName || ''}`.trim();
      const currentDate = new Date().toLocaleDateString('hr-HR');

      await this.notificationsService.create({
        userId: student.academicMentor.userId,
        type: NotificationType.FINAL_REPORT_SUBMITTED,
        title: 'Završno izvješće predano',
        message: `Student ${studentName} je predao završno izvješće za praksu "${internship.title}" dana ${currentDate}.`,
        relatedId: internshipId,
        relatedUrl: `/mentor/academic/internships/${internshipId}`,
      });
    }

    // Generate PDF
    return this.createPDF(internship, student, goals, diaryEntries, evaluation);
  }

  private createPDF(
    internship: Internship,
    student: Student,
    goals: Goal[],
    diaryEntries: DiaryEntry[],
    evaluation: CompanyMentorEvaluation | null,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Register DejaVu fonts for Croatian character support
      const fontPaths = getFontPaths();
      if (fontPaths) {
        doc.registerFont('DejaVu', fontPaths.regular);
        doc.registerFont('DejaVu-Bold', fontPaths.bold);
        doc.registerFont('DejaVu-Italic', fontPaths.italic);
      }

      // Use DejaVu if available, otherwise fallback to Helvetica
      const fontRegular = fontPaths ? 'DejaVu' : 'Helvetica';
      const fontBold = fontPaths ? 'DejaVu-Bold' : 'Helvetica-Bold';
      const fontItalic = fontPaths ? 'DejaVu-Italic' : 'Helvetica-Oblique';

      // Title
      doc.fontSize(24).font(fontBold).text('IZVJEŠĆE O STRUČNOJ PRAKSI', { align: 'center' });
      doc.moveDown(2);

      // Student info section
      doc.fontSize(14).font(fontBold).text('PODACI O STUDENTU');
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      doc.fontSize(11).font(fontRegular);
      doc.text(`Ime i prezime: ${student.user?.firstName || ''} ${student.user?.lastName || ''}`);
      doc.text(`Broj indeksa: ${student.studentNumber}`);
      doc.text(`Smjer: ${student.major}`);
      doc.text(`Email: ${student.user?.email || ''}`);
      doc.moveDown(1.5);

      // Internship info section
      doc.fontSize(14).font(fontBold).text('PODACI O PRAKSI');
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      doc.fontSize(11).font(fontRegular);
      doc.text(`Naziv pozicije: ${internship.title}`);
      doc.text(`Poduzeće: ${internship.company?.name || ''}`);
      doc.text(`Lokacija: ${internship.location}`);
      doc.text(`Trajanje: ${internship.duration} mjeseci`);
      doc.text(`Potrebni sati: ${internship.requiredHours}`);
      doc.text(`Početak: ${new Date(internship.startDate).toLocaleDateString('hr-HR')}`);
      doc.text(`Završetak: ${new Date(internship.endDate).toLocaleDateString('hr-HR')}`);
      doc.text(`Status: ${this.translateStatus(internship.status)}`);
      if (internship.grade) {
        doc.text(`Ocjena: ${internship.grade}`);
      }
      doc.moveDown(1.5);

      // Goals section
      doc.fontSize(14).font(fontBold).text('PLANIRANI CILJEVI');
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      if (goals.length === 0) {
        doc.fontSize(11).font(fontItalic).text('Nema unesenih ciljeva.');
      } else {
        goals.forEach((goal, index) => {
          doc.fontSize(11).font(fontBold).text(`${index + 1}. ${goal.title}`);
          doc.font(fontRegular).text(goal.description);
          doc.text(`Status: ${goal.completed ? 'Završeno' : 'U tijeku'}`, { continued: false });
          if (goal.dueDate) {
            doc.text(`Rok: ${new Date(goal.dueDate).toLocaleDateString('hr-HR')}`);
          }
          doc.moveDown(0.5);
        });
      }
      doc.moveDown(1);

      // Diary section
      doc.fontSize(14).font(fontBold).text('DNEVNIK AKTIVNOSTI');
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);

      if (diaryEntries.length === 0) {
        doc.fontSize(11).font(fontItalic).text('Nema unesenih aktivnosti.');
      } else {
        diaryEntries.forEach((entry) => {
          doc.fontSize(11).font(fontBold)
            .text(`${new Date(entry.date).toLocaleDateString('hr-HR')}`, { continued: true })
            .font(fontRegular)
            .text(entry.approved ? ' (Odobreno)' : ' (Čeka odobrenje)');
          doc.font(fontRegular).text(entry.entry);
          if (entry.mentorComment) {
            doc.font(fontItalic).text(`Komentar mentora: ${entry.mentorComment}`);
          }
          doc.moveDown(0.5);
        });
      }
      doc.moveDown(1);

      // Evaluation section
      if (evaluation) {
        doc.addPage();
        doc.fontSize(14).font(fontBold).text('EVALUACIJA MENTORA IZ PODUZEĆA');
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.5);

        doc.fontSize(11).font(fontRegular);
        doc.text(`Tehničke vještine: ${evaluation.technicalSkills}/5`);
        doc.text(`Komunikacija: ${evaluation.communication}/5`);
        doc.text(`Radna etika: ${evaluation.workEthic}/5`);
        if (evaluation.overallPerformance) {
          doc.moveDown(0.5);
          doc.font(fontBold).text('Ukupna izvedba:');
          doc.font(fontRegular).text(evaluation.overallPerformance);
        }
        if (evaluation.recommendations) {
          doc.moveDown(0.5);
          doc.font(fontBold).text('Preporuke:');
          doc.font(fontRegular).text(evaluation.recommendations);
        }
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(9).font(fontRegular).fillColor('gray')
        .text(`Generirano: ${new Date().toLocaleString('hr-HR')}`, { align: 'right' });

      doc.end();
    });
  }

  private async verifyAcademicMentorAccess(
    internshipId: string,
    userId: string,
  ): Promise<void> {
    // Find the academic mentor by userId
    const academicMentor = await this.academicMentorRepository.findOne({
      where: { userId },
    });

    if (!academicMentor) {
      throw new ForbiddenException('Akademski mentor nije pronađen');
    }

    // Find the approved application for this internship to get the student
    const application = await this.applicationRepository.findOne({
      where: {
        internshipId,
        status: ApplicationStatus.APPROVED,
      },
      relations: ['student'],
    });

    if (!application) {
      throw new NotFoundException('Nema odobrene prijave za ovu praksu');
    }

    // Check if the student is assigned to this academic mentor
    if (application.student.academicMentorId !== academicMentor.id) {
      throw new ForbiddenException(
        'Možete pristupiti samo izvješćima studenata koji su vam dodijeljeni',
      );
    }
  }

  private translateStatus(status: string): string {
    const translations: Record<string, string> = {
      DRAFT: 'Nacrt',
      PENDING: 'Na čekanju',
      PUBLISHED: 'Objavljeno',
      ACTIVE: 'Aktivno',
      APPROVED: 'Odobreno',
      REJECTED: 'Odbijeno',
      COMPLETED: 'Završeno',
      GRADED: 'Ocijenjeno',
      ARCHIVED: 'Arhivirano',
    };
    return translations[status] || status;
  }
}
