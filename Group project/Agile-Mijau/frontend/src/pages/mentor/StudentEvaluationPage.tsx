import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRating } from '@/components/ui/star-rating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ArrowLeft, Lock, CheckCircle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { FormError } from '../../components/FormError';

const evaluationSchema = z.object({
  rating: z.number().min(1, 'Ocjena je obavezna').max(5),
  technicalSkills: z.number().min(1, 'Tehnička znanja su obavezna').max(5),
  communication: z.number().min(1, 'Komunikacija je obavezna').max(5),
  workEthic: z.number().min(1, 'Radna etika je obavezna').max(5),
  overallPerformance: z
    .string()
    .max(1000, 'Ukupna izvedba može sadržavati maksimalno 1000 znakova')
    .optional(),
  recommendations: z
    .string()
    .max(1000, 'Preporuke mogu sadržavati maksimalno 1000 znakova')
    .optional(),
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

interface Application {
  id: string;
  status: string;
  student: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface InternshipResponse {
  id: string;
  title: string;
  applications: Application[];
  company: {
    name: string;
  };
  startDate: string;
  endDate: string;
  status: string;
}

interface Internship {
  id: string;
  title: string;
  student: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  company: {
    name: string;
  };
  startDate: string;
  endDate: string;
  status: string;
}

interface ExistingEvaluation extends EvaluationFormData {
  submittedAt: string;
  mentorName: string;
}

export const StudentEvaluationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [internship, setInternship] = useState<Internship | null>(null);
  const [existingEvaluation, setExistingEvaluation] = useState<ExistingEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    mode: 'onChange',
    defaultValues: {
      rating: 0,
      technicalSkills: 0,
      communication: 0,
      workEthic: 0,
      overallPerformance: '',
      recommendations: '',
    },
  });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    if (!id) return;

    setIsLoading(true);
    setError('');

    try {
      // Fetch internship details
      const response = await apiRequest<InternshipResponse>(`/api/internships/${id}`, {
        method: 'GET',
      });

      // Extract student from approved application
      const approvedApplication = response.applications?.find(
        (app) => app.status === 'APPROVED'
      );

      if (!approvedApplication?.student) {
        setError('Nije pronađen student s odobrenom prijavom');
        setIsLoading(false);
        return;
      }

      // Transform response to expected Internship interface
      const internshipData: Internship = {
        id: response.id,
        title: response.title,
        student: approvedApplication.student,
        company: response.company,
        startDate: response.startDate,
        endDate: response.endDate,
        status: response.status,
      };

      setInternship(internshipData);

      // Check if evaluation already exists
      try {
        const evaluationResponse = await apiRequest<ExistingEvaluation>(
          `/api/internships/${id}/company-evaluation`,
          {
            method: 'GET',
          }
        );
        setExistingEvaluation(evaluationResponse);
        reset(evaluationResponse);
      } catch (err) {
        // Evaluation doesn't exist yet, that's fine
        setExistingEvaluation(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju podataka');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: EvaluationFormData) => {
    if (!id) return;

    setIsSubmitting(true);

    try {
      await apiRequest(`/api/internships/${id}/company-evaluation`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      toast.success('Evaluacija poslana', {
        description: 'Evaluacija studenta je uspješno spremljena.',
      });

      // Refresh to show locked state
      await fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri slanju evaluacije';
      toast.error('Greška', {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);

    try {
      await apiRequest(`/api/evaluations/internship/${id}`, {
        method: 'DELETE',
      });

      toast.success('Evaluacija obrisana', {
        description: 'Možete ponovno popuniti evaluaciju.',
      });

      setShowDeleteDialog(false);
      setExistingEvaluation(null);
      reset({
        rating: 0,
        technicalSkills: 0,
        communication: 0,
        workEthic: 0,
        overallPerformance: '',
        recommendations: '',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri brisanju evaluacije';
      toast.error('Greška', {
        description: message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getRatingLabel = (rating: number): string => {
    const labels: Record<number, string> = {
      1: 'Nedovoljan',
      2: 'Dovoljan',
      3: 'Dobar',
      4: 'Vrlo dobar',
      5: 'Odličan',
    };
    return labels[rating] || '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Učitavanje...</div>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || 'Praksa nije pronađena'}</AlertDescription>
            </Alert>
            <Button
              variant="ghost"
              onClick={() => navigate('/mentor/company/dashboard')}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Natrag na nadzornu ploču
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isLocked = !!existingEvaluation;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Button
            variant="ghost"
            onClick={() => navigate('/mentor/company/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Natrag
          </Button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Evaluacija studenta</h1>
              {isLocked && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  ZAKLJUČANO
                </Badge>
              )}
            </div>
            <p className="text-gray-600">Forma za evaluaciju performansi studenta na praksi</p>
          </div>

          {/* Internship Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Informacije o praksi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Student:</span>{' '}
                  <span className="text-gray-900">
                    {internship.student.user.firstName} {internship.student.user.lastName}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>{' '}
                  <span className="text-gray-900">{internship.student.user.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Pozicija:</span>{' '}
                  <span className="text-gray-900">{internship.title}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Tvrtka:</span>{' '}
                  <span className="text-gray-900">{internship.company.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Period:</span>{' '}
                  <span className="text-gray-900">
                    {new Date(internship.startDate).toLocaleDateString('hr-HR')} -{' '}
                    {new Date(internship.endDate).toLocaleDateString('hr-HR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Message if Locked */}
          {isLocked && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Evaluacija je uspješno poslana{' '}
                {existingEvaluation.submittedAt &&
                  `dana ${new Date(existingEvaluation.submittedAt).toLocaleDateString('hr-HR')}`}
                . Forma je zaključana i ne može se više mijenjati.
              </AlertDescription>
            </Alert>
          )}

          {/* Evaluation Form */}
          <Card>
            <CardHeader>
              <CardTitle>Forma za evaluaciju</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Overall Rating */}
                <div>
                  <Label className="text-base font-semibold">
                    Ukupna ocjena <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Ocijenite ukupan rad studenta tijekom prakse
                  </p>
                  <Controller
                    name="rating"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center gap-4">
                        <StarRating
                          value={field.value}
                          onChange={field.onChange}
                          readonly={isLocked}
                          size="lg"
                        />
                        {field.value > 0 && (
                          <Badge variant="outline">{getRatingLabel(field.value)}</Badge>
                        )}
                      </div>
                    )}
                  />
                  <FormError message={errors.rating?.message} />
                </div>

                <Separator />

                {/* Technical Skills */}
                <div>
                  <Label className="text-base font-semibold">
                    Tehnička znanja (1-5) <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Ocijenite tehničke vještine i znanje studenta
                  </p>
                  <Controller
                    name="technicalSkills"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center gap-4">
                        <StarRating
                          value={field.value}
                          onChange={field.onChange}
                          readonly={isLocked}
                        />
                        {field.value > 0 && (
                          <Badge variant="outline">{getRatingLabel(field.value)}</Badge>
                        )}
                      </div>
                    )}
                  />
                  <FormError message={errors.technicalSkills?.message} />
                </div>

                <Separator />

                {/* Communication */}
                <div>
                  <Label className="text-base font-semibold">
                    Komunikacija (1-5) <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Ocijenite komunikacijske vještine studenta
                  </p>
                  <Controller
                    name="communication"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center gap-4">
                        <StarRating
                          value={field.value}
                          onChange={field.onChange}
                          readonly={isLocked}
                        />
                        {field.value > 0 && (
                          <Badge variant="outline">{getRatingLabel(field.value)}</Badge>
                        )}
                      </div>
                    )}
                  />
                  <FormError message={errors.communication?.message} />
                </div>

                <Separator />

                {/* Work Ethic */}
                <div>
                  <Label className="text-base font-semibold">
                    Radna etika (1-5) <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Ocijenite radnu etiku i predanost studenta
                  </p>
                  <Controller
                    name="workEthic"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center gap-4">
                        <StarRating
                          value={field.value}
                          onChange={field.onChange}
                          readonly={isLocked}
                        />
                        {field.value > 0 && (
                          <Badge variant="outline">{getRatingLabel(field.value)}</Badge>
                        )}
                      </div>
                    )}
                  />
                  <FormError message={errors.workEthic?.message} />
                </div>

                <Separator />

                {/* Overall Performance */}
                <div>
                  <Label htmlFor="overallPerformance" className="text-base font-semibold">
                    Ukupna izvedba (opcionalno)
                  </Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Opišite ukupnu izvedbu studenta
                  </p>
                  <Textarea
                    id="overallPerformance"
                    {...register('overallPerformance')}
                    placeholder="Detaljno opišite kako je student izvršio svoje zadatke, koje vještine je pokazao, te što može unaprijediti..."
                    className={`${errors.overallPerformance ? 'border-red-500' : ''}`}
                    rows={6}
                    maxLength={1000}
                    disabled={isLocked}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <FormError message={errors.overallPerformance?.message} />
                    <span className="text-xs text-gray-500">
                      Znakova: {watch('overallPerformance')?.length || 0} / 1000
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Recommendations */}
                <div>
                  <Label htmlFor="recommendations" className="text-base font-semibold">
                    Preporuke (opcionalno)
                  </Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Dodatne preporuke ili komentari za studenta
                  </p>
                  <Textarea
                    id="recommendations"
                    {...register('recommendations')}
                    placeholder="Preporuke za budući razvoj studenta, područja za unapređenje, ili dodatni komentari..."
                    className={`${errors.recommendations ? 'border-red-500' : ''}`}
                    rows={4}
                    maxLength={1000}
                    disabled={isLocked}
                  />
                  <FormError message={errors.recommendations?.message} />
                </div>

                {/* Submit Button */}
                {!isLocked && (
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/mentor/company/dashboard')}
                    >
                      Odustani
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Slanje...' : 'Pošalji evaluaciju'}
                    </Button>
                  </div>
                )}

                {isLocked && (
                  <div className="flex flex-col items-center gap-4 pt-4">
                    <Alert className="max-w-md border-gray-200">
                      <Lock className="h-4 w-4" />
                      <AlertDescription>
                        Ova evaluacija je zaključana i ne može se mijenjati.
                      </AlertDescription>
                    </Alert>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Obriši i ponovno popuni
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati evaluaciju?</AlertDialogTitle>
            <AlertDialogDescription>
              Jeste li sigurni da želite obrisati ovu evaluaciju? Nakon brisanja možete
              ponovno popuniti formu i poslati novu evaluaciju.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Odustani</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Brisanje...' : 'Obriši'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
