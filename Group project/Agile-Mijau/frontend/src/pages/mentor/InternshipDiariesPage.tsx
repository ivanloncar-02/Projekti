import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { AlertCircle, ArrowLeft, CheckCircle, Calendar, ClipboardCheck, Target, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { FormError } from '../../components/FormError';

const commentSchema = z.object({
  mentorComment: z.string().min(1, 'Komentar je obavezan').max(500, 'Komentar može imati maksimalno 500 znakova'),
});

const approvalSchema = z.object({
  mentorComment: z.string().max(500, 'Komentar može imati maksimalno 500 znakova').optional(),
});

const goalSchema = z.object({
  title: z.string().min(1, 'Naziv cilja je obavezan').max(200, 'Naziv može imati maksimalno 200 znakova'),
  description: z.string().max(1000, 'Opis može imati maksimalno 1000 znakova').optional(),
});

type CommentFormData = z.infer<typeof commentSchema>;
type ApprovalFormData = z.infer<typeof approvalSchema>;
type GoalFormData = z.infer<typeof goalSchema>;

interface DiaryEntry {
  id: string;
  date: string;
  entry: string;
  hoursWorked: number;
  approved: boolean;
  mentorComment?: string;
  mentorName?: string;
  approvedAt?: string;
  createdAt: string;
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

interface Goal {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
}

export const InternshipDiariesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [internship, setInternship] = useState<Internship | null>(null);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [commentingEntryId, setCommentingEntryId] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [isSubmittingGoal, setIsSubmittingGoal] = useState(false);

  const {
    register: registerApproval,
    handleSubmit: handleSubmitApproval,
    formState: { errors: approvalErrors },
    reset: resetApproval,
  } = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
    mode: 'onChange',
  });

  const {
    register: registerComment,
    handleSubmit: handleSubmitComment,
    formState: { errors: commentErrors },
    reset: resetComment,
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    mode: 'onChange',
  });

  const {
    register: registerGoal,
    handleSubmit: handleSubmitGoal,
    formState: { errors: goalErrors },
    reset: resetGoal,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (id) {
      fetchInternship();
      fetchDiaryEntries();
      fetchGoals();
    }
  }, [id]);

  const fetchInternship = async () => {
    if (!id) return;

    try {
      const response = await apiRequest<InternshipResponse>(`/api/internships/${id}`, {
        method: 'GET',
      });

      // Extract student from approved application
      const approvedApplication = response.applications?.find(
        (app) => app.status === 'APPROVED'
      );

      if (!approvedApplication?.student) {
        setError('Nije pronađen student s odobrenom prijavom');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju prakse');
    }
  };

  const fetchDiaryEntries = async () => {
    if (!id) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await apiRequest<DiaryEntry[]>(`/api/diary/internship/${id}`, {
        method: 'GET',
      });

      // Sort by date DESC (newest first)
      const sorted = (response || []).sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setDiaryEntries(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju dnevnika');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGoals = async () => {
    if (!id) return;

    try {
      const response = await apiRequest<Goal[]>(`/api/goals?internshipId=${id}`, {
        method: 'GET',
      });
      setGoals(response || []);
    } catch (err) {
      console.error('Error fetching goals:', err);
    }
  };

  const onCreateGoal = async (data: GoalFormData) => {
    if (!id) return;

    setIsSubmittingGoal(true);

    try {
      await apiRequest('/api/goals', {
        method: 'POST',
        body: JSON.stringify({
          title: data.title,
          description: data.description || '',
          internshipId: id,
        }),
      });

      toast.success('Cilj dodan', {
        description: 'Cilj je uspješno dodan za studenta.',
      });

      setShowGoalDialog(false);
      resetGoal();

      // Refresh goals
      await fetchGoals();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri dodavanju cilja';
      toast.error('Greška', {
        description: message,
      });
    } finally {
      setIsSubmittingGoal(false);
    }
  };

  const handleCommentClick = (entryId: string) => {
    setCommentingEntryId(entryId);
    setShowCommentDialog(true);
    resetComment();
  };

  const handleApproveClick = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setShowApprovalDialog(true);
    // Pre-populate with existing comment if any
    resetApproval({ mentorComment: entry.mentorComment || '' });
  };

  const onAddComment = async (data: CommentFormData) => {
    if (!commentingEntryId) return;

    setIsSubmitting(true);

    try {
      await apiRequest(`/api/diary/${commentingEntryId}/comment`, {
        method: 'POST',
        body: JSON.stringify({
          mentorComment: data.mentorComment,
        }),
      });

      toast.success('Komentar dodan', {
        description: 'Komentar je uspješno dodan na dnevnički unos.',
      });

      setShowCommentDialog(false);
      setCommentingEntryId(null);
      resetComment();

      // Refresh diary entries
      await fetchDiaryEntries();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri dodavanju komentara';
      toast.error('Greška', {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onApprove = async (data: ApprovalFormData) => {
    if (!selectedEntry) return;

    setIsSubmitting(true);

    try {
      await apiRequest(`/api/diary/${selectedEntry.id}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({
          mentorComment: data.mentorComment,
        }),
      });

      toast.success('Unos odobren', {
        description: 'Dnevnički unos je uspješno odobren.',
      });

      setShowConfirmation(false);
      setShowApprovalDialog(false);
      setSelectedEntry(null);
      resetApproval();

      // Refresh diary entries
      await fetchDiaryEntries();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri odobravanju unosa';
      toast.error('Greška', {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingEntries = diaryEntries.filter((entry) => !entry.approved);
  const approvedEntries = diaryEntries.filter((entry) => entry.approved);
  const totalHours = diaryEntries.reduce((sum, entry) => sum + Number(entry.hoursWorked), 0);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Button
            variant="ghost"
            onClick={() => navigate('/mentor/company/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Natrag
          </Button>

          {/* Internship Info */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Dnevnik prakse - {internship.title}
              </h1>
              <Button
                onClick={() => navigate(`/mentor/company/internships/${internship.id}/evaluate`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Ocijeni studenta
              </Button>
            </div>
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
                <span className="font-medium text-gray-700">Ukupno sati:</span>{' '}
                <span className="text-gray-900 font-semibold">{totalHours}h</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white shadow rounded-lg p-4">
              <div className="text-sm text-gray-500">Ukupno unosa</div>
              <div className="text-2xl font-bold text-gray-900">{diaryEntries.length}</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <div className="text-sm text-gray-500">Za odobriti</div>
              <div className="text-2xl font-bold text-orange-600">{pendingEntries.length}</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <div className="text-sm text-gray-500">Odobreno</div>
              <div className="text-2xl font-bold text-green-600">{approvedEntries.length}</div>
            </div>
          </div>

          {/* Diary Entries Table */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Dnevnički unosi</h2>
            </div>

            {diaryEntries.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nema unosa</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Student još nije dodao niti jedan dnevnički unos.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum</TableHead>
                      <TableHead>Opis aktivnosti</TableHead>
                      <TableHead>Sati</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Komentar mentora</TableHead>
                      <TableHead>Akcije</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {diaryEntries.map((entry) => (
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
                            <div className="flex flex-col gap-1">
                              <Badge variant="default" className="bg-green-100 text-green-800 w-fit">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Odobreno
                              </Badge>
                              {entry.approvedAt && (
                                <span className="text-xs text-gray-500">
                                  {new Date(entry.approvedAt).toLocaleDateString('hr-HR')}
                                </span>
                              )}
                              {entry.mentorName && (
                                <span className="text-xs text-gray-500">
                                  {entry.mentorName}
                                </span>
                              )}
                            </div>
                          ) : (
                            <Badge variant="secondary">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Na čekanju
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {entry.mentorComment ? (
                            <div className="max-w-md">
                              <p className="text-sm text-gray-600">{entry.mentorComment}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {!entry.approved ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCommentClick(entry.id)}
                              >
                                Dodaj komentar
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApproveClick(entry)}
                              >
                                Odobri
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Odobreno</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Goals Section */}
          <div className="bg-white shadow rounded-lg mt-6">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Ciljevi prakse</h2>
              <Button size="sm" onClick={() => setShowGoalDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Dodaj cilj
              </Button>
            </div>

            {goals.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Target className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nema ciljeva</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Dodajte ciljeve za studenta kako biste pratili napredak prakse.
                </p>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <div
                      key={goal.id}
                      className={`p-4 border rounded-lg ${
                        goal.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 ${goal.completed ? 'text-green-600' : 'text-gray-400'}`}>
                            {goal.completed ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <Target className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className={`font-medium ${goal.completed ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                              {goal.title}
                            </p>
                            {goal.description && (
                              <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant={goal.completed ? 'default' : 'secondary'}>
                          {goal.completed ? 'Završeno' : 'U tijeku'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj cilj</DialogTitle>
            <DialogDescription>
              Definirajte novi cilj za studenta na ovoj praksi.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitGoal(onCreateGoal)}>
            <div className="mb-4">
              <Label htmlFor="goalTitle">
                Naziv cilja <span className="text-red-500">*</span>
              </Label>
              <input
                id="goalTitle"
                type="text"
                {...registerGoal('title')}
                placeholder="npr. Naučiti React Hooks"
                className={`mt-1 w-full px-3 py-2 border rounded-md ${goalErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                maxLength={200}
              />
              <FormError message={goalErrors.title?.message} />
            </div>

            <div className="mb-4">
              <Label htmlFor="goalDescription">Opis (opcionalno)</Label>
              <Textarea
                id="goalDescription"
                {...registerGoal('description')}
                placeholder="Opišite detalje cilja..."
                className={`mt-1 ${goalErrors.description ? 'border-red-500' : ''}`}
                rows={3}
                maxLength={1000}
              />
              <FormError message={goalErrors.description?.message} />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowGoalDialog(false);
                  resetGoal();
                }}
                disabled={isSubmittingGoal}
              >
                Odustani
              </Button>
              <Button type="submit" disabled={isSubmittingGoal}>
                {isSubmittingGoal ? 'Dodavanje...' : 'Dodaj cilj'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj komentar</DialogTitle>
            <DialogDescription>
              Dodajte komentar na dnevnički unos studenta bez odobrenja.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitComment(onAddComment)}>
            <div className="mb-4">
              <Label htmlFor="commentText">
                Komentar <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="commentText"
                {...registerComment('mentorComment')}
                placeholder="Unesite komentar..."
                className={`mt-1 ${commentErrors.mentorComment ? 'border-red-500' : ''}`}
                rows={4}
                maxLength={500}
              />
              <FormError message={commentErrors.mentorComment?.message} />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCommentDialog(false);
                  setCommentingEntryId(null);
                  resetComment();
                }}
                disabled={isSubmitting}
              >
                Odustani
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Dodavanje...' : 'Dodaj komentar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog with Confirmation */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Odobri dnevnički unos</DialogTitle>
            <DialogDescription>
              Dodajte komentar i odobrite dnevnički unos studenta.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitApproval(() => {
            setShowConfirmation(true);
          })}>
            {selectedEntry && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm">
                  <div className="mb-2">
                    <span className="font-medium">Datum:</span>{' '}
                    {new Date(selectedEntry.date).toLocaleDateString('hr-HR')}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Sati:</span> {selectedEntry.hoursWorked}h
                  </div>
                  <div>
                    <span className="font-medium">Opis:</span>
                    <p className="mt-1 text-gray-600">{selectedEntry.entry}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4">
              <Label htmlFor="approvalComment">
                Komentar mentora (opcionalno)
              </Label>
              <Textarea
                id="approvalComment"
                {...registerApproval('mentorComment')}
                placeholder="Unesite komentar vezano uz ovaj unos..."
                className={`mt-1 ${approvalErrors.mentorComment ? 'border-red-500' : ''}`}
                rows={4}
                maxLength={500}
              />
              <FormError message={approvalErrors.mentorComment?.message} />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowApprovalDialog(false);
                  setSelectedEntry(null);
                  resetApproval();
                }}
                disabled={isSubmitting}
              >
                Odustani
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Nastavi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation AlertDialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potvrdite odobrenje</AlertDialogTitle>
            <AlertDialogDescription>
              Jeste li sigurni da želite odobriti ovaj dnevnički unos? Ova radnja se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmation(false)}>
              Odustani
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitApproval(onApprove)}
              className="bg-green-600 hover:bg-green-700"
            >
              Potvrdi odobrenje
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
