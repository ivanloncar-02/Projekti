import { Internship } from '../../internships/entities/internship.entity';
import { CompanyMentor } from '../../mentors/entities/company-mentor.entity';
export declare class CompanyMentorEvaluation {
    id: string;
    internshipId: string;
    internship: Internship;
    mentorId: string;
    mentor: CompanyMentor;
    rating: number;
    technicalSkills: number;
    communication: number;
    workEthic: number;
    overallPerformance: string | null;
    recommendations: string | null;
    isLocked: boolean;
    submittedAt: Date;
    updatedAt: Date;
}
