import { apiRequest } from './api';
import type { Company } from '../types';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const companyService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: 'ACTIVE' | 'ARCHIVED';
  }): Promise<PaginatedResponse<Company>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return apiRequest<PaginatedResponse<Company>>(
      `/api/admin/companies${query ? `?${query}` : ''}`
    );
  },

  async getById(id: string): Promise<Company> {
    return apiRequest<Company>(`/api/admin/companies/${id}`);
  },

  async create(data: Omit<Company, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    return apiRequest<Company>('/api/admin/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Company>): Promise<Company> {
    return apiRequest<Company>(`/api/admin/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async archive(id: string): Promise<Company> {
    return apiRequest<Company>(`/api/admin/companies/${id}/archive`, {
      method: 'PATCH',
    });
  },
};
