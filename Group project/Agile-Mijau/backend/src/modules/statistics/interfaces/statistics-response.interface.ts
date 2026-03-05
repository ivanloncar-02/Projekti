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
