import { apiRequest } from './api';

export interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  indexNumber: string;
}

export interface InternshipWithStudent {
  id: string;
  student: StudentInfo;
  company: {
    id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  grade: number | null;
  gradedAt: string | null;
  gradeComment: string | null;
  companyEvaluation?: {
    id: string;
    isLocked: boolean;
    technicalSkills: number;
    communication: number;
    workEthic: number;
    overallPerformance: string;
    recommendations?: string;
    submittedAt: string;
    mentor: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
}

export interface GradeSubmission {
  grade: number;
  comment?: string;
}

export const mentorService = {
  async getStudentInternship(internshipId: string): Promise<InternshipWithStudent> {
    return apiRequest<InternshipWithStudent>(`/api/internships/${internshipId}`);
  },

  async submitGrade(internshipId: string, data: GradeSubmission): Promise<void> {
    return apiRequest<void>(`/api/internships/${internshipId}/grade`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
