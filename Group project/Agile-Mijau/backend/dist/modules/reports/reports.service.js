"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const internship_entity_1 = require("../internships/entities/internship.entity");
const getFontPaths = () => {
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
const diary_entry_entity_1 = require("../diary/entities/diary-entry.entity");
const goal_entity_1 = require("../goals/entities/goal.entity");
const company_mentor_evaluation_entity_1 = require("../evaluations/entities/company-mentor-evaluation.entity");
const application_entity_1 = require("../applications/entities/application.entity");
const student_entity_1 = require("../students/entities/student.entity");
const academic_mentor_entity_1 = require("../mentors/entities/academic-mentor.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_entity_1 = require("../notifications/entities/notification.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const application_status_enum_1 = require("../../common/enums/application-status.enum");
let ReportsService = class ReportsService {
    internshipRepository;
    diaryRepository;
    goalRepository;
    evaluationRepository;
    applicationRepository;
    studentRepository;
    academicMentorRepository;
    notificationsService;
    constructor(internshipRepository, diaryRepository, goalRepository, evaluationRepository, applicationRepository, studentRepository, academicMentorRepository, notificationsService) {
        this.internshipRepository = internshipRepository;
        this.diaryRepository = diaryRepository;
        this.goalRepository = goalRepository;
        this.evaluationRepository = evaluationRepository;
        this.applicationRepository = applicationRepository;
        this.studentRepository = studentRepository;
        this.academicMentorRepository = academicMentorRepository;
        this.notificationsService = notificationsService;
    }
    async generateInternshipReport(internshipId, studentId, userId, role) {
        if (role === user_role_enum_1.UserRole.ACADEMIC_MENTOR && userId) {
            await this.verifyAcademicMentorAccess(internshipId, userId);
        }
        let application;
        if (role === user_role_enum_1.UserRole.ACADEMIC_MENTOR) {
            application = await this.applicationRepository.findOne({
                where: { internshipId, status: application_status_enum_1.ApplicationStatus.APPROVED },
                relations: ['internship', 'internship.company', 'student', 'student.user', 'student.academicMentor'],
            });
        }
        else {
            application = await this.applicationRepository.findOne({
                where: { internshipId, studentId },
                relations: ['internship', 'internship.company', 'student', 'student.user', 'student.academicMentor'],
            });
        }
        if (!application) {
            throw new common_1.NotFoundException('Prijava na praksu nije pronađena');
        }
        const internship = application.internship;
        const student = application.student;
        const goals = await this.goalRepository.find({
            where: { internshipId, studentId },
            order: { createdAt: 'ASC' },
        });
        const diaryEntries = await this.diaryRepository.find({
            where: { internshipId, studentId },
            order: { date: 'ASC' },
        });
        const evaluation = await this.evaluationRepository.findOne({
            where: { internshipId },
        });
        if (role === user_role_enum_1.UserRole.STUDENT && student.academicMentor?.userId) {
            const studentName = `${student.user?.firstName || ''} ${student.user?.lastName || ''}`.trim();
            const currentDate = new Date().toLocaleDateString('hr-HR');
            await this.notificationsService.create({
                userId: student.academicMentor.userId,
                type: notification_entity_1.NotificationType.FINAL_REPORT_SUBMITTED,
                title: 'Završno izvješće predano',
                message: `Student ${studentName} je predao završno izvješće za praksu "${internship.title}" dana ${currentDate}.`,
                relatedId: internshipId,
                relatedUrl: `/mentor/academic/internships/${internshipId}`,
            });
        }
        return this.createPDF(internship, student, goals, diaryEntries, evaluation);
    }
    createPDF(internship, student, goals, diaryEntries, evaluation) {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const fontPaths = getFontPaths();
            if (fontPaths) {
                doc.registerFont('DejaVu', fontPaths.regular);
                doc.registerFont('DejaVu-Bold', fontPaths.bold);
                doc.registerFont('DejaVu-Italic', fontPaths.italic);
            }
            const fontRegular = fontPaths ? 'DejaVu' : 'Helvetica';
            const fontBold = fontPaths ? 'DejaVu-Bold' : 'Helvetica-Bold';
            const fontItalic = fontPaths ? 'DejaVu-Italic' : 'Helvetica-Oblique';
            doc.fontSize(24).font(fontBold).text('IZVJEŠĆE O STRUČNOJ PRAKSI', { align: 'center' });
            doc.moveDown(2);
            doc.fontSize(14).font(fontBold).text('PODACI O STUDENTU');
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.5);
            doc.fontSize(11).font(fontRegular);
            doc.text(`Ime i prezime: ${student.user?.firstName || ''} ${student.user?.lastName || ''}`);
            doc.text(`Broj indeksa: ${student.studentNumber}`);
            doc.text(`Smjer: ${student.major}`);
            doc.text(`Email: ${student.user?.email || ''}`);
            doc.moveDown(1.5);
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
            doc.fontSize(14).font(fontBold).text('PLANIRANI CILJEVI');
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.5);
            if (goals.length === 0) {
                doc.fontSize(11).font(fontItalic).text('Nema unesenih ciljeva.');
            }
            else {
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
            doc.fontSize(14).font(fontBold).text('DNEVNIK AKTIVNOSTI');
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.5);
            if (diaryEntries.length === 0) {
                doc.fontSize(11).font(fontItalic).text('Nema unesenih aktivnosti.');
            }
            else {
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
            doc.moveDown(2);
            doc.fontSize(9).font(fontRegular).fillColor('gray')
                .text(`Generirano: ${new Date().toLocaleString('hr-HR')}`, { align: 'right' });
            doc.end();
        });
    }
    async verifyAcademicMentorAccess(internshipId, userId) {
        const academicMentor = await this.academicMentorRepository.findOne({
            where: { userId },
        });
        if (!academicMentor) {
            throw new common_1.ForbiddenException('Akademski mentor nije pronađen');
        }
        const application = await this.applicationRepository.findOne({
            where: {
                internshipId,
                status: application_status_enum_1.ApplicationStatus.APPROVED,
            },
            relations: ['student'],
        });
        if (!application) {
            throw new common_1.NotFoundException('Nema odobrene prijave za ovu praksu');
        }
        if (application.student.academicMentorId !== academicMentor.id) {
            throw new common_1.ForbiddenException('Možete pristupiti samo izvješćima studenata koji su vam dodijeljeni');
        }
    }
    translateStatus(status) {
        const translations = {
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(internship_entity_1.Internship)),
    __param(1, (0, typeorm_1.InjectRepository)(diary_entry_entity_1.DiaryEntry)),
    __param(2, (0, typeorm_1.InjectRepository)(goal_entity_1.Goal)),
    __param(3, (0, typeorm_1.InjectRepository)(company_mentor_evaluation_entity_1.CompanyMentorEvaluation)),
    __param(4, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __param(5, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(6, (0, typeorm_1.InjectRepository)(academic_mentor_entity_1.AcademicMentor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map