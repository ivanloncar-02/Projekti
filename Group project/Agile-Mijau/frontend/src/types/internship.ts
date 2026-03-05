export interface InternshipParameters {
  id: string;
  duration: number; // months
  requiredHours: number;
  applicationDeadline: Date;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateParametersDto {
  duration: number;
  requiredHours: number;
  applicationDeadline: string; // ISO date
  startDate: string;
  endDate: string;
}
