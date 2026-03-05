export const mockInternshipParameters = {
  id: '1',
  duration: 3,
  requiredHours: 160,
  applicationDeadline: '2024-06-30',
  startDate: '2024-07-01',
  endDate: '2024-09-30',
  createdAt: '2024-01-15',
  updatedAt: '2024-01-15'
};

export const mockStatistics = {
  totalApplications: 127,
  approvedInternships: 45,
  averageGrade: 4.2,
  completedInternships: 38
};

export const mockInternships = [
  {
    id: '1',
    companyName: 'Tech Solutions d.o.o.',
    title: 'Praktikant za frontend razvoj',
    createdDate: '2024-02-15',
    status: 'ACTIVE',
    applicationsCount: 12
  },
  {
    id: '2',
    companyName: 'Digitalna Agencija d.o.o.',
    title: 'Praktikant za backend razvoj',
    createdDate: '2024-01-20',
    status: 'ACTIVE',
    applicationsCount: 8
  },
  {
    id: '3',
    companyName: 'StartUp d.o.o.',
    title: 'Praktikant za full stack razvoj',
    createdDate: '2023-12-10',
    status: 'ARCHIVED',
    applicationsCount: 15
  },
  {
    id: '4',
    companyName: 'Mobilne Aplikacije d.o.o.',
    title: 'Praktikant za mobilni razvoj',
    createdDate: '2024-03-01',
    status: 'DRAFT',
    applicationsCount: 0
  },
  {
    id: '5',
    companyName: 'Analitika Podataka d.o.o.',
    title: 'Praktikant za znanost o podacima',
    createdDate: '2024-02-28',
    status: 'ACTIVE',
    applicationsCount: 20
  }
];