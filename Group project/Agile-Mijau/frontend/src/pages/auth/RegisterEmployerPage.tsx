import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { FormError } from '../../components/FormError';
import { commonValidations } from '../../lib/validation';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const employerRegisterSchema = z.object({
  companyName: z.string()
    .min(2, "Naziv poduzeća mora imati najmanje 2 znaka")
    .max(100, "Naziv poduzeća može imati maksimalno 100 znakova"),
  oib: commonValidations.oib,
  email: commonValidations.email,
  password: z.string()
    .min(8, "Lozinka mora imati najmanje 8 znakova")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Lozinka mora sadržavati barem jedno veliko slovo, jedno malo slovo i jednu znamenku"),
  confirmPassword: z.string(),
  address: z.string()
    .min(5, "Adresa mora imati najmanje 5 znakova")
    .max(200, "Adresa može imati maksimalno 200 znakova"),
  website: z.string()
    .url("Unesite ispravnu URL adresu")
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(/^(\+385|0)\d{8,9}$/, "Unesite ispravan telefonski broj (npr. +385 99 123 4567)"),
  contactPerson: z.string()
    .min(2, "Ime kontakt osobe mora imati najmanje 2 znaka")
    .max(100, "Ime kontakt osobe može imati maksimalno 100 znakova"),
  termsAccepted: z.boolean()
    .refine(val => val === true, "Morate prihvatiti uvjete korištenja"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Lozinke se ne podudaraju",
  path: ["confirmPassword"],
});

type EmployerRegisterFormData = z.infer<typeof employerRegisterSchema>;

export const RegisterEmployerPage = () => {
  const [serverError, setServerError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setFocus,
  } = useForm<EmployerRegisterFormData>({
    resolver: zodResolver(employerRegisterSchema),
    mode: 'onChange',
    defaultValues: {
      companyName: '',
      oib: '',
      email: '',
      password: '',
      confirmPassword: '',
      address: '',
      website: '',
      phone: '',
      contactPerson: '',
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: EmployerRegisterFormData) => {
    setServerError('');
    setEmailError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/employer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.companyName,
          oib: data.oib,
          email: data.email,
          password: data.password,
          address: data.address,
          website: data.website || undefined,
          phone: data.phone,
          contactPerson: data.contactPerson,
        }),
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
        toast.success('Registration successful! Welcome to Agile Mijau', {
          description: `Welcome, ${result.user.firstName || 'User'}!`,
        });

        // Show loading state during redirect
        setIsRedirecting(true);

        // Navigate to employer dashboard
        setTimeout(() => {
          navigate('/employer/dashboard', { replace: true });
        }, 500);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registracija neuspješna';
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = () => {
    if (serverError) {
      setServerError('');
    }
  };

  const handleEmailChange = () => {
    if (emailError) {
      setEmailError('');
    }
    handleInputChange();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registracija poduzeća
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
            {/* Company Name */}
            <div>
              <Label htmlFor="companyName">
                Naziv poduzeća <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyName"
                type="text"
                {...register('companyName', {
                  onChange: handleInputChange,
                })}
                placeholder="Unesite naziv poduzeća"
                className={errors.companyName ? 'border-red-500' : ''}
              />
              <FormError message={errors.companyName?.message} />
            </div>

            {/* OIB */}
            <div>
              <Label htmlFor="oib">
                OIB <span className="text-red-500">*</span>
              </Label>
              <Input
                id="oib"
                type="text"
                maxLength={11}
                {...register('oib', {
                  onChange: handleInputChange,
                })}
                placeholder="12345678901"
                className={errors.oib ? 'border-red-500' : ''}
              />
              <FormError message={errors.oib?.message} />
              <p className="text-xs text-gray-500 mt-1">
                OIB mora sadržavati točno 11 znamenki
              </p>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">
                Email adresa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  onChange: handleEmailChange,
                  setValueAs: (value) => value.trim(),
                })}
                placeholder="kontakt@tvrtka.hr"
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

            {/* Contact Person */}
            <div>
              <Label htmlFor="contactPerson">
                Kontakt osoba <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contactPerson"
                type="text"
                {...register('contactPerson', {
                  onChange: handleInputChange,
                })}
                placeholder="Ime i prezime kontakt osobe"
                className={errors.contactPerson ? 'border-red-500' : ''}
              />
              <FormError message={errors.contactPerson?.message} />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">
                Telefon <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone', {
                  onChange: handleInputChange,
                })}
                placeholder="+385 99 123 4567"
                className={errors.phone ? 'border-red-500' : ''}
              />
              <FormError message={errors.phone?.message} />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">
                Adresa <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="address"
                {...register('address', {
                  onChange: handleInputChange,
                })}
                placeholder="Unesite punu adresu poduzeća"
                className={errors.address ? 'border-red-500' : ''}
                rows={2}
              />
              <FormError message={errors.address?.message} />
            </div>

            {/* Website */}
            <div>
              <Label htmlFor="website">
                Web stranica (opcionalno)
              </Label>
              <Input
                id="website"
                type="url"
                {...register('website', {
                  onChange: handleInputChange,
                })}
                placeholder="https://www.tvrtka.hr"
                className={errors.website ? 'border-red-500' : ''}
              />
              <FormError message={errors.website?.message} />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">
                Lozinka <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                {...register('password', {
                  onChange: handleInputChange,
                })}
                placeholder="Najmanje 8 znakova"
                className={errors.password ? 'border-red-500' : ''}
              />
              <FormError message={errors.password?.message} />
              <p className="text-xs text-gray-500 mt-1">
                Lozinka mora sadržavati barem jedno veliko slovo, jedno malo slovo i jednu znamenku
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">
                Potvrdi lozinku <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', {
                  onChange: handleInputChange,
                })}
                placeholder="Ponovite lozinku"
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              <FormError message={errors.confirmPassword?.message} />
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start">
              <input
                id="termsAccepted"
                type="checkbox"
                {...register('termsAccepted')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="termsAccepted" className="ml-2 block text-sm text-gray-900">
                Prihvaćam <a href="/terms" className="text-blue-600 hover:text-blue-500">uvjete korištenja</a> i{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-500">politiku privatnosti</a>
                <span className="text-red-500"> *</span>
              </label>
            </div>
            <FormError message={errors.termsAccepted?.message} />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isRedirecting || !isValid}
            className="w-full"
          >
            {isRedirecting
              ? 'Preusmjeravanje...'
              : isSubmitting
              ? 'Registracija u tijeku...'
              : 'Registriraj poduzeće'}
          </Button>
        </form>
      </div>
    </div>
  );
};
