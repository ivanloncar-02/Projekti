import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '../../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRating } from '@/components/ui/star-rating';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { AlertCircle, ArrowLeft, CheckCircle, Calendar, Award, Target, Download } from 'lucide-react';
import { toast } from 'sonner';
import { FormError } from '../../components/FormError';

const gradeSchema = z.object({
  grade: z.number().min(1, 'Ocjena je obavezna').max(5),
  comment: z.string().max(1000, 'Komentar može imati maksimalno 1000 znakova').optional(),
});

type GradeFormData = {
  grade: number;
  comment?: string;
};

interface DiaryEntry {
  id: string;
  date: string;
  entry: string;
  hoursWorked: number;
  approved: boolean;
  mentorComment?: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
}

interface Evaluation {
  id: string;
  rating: number;
  technicalSkills: number;
  communication: number;
  workEthic: number;
  overallPerformance?: string;
  recommendations?: string;
  submittedAt: string;
}

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
  requiredHours: number;
  grade?: number;
  gradeComment?: string;
  academicMentor?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
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
  requiredHours: number;
  grade?: number;
  gradeComment?: string;
  academicMentor?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export const InternshipGradingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [internship, setInternship] = useState<Internship | null>(null);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [evaluationCompleted, setEvaluationCompleted] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema) as any,
    mode: 'onChange',
    defaultValues: {
      grade: internship?.grade || 0,
      comment: internship?.gradeComment || '',
    },
  });

  const gradeValue = watch('grade');

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
        requiredHours: response.requiredHours,
        grade: response.grade,
        gradeComment: response.gradeComment,
        academicMentor: response.academicMentor,
      };

      setInternship(internshipData);

      // Fetch diary entries
      try {
        const diaries = await apiRequest<DiaryEntry[]>(`/api/diary/internship/${id}`, {
          method: 'GET',
        });
        setDiaryEntries(diaries || []);
      } catch {
        setDiaryEntries([]);
      }

      // Fetch goals
      try {
        const goalsData = await apiRequest<Goal[]>(`/api/goals?internshipId=${id}`, {
          method: 'GET',
        });
        setGoals(goalsData || []);
      } catch {
        setGoals([]);
      }

      // Check if company evaluation is completed
      try {
        const evalStatus = await apiRequest<{ completed: boolean }>(
          `/api/evaluations/internship/${id}/status`,
          { method: 'GET' }
        );
        setEvaluationCompleted(evalStatus.completed);

        if (evalStatus.completed) {
          // Fetch the evaluation - API returns single object, not array
          const evalData = await apiRequest<Evaluation | null>(
            `/api/evaluations/internship/${id}`,
            { method: 'GET' }
          );
          if (evalData) {
            setEvaluation(evalData);
          }
        }
      } catch {
        setEvaluationCompleted(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju prakse');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (_data: GradeFormData) => {
    setShowConfirmDialog(true);
  };

  const confirmSubmitGrade = async () => {
    if (!id) return;

    const data = watch();
    setIsSubmitting(true);

    try {
      await apiRequest(`/api/internships/${id}/grade`, {
        method: 'POST',
        body: JSON.stringify({
          grade: data.grade,
          comment: data.comment,
        }),
      });

      toast.success('Ocjena dodana!', {
        description: 'Ocjena je uspješno dodana i student je obaviješten.',
      });

      setShowConfirmDialog(false);

      // Refresh internship data
      await fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri dodavanju ocjene';
      toast.error('Greška', {
        description: message,
      });
      setShowConfirmDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!id) return;

    setIsDownloadingReport(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/reports/internship/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Greška pri preuzimanju izvješća');
      }

      const contentType = response.headers.get('content-type') || 'application/pdf';
      const blob = await response.blob();
      const typedBlob = new Blob([blob], { type: contentType });
      const url = window.URL.createObjectURL(typedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `izvjesce-praksa-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Izvješće preuzeto!', {
        description: 'PDF izvješće je uspješno preuzeto.',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri preuzimanju izvješća';
      toast.error('Greška', {
        description: message,
      });
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const approvedEntries = diaryEntries.filter((entry) => entry.approved);
  const totalHours = diaryEntries.reduce((sum, entry) => sum + Number(entry.hoursWorked), 0);
  const hoursPercentage = internship ? (totalHours / internship.requiredHours) * 100 : 0;
  const canSubmitGrade = evaluationCompleted && hoursPercentage >= 100;
  const hasExistingGrade = internship?.grade !== null && internship?.grade !== undefined;

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
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || 'Praksa nije pronađena'}</AlertDescription>
            </Alert>
            <Button
              variant="ghost"
              onClick={() => navigate('/mentor/academic/dashboard')}
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/mentor/academic/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Natrag
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadReport}
              disabled={isDownloadingReport}
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloadingReport ? 'Preuzimanje...' : 'Preuzmi izvješće'}
            </Button>
          </div>

          {/* Internship Info */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Ocjenjivanje prakse - {internship.title}
            </h1>
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

            {hasExistingGrade && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-900">
                    Ocjena: {internship.grade}/5
                  </span>
                </div>
                {internship.gradeComment && (
                  <p className="text-sm text-green-800 mt-2">{internship.gradeComment}</p>
                )}
              </div>
            )}
          </div>

          {/* Requirements Check */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Hours Progress */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Evidencija sati</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Odrađeno sati</span>
                    <span className="font-semibold">
                      {totalHours} / {internship.requiredHours}h
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        hoursPercentage >= 100 ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(hoursPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {hoursPercentage.toFixed(1)}% završeno
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hoursPercentage >= 100 ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Sati ispunjeni
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Sati nisu ispunjeni
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <div>Ukupno unosa: {diaryEntries.length}</div>
                  <div>Odobreno: {approvedEntries.length}</div>
                </div>
              </div>
            </div>

            {/* Company Evaluation */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluacija tvrtke</h3>
              {evaluationCompleted && evaluation ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Evaluacija dovršena
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Ocjena mentora:</span>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                      {evaluation.rating}/5
                    </div>
                  </div>
                  {evaluation.overallPerformance && (
                    <div>
                      <span className="text-sm text-gray-600">Ukupna izvedba:</span>
                      <p className="text-sm text-gray-900 mt-1">{evaluation.overallPerformance}</p>
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Datum: {new Date(evaluation.submittedAt).toLocaleDateString('hr-HR')}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Badge variant="secondary">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Evaluacija nije dovršena
                  </Badge>
                  <p className="text-sm text-gray-600">
                    Mentor u tvrtki mora prvo dovršiti evaluaciju studenta prije nego što možete dodati ocjenu.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Requirements Alert */}
          {!canSubmitGrade && !hasExistingGrade && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {!evaluationCompleted && 'Evaluacija tvrtke još nije dovršena. '}
                {hoursPercentage < 100 && 'Student još nije ostvario potreban broj sati. '}
                Prije dodavanja ocjene, provjerite jesu li svi uvjeti ispunjeni.
              </AlertDescription>
            </Alert>
          )}

          {/* Grade Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {hasExistingGrade ? 'Dodana ocjena' : 'Dodaj ocjenu'}
            </h2>

            {hasExistingGrade ? (
              <div className="text-center py-8">
                <Award className="mx-auto h-16 w-16 text-green-600 mb-4" />
                <p className="text-gray-600">
                  Ocjena je već dodana za ovu praksu. Detalji se prikazuju na vrhu stranice.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">
                    Ocjena <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Ocijenite ukupan rad studenta na praksi
                  </p>
                  <Controller
                    name="grade"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center gap-4">
                        <StarRating
                          value={field.value}
                          onChange={field.onChange}
                          readonly={!canSubmitGrade}
                          size="lg"
                        />
                        {field.value > 0 && (
                          <Badge variant="outline">
                            {field.value === 5 && 'Izvrstan'}
                            {field.value === 4 && 'Vrlo dobar'}
                            {field.value === 3 && 'Dobar'}
                            {field.value === 2 && 'Dovoljan'}
                            {field.value === 1 && 'Nedovoljan'}
                          </Badge>
                        )}
                      </div>
                    )}
                  />
                  <FormError message={errors.grade?.message} />
                </div>

                <div>
                  <Label htmlFor="comment">
                    Komentar (opcionalno)
                  </Label>
                  <Textarea
                    id="comment"
                    {...register('comment')}
                    placeholder="Obrazložite ocjenu..."
                    className={`mt-1 min-h-[150px] ${errors.comment ? 'border-red-500' : ''}`}
                    maxLength={1000}
                    disabled={!canSubmitGrade}
                  />
                  <FormError message={errors.comment?.message} />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/mentor/academic/dashboard')}
                    className="flex-1"
                  >
                    Odustani
                  </Button>
                  <Button
                    type="submit"
                    disabled={!canSubmitGrade || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Dodavanje...' : 'Dodaj ocjenu'}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Goals Section */}
          <div className="bg-white shadow rounded-lg mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Ciljevi prakse ({goals.length})
              </h2>
            </div>

            {goals.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Target className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Student nije unio ciljeve prakse.</p>
                <Alert className="mt-4 max-w-md mx-auto">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Preporučuje se zatražiti od studenta da unese planirane ciljeve prakse.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-4">
                  {goals.map((goal, index) => (
                    <div
                      key={goal.id}
                      className={`p-4 rounded-lg border ${
                        goal.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {index + 1}. {goal.title}
                            </span>
                            {goal.completed ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Završeno
                              </Badge>
                            ) : (
                              <Badge variant="secondary">U tijeku</Badge>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{goal.description}</p>
                          {goal.dueDate && (
                            <p className="mt-2 text-xs text-gray-500">
                              Rok: {new Date(goal.dueDate).toLocaleDateString('hr-HR')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <span className="font-medium">Ukupno:</span>{' '}
                  {goals.filter((g) => g.completed).length} od {goals.length} ciljeva završeno
                </div>
              </div>
            )}
          </div>

          {/* Diary Entries Summary */}
          <div className="bg-white shadow rounded-lg mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Dnevnički unosi ({diaryEntries.length})
              </h2>
            </div>

            {diaryEntries.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Student nije popunio dnevnik aktivnosti.</p>
                <Alert className="mt-4 max-w-md mx-auto">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Dnevnik aktivnosti nije popunjen. Preporučuje se zatražiti od studenta da redovito bilježi aktivnosti.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum</TableHead>
                      <TableHead>Opis</TableHead>
                      <TableHead>Sati</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {diaryEntries.slice(0, 5).map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {new Date(entry.date).toLocaleDateString('hr-HR')}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md truncate" title={entry.entry}>
                            {entry.entry}
                          </div>
                        </TableCell>
                        <TableCell>{entry.hoursWorked}h</TableCell>
                        <TableCell>
                          {entry.approved ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Odobreno
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Na čekanju</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {diaryEntries.length > 5 && (
                  <div className="px-6 py-3 border-t text-sm text-gray-500 text-center">
                    ... i još {diaryEntries.length - 5} unosa
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potvrda dodavanja ocjene</AlertDialogTitle>
            <AlertDialogDescription>
              Jeste li sigurni da želite dodati ocjenu {gradeValue}/5 za ovu praksu?
              Nakon dodavanja, ocjena će biti vidljiva studentu i neće se moći mijenjati.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Odustani</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmitGrade} disabled={isSubmitting}>
              {isSubmitting ? 'Dodavanje...' : 'Potvrdi'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
