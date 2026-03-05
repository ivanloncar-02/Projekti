import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Goal } from '../goals/entities/goal.entity';
import { DiaryEntry } from '../diary/entities/diary-entry.entity';
import { Application } from '../applications/entities/application.entity';
import { AcademicMentor } from './entities/academic-mentor.entity';
export declare class MentorsService {
    private studentsRepository;
    private goalsRepository;
    private diaryRepository;
    private applicationsRepository;
    private academicMentorsRepository;
    constructor(studentsRepository: Repository<Student>, goalsRepository: Repository<Goal>, diaryRepository: Repository<DiaryEntry>, applicationsRepository: Repository<Application>, academicMentorsRepository: Repository<AcademicMentor>);
    getStudentOverview(mentorUserId: string, studentId: string): Promise<{
        goals: Goal[];
        diary: DiaryEntry[];
    }>;
    getCompanyMentorStudents(mentorUserId: string): Promise<any[]>;
    getAcademicMentorStudents(mentorUserId: string): Promise<any[]>;
}
