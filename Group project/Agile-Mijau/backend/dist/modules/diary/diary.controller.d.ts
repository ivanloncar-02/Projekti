import { DiaryService } from './diary.service';
import { CreateDiaryEntryDto } from './dto/create-diary-entry.dto';
import { UpdateDiaryEntryDto } from './dto/update-diary-entry.dto';
import { ApproveDiaryEntryDto } from './dto/approve-diary-entry.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { UserRole } from '../../common/enums/user-role.enum';
export declare class DiaryController {
    private readonly diaryService;
    constructor(diaryService: DiaryService);
    create(studentId: string, createDiaryEntryDto: CreateDiaryEntryDto): Promise<import("./entities/diary-entry.entity").DiaryEntry>;
    findAllByStudent(studentId: string, currentStudentId: string, role: UserRole): Promise<import("./entities/diary-entry.entity").DiaryEntry[]>;
    findAllByInternship(internshipId: string, userId: string, studentId: string, role: UserRole): Promise<import("./entities/diary-entry.entity").DiaryEntry[]>;
    findOne(id: string, currentStudentId: string, role: UserRole): Promise<import("./entities/diary-entry.entity").DiaryEntry>;
    update(id: string, studentId: string, updateDiaryEntryDto: UpdateDiaryEntryDto): Promise<import("./entities/diary-entry.entity").DiaryEntry>;
    approveDiaryEntry(id: string, userId: string, approveDto: ApproveDiaryEntryDto): Promise<import("./entities/diary-entry.entity").DiaryEntry>;
    delete(id: string, studentId: string): Promise<void>;
    addComment(id: string, mentorUserId: string, addCommentDto: AddCommentDto): Promise<import("./entities/diary-entry.entity").DiaryEntry>;
}
