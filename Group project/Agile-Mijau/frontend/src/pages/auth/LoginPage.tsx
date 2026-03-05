import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { croatianTranslations } from '../../translations/croatian';
import { FormError } from '../../components/FormError';
import { commonValidations } from '../../lib/validation';
import { UserRole } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Helper to check if a path is valid for a given user role
const isPathValidForRole = (path: string, role: UserRole): boolean => {
  const rolePathPrefixes: Record<UserRole, string[]> = {
    [UserRole.STUDENT]: ['/student/', '/dashboard'],
    [UserRole.EMPLOYER]: ['/employer/', '/dashboard'],
    [UserRole.ADMIN]: ['/admin/', '/dashboard'],
    [UserRole.COMPANY_MENTOR]: ['/mentor/company/', '/dashboard'],
    [UserRole.ACADEMIC_MENTOR]: ['/mentor/academic/', '/dashboard'],
  };

  const allowedPrefixes = rolePathPrefixes[role] || [];
  return allowedPrefixes.some(prefix => path.startsWith(prefix) || path === prefix);
};

// Get the appropriate dashboard for a user role
const getDashboardForRole = (role: UserRole): string => {
  switch (role) {
    case UserRole.STUDENT:
      return '/student/dashboard';
    case UserRole.EMPLOYER:
      return '/employer/dashboard';
    case UserRole.ADMIN:
      return '/admin/dashboard';
    case UserRole.COMPANY_MENTOR:
      return '/mentor/company/dashboard';
    case UserRole.ACADEMIC_MENTOR:
      return '/mentor/academic/dashboard';
    default:
      return '/dashboard';
  }
};

const loginSchema = z.object({
  email: commonValidations.email,
  password: z.string().min(1, "Lozinka je obavezna"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const [serverError, setServerError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const savedPath = location.state?.from?.pathname;

  const onSubmit = async (data: LoginFormData) => {
    setServerError('');

    try {
      await login(data.email, data.password);

      // Get the user from localStorage since login has just completed
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      // Determine the redirect path
      let redirectPath = '/dashboard';
      if (user && savedPath) {
        // Only redirect to saved path if it's valid for the user's role
        redirectPath = isPathValidForRole(savedPath, user.role)
          ? savedPath
          : getDashboardForRole(user.role);
      } else if (user) {
        redirectPath = getDashboardForRole(user.role);
      }

      navigate(redirectPath, { replace: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Prijava neuspješna');
    }
  };

  const handleInputChange = () => {
    if (serverError) {
      setServerError('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {croatianTranslations.navigation.login}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Nemate račun?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Registrirajte se
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email adresa</Label>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  onChange: handleInputChange,
                })}
                placeholder="ime@primjer.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              <FormError message={errors.email?.message} />
            </div>

            <div>
              <Label htmlFor="password">Lozinka</Label>
              <Input
                id="password"
                type="password"
                {...register('password', {
                  onChange: handleInputChange,
                })}
                placeholder="Unesite lozinku"
                className={errors.password ? 'border-red-500' : ''}
              />
              <FormError message={errors.password?.message} />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !isValid}
            className="w-full"
          >
            {isLoading ? 'Učitavanje...' : croatianTranslations.navigation.login}
          </Button>
        </form>
      </div>
    </div>
  );
};
