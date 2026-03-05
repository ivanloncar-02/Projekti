import { User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RoleGate } from '@/components/auth/RoleGate';
import { NotificationBell } from '@/components/notifications/NotificationBell';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications - samo za mentore i studente */}
        <RoleGate allowedRoles={['ACADEMIC_MENTOR', 'COMPANY_MENTOR', 'STUDENT']}>
          <NotificationBell />
        </RoleGate>

        {/* User Menu */}
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
          <User className="w-5 h-5" />
          <span className="text-sm font-medium">
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;