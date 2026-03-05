import { apiRequest } from './api';
import type { InternshipParameters, CreateParametersDto } from '../types/internship';

export interface ApprovalLockStatus {
  isLocked: boolean;
  reason: string | null;
}

export interface ToggleApprovalLockDto {
  isLocked: boolean;
  reason?: string;
}

export const parametersService = {
  async getActive(): Promise<InternshipParameters> {
    return apiRequest<InternshipParameters>('/api/admin/internship-parameters/active');
  },

  async create(data: CreateParametersDto): Promise<InternshipParameters> {
    return apiRequest<InternshipParameters>('/api/admin/internship-parameters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAll(): Promise<InternshipParameters[]> {
    return apiRequest<InternshipParameters[]>('/api/admin/internship-parameters');
  },

  async getApprovalLockStatus(): Promise<ApprovalLockStatus> {
    return apiRequest<ApprovalLockStatus>('/api/admin/internship-parameters/approval-lock');
  },

  async toggleApprovalLock(data: ToggleApprovalLockDto): Promise<InternshipParameters> {
    return apiRequest<InternshipParameters>('/api/admin/internship-parameters/approval-lock', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
