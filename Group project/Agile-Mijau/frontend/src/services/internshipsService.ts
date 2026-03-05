import { apiRequest } from './api';

export interface Internship {
  id: string;
  companyId: string;
  title: string;
  description: string;
  location: string;
  duration: number;
  requiredHours: number;
  requiredSkills: string[];
  salary: number | null;
  startDate: string;
  endDate: string;
  status: InternshipStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  archivedAt: string | null;
  grade: number | null;
  gradeComment: string | null;
  gradedBy: string | null;
  gradedAt: string | null;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
  };
  applications?: any[];
  applicationsCount?: number;
}

export const InternshipStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ACTIVE: 'ACTIVE',
  APPROVED: 'APPROVED',
  COMPLETED: 'COMPLETED',
  GRADED: 'GRADED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type InternshipStatus = typeof InternshipStatus[keyof typeof InternshipStatus];

export interface InternshipsFilterParams {
  page?: number;
  limit?: number;
  year?: number;
  student?: string;
  company?: string;
  status?: InternshipStatus;
  search?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedInternships {
  data: Internship[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const internshipsService = {
  async getAll(params?: InternshipsFilterParams): Promise<PaginatedInternships> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.student) queryParams.append('student', params.student);
    if (params?.company) queryParams.append('company', params.company);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.order) queryParams.append('order', params.order);

    const url = `/api/admin/internships${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<PaginatedInternships>(url);
  },

  async getById(id: string): Promise<Internship> {
    return apiRequest<Internship>(`/api/admin/internships/${id}`);
  },
};
