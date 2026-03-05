import { Home, Users, Building2, Briefcase, BarChart3, FileText, LogOut, History, GraduationCap } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { RoleGate } from '@/components/auth/RoleGate';
import { cn } from '@/lib/utils';

interface NavItemProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, children }: NavItemProps) => (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
        isActive(to)
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{children}</span>
    </Link>
  );

  return (
    <div className="w-64 h-screen bg-background border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold">Agile Mijau</h2>
        <p className="text-sm text-muted-foreground mt-1">{user?.name}</p>
        <p className="text-xs text-muted-foreground">{user?.role}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <NavItem to="/" icon={Home}>
          Dashboard
        </NavItem>

        {/* Admin Only */}
        <RoleGate allowedRoles={['ADMIN']}>
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase">Admin</p>
          </div>
          <NavItem to="/admin/users" icon={Users}>
            User Management
          </NavItem>
          <NavItem to="/admin/companies" icon={Building2}>
            Company Management
          </NavItem>
          <NavItem to="/admin/internships" icon={Briefcase}>
            All Internships
          </NavItem>
          <NavItem to="/admin/statistics" icon={BarChart3}>
            Statistics
          </NavItem>
          <NavItem to="/admin/parameters" icon={FileText}>
            Parameters
          </NavItem>
          <NavItem to="/admin/internships-history" icon={History}>
            Internships History
          </NavItem>
        </RoleGate>

        {/* Student Links */}
        <RoleGate allowedRoles={['STUDENT']}>
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase">Student</p>
          </div>
          <NavItem to="/student/internships" icon={Briefcase}>
            Browse Internships
          </NavItem>
          <NavItem to="/student/applications" icon={FileText}>
            My Applications
          </NavItem>
        </RoleGate>

        {/* Employer Links */}
        <RoleGate allowedRoles={['EMPLOYER']}>
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase">Employer</p>
          </div>
          <NavItem to="/employer/internships" icon={Briefcase}>
            My Offers
          </NavItem>
          <NavItem to="/employer/applicants" icon={Users}>
            Applicants
          </NavItem>
        </RoleGate>

        {/* Company Mentor Links */}
        <RoleGate allowedRoles={['COMPANY_MENTOR']}>
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase">Mentor</p>
          </div>
          <NavItem to="/mentor/company/dashboard" icon={GraduationCap}>
            Moji studenti
          </NavItem>
        </RoleGate>

        {/* Academic Mentor Links */}
        <RoleGate allowedRoles={['ACADEMIC_MENTOR']}>
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase">Akademski mentor</p>
          </div>
          <NavItem to="/mentor/academic/dashboard" icon={GraduationCap}>
            Moji studenti
          </NavItem>
        </RoleGate>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Odjava</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;