import { apiRequest } from './api';

export interface StatisticsResponse {
  totalApplications: number;
  approvedInternships: number;
  averageGrade: number;
  completedInternships: number;
  pendingApplications: number;
  activeOffers: number;
  filters: {
    year?: string;
    company?: string;
    startDate?: string;
    endDate?: string;
  };
}

export const statisticsService = {
  async getStatistics(year?: string): Promise<StatisticsResponse> {
    const params = new URLSearchParams();
    if (year) params.set('year', year);

    const queryString = params.toString();
    const endpoint = `/api/statistics${queryString ? `?${queryString}` : ''}`;

    return apiRequest<StatisticsResponse>(endpoint);
  },
};
