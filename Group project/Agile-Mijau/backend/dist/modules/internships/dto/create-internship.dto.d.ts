import { InternshipStatus } from '../../../common/enums/internship-status.enum';
export declare class CreateInternshipDto {
    companyId?: string;
    title: string;
    description: string;
    location: string;
    duration: number;
    requiredHours: number;
    requiredSkills: string[];
    salary?: number;
    startDate: string;
    endDate: string;
    status?: InternshipStatus;
}
