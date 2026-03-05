import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    create(createApplicationDto: CreateApplicationDto, studentId: string): Promise<import("./entities/application.entity").Application>;
    getMyApplications(studentId: string, status?: ApplicationStatus): Promise<import("./entities/application.entity").Application[]>;
    checkIfApplied(internshipId: string, studentId: string): Promise<{
        hasApplied: boolean;
    }>;
    findByStudent(studentId: string, currentStudentId: string, role: UserRole, status?: ApplicationStatus): Promise<import("./entities/application.entity").Application[]>;
    findByInternship(internshipId: string, companyId: string, role: UserRole, status?: ApplicationStatus): Promise<import("./entities/application.entity").Application[]>;
    findOne(id: string, studentId: string, companyId: string, role: UserRole): Promise<import("./entities/application.entity").Application>;
    updateStatus(id: string, updateStatusDto: UpdateApplicationStatusDto, userId: string, companyId: string): Promise<import("./entities/application.entity").Application>;
    approveApplication(id: string, userId: string, companyId: string): Promise<import("./entities/application.entity").Application>;
    rejectApplication(id: string, userId: string, companyId: string): Promise<import("./entities/application.entity").Application>;
    getMyApplicationForInternship(internshipId: string, studentId: string): Promise<import("./entities/application.entity").Application | null>;
    addDocuments(internshipId: string, studentId: string, documentPaths: string[]): Promise<import("./entities/application.entity").Application>;
    removeDocument(internshipId: string, studentId: string, documentPath: string): Promise<import("./entities/application.entity").Application>;
}
