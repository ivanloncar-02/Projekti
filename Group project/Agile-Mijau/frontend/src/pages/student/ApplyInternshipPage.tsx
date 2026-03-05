import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { FormError } from '../../components/FormError';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const applicationSchema = z.object({
  phone: z.string()
    .regex(/^(\+385|0)\d{8,9}$/, "Unesite ispravan telefonski broj (npr. +385 99 123 4567)"),
  coverLetter: z.string()
    .max(2000, "Motivacijsko pismo može imati maksimalno 2000 znakova")
    .optional(),
  consent: z.boolean()
    .refine(val => val === true, "Morate prihvatiti obradu osobnih podataka"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface Internship {
  id: string;
  title: string;
  company: {
    id: string;
    name: string;
  };
}

export const ApplyInternshipPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [internship, setInternship] = useState<Internship | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // File states
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [cvError, setCvError] = useState('');
  const [filesError, setFilesError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    mode: 'onChange',
    defaultValues: {
      phone: user?.phone || '',
      coverLetter: '',
      consent: false,
    },
  });

  const coverLetterValue = watch('coverLetter') || '';

  useEffect(() => {
    if (id) {
      fetchInternship();
    }
  }, [id]);

  const fetchInternship = async () => {
    if (!id) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await apiRequest<Internship>(`/api/internships/${id}`, {
        method: 'GET',
      });
      setInternship(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju prakse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCvError('');

    if (!file) return;

    // Validate file type
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setCvError('Dozvoljen je samo PDF ili Word dokument');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setCvError('Datoteka ne smije biti veća od 5MB');
      return;
    }

    setCvFile(file);
  };

  const handleAdditionalFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFilesError('');

    // Validate number of files
    if (additionalFiles.length + files.length > 5) {
      setFilesError('Možete dodati maksimalno 5 dodatnih dokumenata');
      return;
    }

    // Validate each file
    for (const file of files) {
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        setFilesError('Dozvoljeni su samo PDF ili Word dokumenti');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setFilesError(`Datoteka ${file.name} je prevelika (max 5MB)`);
        return;
      }
    }

    setAdditionalFiles([...additionalFiles, ...files]);
  };

  const removeAdditionalFile = (index: number) => {
    setAdditionalFiles(additionalFiles.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ApplicationFormData) => {
    // Validate CV upload
    if (!cvFile) {
      setCvError('CV je obavezan');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('phone', data.phone);
      if (data.coverLetter) {
        formData.append('coverLetter', data.coverLetter);
      }
      formData.append('cv', cvFile);

      // Add additional files
      additionalFiles.forEach((file) => {
        formData.append('additionalDocuments', file);
      });

      await apiRequest(`/api/internships/${id}/apply`, {
        method: 'POST',
        body: formData,
      });

      toast.success('Prijava poslana!', {
        description: 'Vaša prijava je uspješno poslana. Poslodavac će vas kontaktirati.',
      });

      // Redirect to student applications page
      navigate('/student/applications', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri slanju prijave';
      toast.error('Greška', {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Učitavanje...</div>
        </div>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Praksa nije pronađena'}</AlertDescription>
        </Alert>
        <Button
          variant="ghost"
          onClick={() => navigate('/student/internships')}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Natrag na listu
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Button
            variant="ghost"
            onClick={() => navigate(`/student/internships/${id}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Natrag
          </Button>

          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Prijavi se na praksu</h1>
            <p className="text-gray-600">{internship.title}</p>
            <p className="text-sm text-gray-500">{internship.company.name}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white rounded-lg border p-6 space-y-6">
              <h2 className="text-xl font-semibold">Osobni podaci</h2>

              {/* Pre-filled fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ime</Label>
                  <Input value={user?.firstName || ''} disabled />
                </div>
                <div>
                  <Label>Prezime</Label>
                  <Input value={user?.lastName || ''} disabled />
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled />
              </div>

              <div>
                <Label htmlFor="phone">
                  Telefon <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  placeholder="+385 99 123 4567"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                <FormError message={errors.phone?.message} />
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6 space-y-6">
              <h2 className="text-xl font-semibold">Dokumenti</h2>

              {/* CV Upload */}
              <div>
                <Label htmlFor="cv">
                  CV <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2">
                  {!cvFile ? (
                    <label
                      htmlFor="cv"
                      className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Kliknite za odabir CV-a (PDF, DOC, DOCX)
                        </span>
                        <span className="text-xs text-gray-400">Max 5MB</span>
                      </div>
                      <input
                        id="cv"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleCvFileChange}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="font-medium text-sm">{cvFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(cvFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCvFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {cvError && <p className="text-sm text-red-500 mt-1">{cvError}</p>}
              </div>

              {/* Additional Documents */}
              <div>
                <Label htmlFor="additionalDocs">
                  Dodatni dokumenti (opcionalno)
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  Možete dodati do 5 dodatnih dokumenata (certifikati, preporuke, portfelj)
                </p>

                {additionalFiles.length < 5 && (
                  <label
                    htmlFor="additionalDocs"
                    className="flex items-center justify-center w-full h-24 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400 mt-2"
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-sm text-gray-600">Dodaj dokumente</span>
                    </div>
                    <input
                      id="additionalDocs"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      multiple
                      onChange={handleAdditionalFilesChange}
                    />
                  </label>
                )}

                {additionalFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {additionalFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-6 w-6 text-gray-600" />
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAdditionalFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {filesError && <p className="text-sm text-red-500 mt-1">{filesError}</p>}
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6 space-y-6">
              <h2 className="text-xl font-semibold">Motivacijsko pismo</h2>

              <div>
                <Label htmlFor="coverLetter">
                  Motivacijsko pismo (opcionalno)
                </Label>
                <Textarea
                  id="coverLetter"
                  {...register('coverLetter')}
                  placeholder="Opišite zašto ste zainteresirani za ovu praksu i što možete ponuditi poduzeću..."
                  className={`min-h-[200px] ${errors.coverLetter ? 'border-red-500' : ''}`}
                  maxLength={2000}
                />
                <div className="flex justify-between items-center mt-1">
                  <FormError message={errors.coverLetter?.message} />
                  <span className="text-xs text-gray-400">
                    {coverLetterValue.length}/2000 znakova
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-start">
                <input
                  id="consent"
                  type="checkbox"
                  {...register('consent')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="consent" className="ml-2 block text-sm text-gray-900">
                  Prihvaćam obradu osobnih podataka u svrhu procesa prijave na praksu i
                  suglasan/na sam s{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
                    politikom privatnosti
                  </a>
                  <span className="text-red-500"> *</span>
                </label>
              </div>
              <FormError message={errors.consent?.message} />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/student/internships/${id}`)}
                className="flex-1"
              >
                Odustani
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Slanje...' : 'Pošalji prijavu'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
