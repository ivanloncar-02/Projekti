let counter = 0;

function uniqueId(): number {
  return ++counter;
}

export function resetFactoryCounter(): void {
  counter = 0;
}

/**
 * Factory for creating student registration data
 */
export function createStudentData(overrides: Partial<StudentData> = {}): StudentData {
  const id = uniqueId();
  return {
    email: `student${id}@test.com`,
    password: 'Test1234',
    firstName: `Student${id}`,
    lastName: `Test`,
    role: 'STUDENT',
    studentNumber: `${1000000000 + id}`,
    major: 'Computer Science',
    academicYear: '2024/2025',
    ...overrides,
  };
}

export interface StudentData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  studentNumber: string;
  major: string;
  academicYear: string;
  phone?: string;
  address?: string;
}

/**
 * Factory for creating employer registration data
 */
export function createEmployerData(overrides: Partial<EmployerData> = {}): EmployerData {
  const id = uniqueId();
  return {
    email: `employer${id}@company.com`,
    password: 'Test1234',
    name: `Test Company ${id}`,
    oib: `${10000000000 + id}`.slice(0, 11),
    address: `Test Street ${id}`,
    contactPerson: `Contact Person ${id}`,
    phone: `09${10000000 + id}`,
    ...overrides,
  };
}

export interface EmployerData {
  email: string;
  password: string;
  name: string;
  oib: string;
  address: string;
  contactPerson: string;
  phone?: string;
  website?: string;
}

/**
 * Factory for creating internship data
 */
export function createInternshipData(
  companyId: string,
  overrides: Partial<InternshipData> = {},
): InternshipData {
  const id = uniqueId();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() + 1);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 3);

  return {
    companyId,
    title: `Internship Position ${id}`,
    description: `This is a comprehensive test internship description for position ${id}. It involves various tasks and learning opportunities including software development, testing, and documentation. The intern will work closely with experienced developers.`,
    location: `City ${id}`,
    duration: 3,
    requiredHours: 160,
    requiredSkills: ['JavaScript', 'TypeScript', 'NestJS'],
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    salary: 500,
    ...overrides,
  };
}

export interface InternshipData {
  companyId: string;
  title: string;
  description: string;
  location: string;
  duration: number;
  requiredHours: number;
  requiredSkills: string[];
  startDate: string;
  endDate: string;
  salary?: number;
  status?: string;
}

/**
 * Factory for creating application data
 */
export function createApplicationData(
  internshipId: string,
  overrides: Partial<ApplicationData> = {},
): ApplicationData {
  return {
    internshipId,
    coverLetter: 'I am very interested in this internship opportunity and believe my skills would be a great fit.',
    ...overrides,
  };
}

export interface ApplicationData {
  internshipId: string;
  coverLetter?: string;
  cvPath?: string;
}

/**
 * Factory for creating diary entry data
 */
export function createDiaryEntryData(
  internshipId: string,
  overrides: Partial<DiaryEntryData> = {},
): DiaryEntryData {
  const id = uniqueId();
  return {
    internshipId,
    date: new Date().toISOString().split('T')[0],
    hoursWorked: 8,
    activitiesPerformed: `Today I worked on task ${id}. I learned about testing and development practices.`,
    skillsLearned: `Testing, Documentation, Code Review`,
    challenges: `Faced some challenges with understanding the codebase.`,
    notes: `Additional notes for entry ${id}`,
    ...overrides,
  };
}

export interface DiaryEntryData {
  internshipId: string;
  date: string;
  hoursWorked: number;
  activitiesPerformed: string;
  skillsLearned?: string;
  challenges?: string;
  notes?: string;
}

/**
 * Factory for creating goal data
 */
export function createGoalData(
  internshipId: string,
  overrides: Partial<GoalData> = {},
): GoalData {
  const id = uniqueId();
  return {
    internshipId,
    title: `Goal ${id}`,
    description: `Description for goal ${id}. This goal aims to improve specific skills.`,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ...overrides,
  };
}

export interface GoalData {
  internshipId: string;
  title: string;
  description?: string;
  dueDate?: string;
}

/**
 * Factory for creating evaluation data
 */
export function createEvaluationData(
  internshipId: string,
  overrides: Partial<EvaluationData> = {},
): EvaluationData {
  return {
    internshipId,
    technicalSkills: 4,
    communication: 5,
    teamwork: 4,
    initiative: 5,
    punctuality: 5,
    overallRating: 5,
    comments: 'Excellent performance throughout the internship.',
    recommendation: 'Highly recommended for future opportunities.',
    ...overrides,
  };
}

export interface EvaluationData {
  internshipId: string;
  technicalSkills: number;
  communication: number;
  teamwork: number;
  initiative: number;
  punctuality: number;
  overallRating: number;
  comments?: string;
  recommendation?: string;
}

/**
 * Factory for creating admin data
 */
export function createAdminData(overrides: Partial<AdminData> = {}): AdminData {
  const id = uniqueId();
  return {
    email: `admin${id}@university.edu`,
    password: 'Test1234',
    firstName: `Admin${id}`,
    lastName: 'User',
    role: 'ADMIN',
    ...overrides,
  };
}

export interface AdminData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}
