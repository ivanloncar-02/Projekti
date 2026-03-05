import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole } from './types';
import { Toaster } from '@/components/ui/sonner';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { RegisterEmployerPage } from './pages/auth/RegisterEmployerPage';
import { DashboardRedirect } from './pages/DashboardRedirect';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotificationsPage } from './pages/NotificationsPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentInternships } from './pages/student/StudentInternships';
import { InternshipDetailPage as StudentInternshipDetailPage } from './pages/student/InternshipDetailPage';
import { ApplyInternshipPage } from './pages/student/ApplyInternshipPage';
import { StudentProfile } from './pages/student/StudentProfile';
import MyApplicationsPage from './pages/student/MyApplicationsPage';
import { MyInternshipPage } from './pages/student/MyInternshipPage';

// Employer Pages
import { EmployerDashboard } from './pages/employer/EmployerDashboard';
import { EmployerProfile } from './pages/employer/EmployerProfile';
import CreateInternshipPage from './pages/employer/CreateInternshipPage';
import EditInternshipPage from './pages/employer/EditInternshipPage';
import { InternshipApplicantsPage } from './pages/employer/InternshipApplicantsPage';
import { EmployerInternshipsPage } from './pages/employer/EmployerInternshipsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import CompanyDetailPage from './pages/admin/CompanyDetailPage';
import AddCompanyPage from './pages/admin/AddCompanyPage';
import EditCompanyPage from './pages/admin/EditCompanyPage';
import CompaniesPage from './pages/admin/CompaniesPage';
import UsersPage from './pages/admin/UsersPage';
import { InternshipsPage } from './pages/admin/InternshipsPage';
import { InternshipDetailPage as AdminInternshipDetailPage } from './pages/admin/InternshipDetailPage';
import InternshipsHistoryPage from './pages/admin/InternshipsHistoryPage';
import InternshipParametersPage from './pages/admin/InternshipParametersPage';
import StatisticsPage from './pages/admin/StatisticsPage';
import AssignMentorPage from './pages/admin/AssignMentorPage';
import StudentDetailPage from './pages/admin/StudentDetailPage';

// Mentor Pages
import { AcademicMentorDashboard } from './pages/mentor/AcademicMentorDashboard';
import { CompanyMentorDashboard } from './pages/mentor/CompanyMentorDashboard';
import { InternshipDiariesPage } from './pages/mentor/InternshipDiariesPage';
import { InternshipGradingPage } from './pages/mentor/InternshipGradingPage';
import GradeStudentPage from './pages/mentor/GradeStudentPage';
import { StudentEvaluationPage } from './pages/mentor/StudentEvaluationPage';

// Test Page (remove in production)
import { ComponentTest } from './pages/ComponentTest';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/employer" element={<RegisterEmployerPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Dashboard Redirect */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Notifications - accessible by all authenticated users */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute allowedRoles={[UserRole.STUDENT, UserRole.EMPLOYER, UserRole.ADMIN, UserRole.ACADEMIC_MENTOR, UserRole.COMPANY_MENTOR]}>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute requiredRole={UserRole.STUDENT}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/internships"
              element={
                <ProtectedRoute requiredRole={UserRole.STUDENT}>
                  <StudentInternships />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/internships/:id"
              element={
                <ProtectedRoute requiredRole={UserRole.STUDENT}>
                  <StudentInternshipDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/internships/:id/apply"
              element={
                <ProtectedRoute requiredRole={UserRole.STUDENT}>
                  <ApplyInternshipPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute requiredRole={UserRole.STUDENT}>
                  <StudentProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/applications"
              element={
                <ProtectedRoute requiredRole={UserRole.STUDENT}>
                  <MyApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/my-internship/:internshipId"
              element={
                <ProtectedRoute requiredRole={UserRole.STUDENT}>
                  <MyInternshipPage />
                </ProtectedRoute>
              }
            />

            {/* Employer Routes */}
            <Route
              path="/employer/dashboard"
              element={
                <ProtectedRoute requiredRole={UserRole.EMPLOYER}>
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/profile"
              element={
                <ProtectedRoute requiredRole={UserRole.EMPLOYER}>
                  <EmployerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/internships"
              element={
                <ProtectedRoute requiredRole={UserRole.EMPLOYER}>
                  <EmployerInternshipsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/internships/new"
              element={
                <ProtectedRoute requiredRole={UserRole.EMPLOYER}>
                  <CreateInternshipPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/internships/:id/edit"
              element={
                <ProtectedRoute requiredRole={UserRole.EMPLOYER}>
                  <EditInternshipPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/internships/:id/applicants"
              element={
                <ProtectedRoute requiredRole={UserRole.EMPLOYER}>
                  <InternshipApplicantsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students/:id"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <StudentDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/companies"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <CompaniesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/internships"
              element={
                <ProtectedRoute requiredRole={UserRole.ADMIN}>
                  <InternshipsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/statistics"
              element={
                <ProtectedRoute requiredRole={UserRole.ADMIN}>
                  <StatisticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/parameters"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <InternshipParametersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/internships/history"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <InternshipsHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/companies/:id"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <CompanyDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/companies/:id/edit"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <EditCompanyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/companies/new"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <AddCompanyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/internships/:id"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <AdminInternshipDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students/:id/assign-mentor"
              element={
                <ProtectedRoute requiredRole={UserRole.ADMIN}>
                  <AssignMentorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/assign-mentor"
              element={
                <ProtectedRoute requiredRole={UserRole.ADMIN}>
                  <AssignMentorPage />
                </ProtectedRoute>
              }
            />

            {/* Mentor Routes - Academic Mentor */}
            <Route
              path="/mentor/academic/dashboard"
              element={
                <ProtectedRoute requiredRole={UserRole.ACADEMIC_MENTOR}>
                  <AcademicMentorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/academic/students/:id"
              element={
                <ProtectedRoute requiredRole={UserRole.ACADEMIC_MENTOR}>
                  <InternshipGradingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/academic/students/:id/report"
              element={
                <ProtectedRoute requiredRole={UserRole.ACADEMIC_MENTOR}>
                  <InternshipGradingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/academic/internships/:id"
              element={
                <ProtectedRoute requiredRole={UserRole.ACADEMIC_MENTOR}>
                  <InternshipGradingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/academic/students/:id/grade"
              element={
                <ProtectedRoute requiredRole={UserRole.ACADEMIC_MENTOR}>
                  <GradeStudentPage />
                </ProtectedRoute>
              }
            />

            {/* Mentor Routes - Company Mentor */}
            <Route
              path="/mentor/company/dashboard"
              element={
                <ProtectedRoute requiredRole={UserRole.COMPANY_MENTOR}>
                  <CompanyMentorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/company/internships/:id"
              element={
                <ProtectedRoute requiredRole={UserRole.COMPANY_MENTOR}>
                  <InternshipDiariesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/company/internships/:id/evaluate"
              element={
                <ProtectedRoute requiredRole={UserRole.COMPANY_MENTOR}>
                  <StudentEvaluationPage />
                </ProtectedRoute>
              }
            />

            {/* Test Route - Remove in Production */}
            <Route path="/test-components" element={<ComponentTest />} />

            {/* Default Route */}
            <Route path="/" element={<DashboardRedirect />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
