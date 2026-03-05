export const UserRole = {
  STUDENT: 'STUDENT',
  EMPLOYER: 'EMPLOYER',
  ADMIN: 'ADMIN',
  COMPANY_MENTOR: 'COMPANY_MENTOR',
  ACADEMIC_MENTOR: 'ACADEMIC_MENTOR',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  name?: string; // Computed full name
  phone?: string;
  companyId?: string;
}

export const NotificationType = {
  STUDENT_ASSIGNED: 'STUDENT_ASSIGNED',
  DIARY_ENTRY_SUBMITTED: 'DIARY_ENTRY_SUBMITTED',
  DIARY_ENTRY_APPROVED: 'DIARY_ENTRY_APPROVED',
  FINAL_REPORT_SUBMITTED: 'FINAL_REPORT_SUBMITTED',
  APPLICATION_STATUS: 'APPLICATION_STATUS',
  APPLICATION_RECEIVED: 'APPLICATION_RECEIVED',
  APPLICATION_APPROVED: 'APPLICATION_APPROVED',
  APPLICATION_REJECTED: 'APPLICATION_REJECTED',
  INTERNSHIP_GRADED: 'INTERNSHIP_GRADED',
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  relatedUrl?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

export interface NavItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
  roles?: UserRole[];
}

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  roles?: UserRole[];
  exact?: boolean;
}

export const CompanyStatus = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;

export type CompanyStatus = typeof CompanyStatus[keyof typeof CompanyStatus];

export interface Company {
  id: string;
  name: string;
  oib: string;
  email: string;
  address: string;
  website?: string;
  phone?: string;
  contactPerson?: string;
  status: CompanyStatus;
  createdAt: string;
  updatedAt: string;
}

export const ApplicationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

export interface Application {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  internshipId: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
}

export interface Internship {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  description: string;
  location: string;
  duration: number; // months
  requiredHours: number;
  requiredSkills: string[];
  salary?: number;
  startDate: string;
  endDate: string;
  applicationDeadline?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Croatian translations
export interface CroatianTranslations {
  navigation: {
    dashboard: string;
    internships: string;
    applications: string;
    profile: string;
    users: string;
    companies: string;
    logout: string;
    login: string;
    register: string;
  };
  student: {
    dashboard: {
      title: string;
      welcome: string;
      activeApplications: string;
      internshipsStatus: string;
    };
    internships: {
      title: string;
      searchPlaceholder: string;
      apply: string;
      viewDetails: string;
    };
    applications: {
      title: string;
      status: string;
      appliedOn: string;
      internship: string;
    };
    profile: {
      title: string;
      personalInfo: string;
      education: string;
      skills: string;
      save: string;
    };
  };
  employer: {
    dashboard: {
      title: string;
      welcome: string;
      activeInternships: string;
      totalApplications: string;
    };
    internships: {
      title: string;
      createNew: string;
      edit: string;
      delete: string;
      viewApplications: string;
    };
    applications: {
      title: string;
      applicant: string;
      appliedOn: string;
      status: string;
      review: string;
    };
    profile: {
      title: string;
      companyInfo: string;
      contactInfo: string;
      save: string;
    };
  };
  admin: {
    dashboard: {
      title: string;
      welcome: string;
      totalUsers: string;
      totalInternships: string;
      totalApplications: string;
    };
    users: {
      title: string;
      name: string;
      email: string;
      role: string;
      status: string;
      edit: string;
      deactivate: string;
    };
    internships: {
      title: string;
      company: string;
      status: string;
      applications: string;
      approve: string;
      reject: string;
    };
    companies: {
      title: string;
      name: string;
      email: string;
      internships: string;
      edit: string;
    };
  };
  common: {
    loading: string;
    error: string;
    notFound: string;
    unauthorized: string;
    back: string;
    next: string;
    previous: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    view: string;
  };
}
