import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { FormError } from '../../components/FormError';
import { commonValidations } from '../../lib/validation';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const registerSchema = z.object({
  firstName: z.string().min(1, "Ime je obavezno"),
  lastName: z.string().min(1, "Prezime je obavezno"),
  email: commonValidations.email,
  role: z.string().min(1, "Molimo odaberite ulogu"),
  phone: z.string()
    .refine(val => !val || /^(\+385|0)\d{8,9}$/.test(val), {
      message: "Unesite ispravan telefonski broj",
    })
    .optional()
    .or(z.literal('')),
  password: commonValidations.password,
  confirmPassword: z.string(),
  // Student-specific fields
  studentNumber: z.string().optional(),
  major: z.string().optional(),
  academicYear: z.string().optional(),
  address: z.string().optional(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Lozinke se ne podudaraju",
  path: ["confirmPassword"],
})
.refine((data) => {
  if (data.role === UserRole.STUDENT) {
    return !!data.studentNumber && data.studentNumber.trim().length > 0;
  }
  return true;
}, {
  message: "Broj indeksa je obavezan za studente",
  path: ["studentNumber"],
})
.refine((data) => {
  if (data.role === UserRole.STUDENT) {
    return !!data.major && data.major.trim().length > 0;
  }
  return true;
}, {
  message: "Smjer je obavezan za studente",
  path: ["major"],
})
.refine((data) => {
  if (data.role === UserRole.STUDENT) {
    return !!data.academicYear && data.academicYear.trim().length > 0;
  }
  return true;
}, {
  message: "Akademska godina je obavezna za studente",
  path: ["academicYear"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const [serverError, setServerError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setFocus,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      phone: '',
      password: '',
      confirmPassword: '',
      studentNumber: '',
      major: '',
      academicYear: '',
      address: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setServerError('');
    setEmailError('');
    setIsSubmitting(true);

    try {
      const payload: any = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role as UserRole,
        phone: data.phone || undefined,
      };

      // Add student-specific fields if role is STUDENT
      if (data.role === UserRole.STUDENT) {
        payload.studentNumber = data.studentNumber;
        payload.major = data.major;
        payload.academicYear = data.academicYear;
        payload.address = data.address || undefined;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 409) {
        // Handle duplicate email error
        setEmailError('This email is already registered. Try logging in instead.');
        setFocus('email');
        return;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Registracija neuspješna' }));
        throw new Error(error.message || 'Registracija neuspješna');
      }

      const result = await response.json();

      // Auto-login: Store token and user data
      if (result.access_token && result.user) {
        localStorage.setItem('token', result.access_token);
        localStorage.setItem('user', JSON.stringify(result.user));

        // Show success toast
        toast.success('Welcome! Your account has been created', {
          description: `Welcome, ${result.user.firstName}!`,
        });

        // Show loading state during redirect
        setIsRedirecting(true);

        // Navigate to student dashboard
        setTimeout(() => {
          navigate('/student/dashboard', { replace: true });
        }, 500);
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registracija neuspješna');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = () => {
    if (emailError) {
      setEmailError('');
    }
    if (serverError) {
      setServerError('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registracija
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Već imate račun?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Prijavite se
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Ime</Label>
                <Input
                  id="firstName"
                  type="text"
                  {...register('firstName')}
                  placeholder="Ime"
                />
                <FormError message={errors.firstName?.message} />
              </div>
              <div>
                <Label htmlFor="lastName">Prezime</Label>
                <Input
                  id="lastName"
                  type="text"
                  {...register('lastName')}
                  placeholder="Prezime"
                />
                <FormError message={errors.lastName?.message} />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  onChange: handleEmailChange,
                  setValueAs: (value) => value.trim(),
                })}
                placeholder="ime@primjer.com"
                className={errors.email || emailError ? 'border-red-500' : ''}
              />
              <FormError message={errors.email?.message} />
              {emailError && (
                <p className="text-sm text-red-500 mt-1">
                  {emailError}{' '}
                  <Link to="/login" className="underline font-medium hover:text-red-700">
                    Already have an account? Login here
                  </Link>
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="role">Uloga</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Odaberite ulogu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.STUDENT}>Student</SelectItem>
                      <SelectItem value={UserRole.EMPLOYER}>Poslodavac</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FormError message={errors.role?.message} />
            </div>

            {/* Student-specific fields */}
            {selectedRole === UserRole.STUDENT && (
              <>
                <div>
                  <Label htmlFor="studentNumber">Broj indeksa</Label>
                  <Input
                    id="studentNumber"
                    type="text"
                    {...register('studentNumber')}
                    placeholder="npr. 0246123456"
                    className={errors.studentNumber ? 'border-red-500' : ''}
                  />
                  <FormError message={errors.studentNumber?.message} />
                </div>

                <div>
                  <Label htmlFor="major">Smjer</Label>
                  <Input
                    id="major"
                    type="text"
                    {...register('major')}
                    placeholder="npr. Računarstvo"
                    className={errors.major ? 'border-red-500' : ''}
                  />
                  <FormError message={errors.major?.message} />
                </div>

                <div>
                  <Label htmlFor="academicYear">Akademska godina</Label>
                  <Input
                    id="academicYear"
                    type="text"
                    {...register('academicYear')}
                    placeholder="npr. 3"
                    className={errors.academicYear ? 'border-red-500' : ''}
                  />
                  <FormError message={errors.academicYear?.message} />
                </div>

                <div>
                  <Label htmlFor="address">Adresa (opcionalno)</Label>
                  <Input
                    id="address"
                    type="text"
                    {...register('address')}
                    placeholder="Ulica i broj, Grad"
                  />
                  <FormError message={errors.address?.message} />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="phone">Telefon (opcionalno)</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+385 99 123 4567"
              />
              <FormError message={errors.phone?.message} />
            </div>

            <div>
              <Label htmlFor="password">Lozinka</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="Najmanje 8 znakova"
              />
              <FormError message={errors.password?.message} />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Potvrdi lozinku</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                placeholder="Ponovite lozinku"
              />
              <FormError message={errors.confirmPassword?.message} />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || isSubmitting || isRedirecting}
            className="w-full"
          >
            {isRedirecting
              ? 'Preusmjeravanje...'
              : isSubmitting || isLoading
              ? 'Registracija u tijeku...'
              : 'Registriraj se'}
          </Button>
        </form>
      </div>
    </div>
  );
};
