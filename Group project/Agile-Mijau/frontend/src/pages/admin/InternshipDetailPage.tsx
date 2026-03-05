import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { useRole } from '../../hooks/useRole';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AlertCircle, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { InternshipStatus } from '../../services/internshipsService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertTitle } from '@/components/ui/alert';

type InternshipStatusType = typeof InternshipStatus[keyof typeof InternshipStatus];

interface InternshipDetail {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: number;
  requiredHours: number;
  requiredSkills: string[];
  salary: number | null;
  startDate: string;
  endDate: string;
  status: InternshipStatusType;
  company: {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  student?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  academicYear?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  grade?: number | null;
  gradeComment?: string | null;
  gradedAt?: string | null;
}

interface CompanyEvaluation {
  id: string;
  rating: number;
  technicalSkills: number;
  communication: number;
  workEthic: number;
  overallPerformance: string;
  recommendations?: string;
  submittedAt: string;
  mentor?: {
    user?: {
      firstName: string;
      lastName: string;
    };
  };
}

interface Goal {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt: string | null;
  dueDate: string | null;
  createdAt: string;
}

interface DiaryEntry {
  id: string;
  date: string;
  entry: string;
  hoursWorked: number;
  approved: boolean;
  approvedAt: string | null;
  mentorComment: string | null;
}

const getStatusLabel = (status: InternshipStatusType) => {
  switch (status) {
    case InternshipStatus.DRAFT:
      return 'Nacrt';
    case InternshipStatus.PUBLISHED:
      return 'Objavljeno';
    case InternshipStatus.ACTIVE:
      return 'Aktivno';
    case InternshipStatus.APPROVED:
      return 'Odobreno';
    case InternshipStatus.COMPLETED:
      return 'Završeno';
    case InternshipStatus.GRADED:
      return 'Ocijenjeno';
    case InternshipStatus.ARCHIVED:
      return 'Arhivirano';
    default:
      return status;
  }
};

export const InternshipDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useRole();

  const [internship, setInternship] = useState<InternshipDetail | null>(null);
  const [companyEvaluation, setCompanyEvaluation] = useState<CompanyEvaluation | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<InternshipStatusType | ''>('');

  useEffect(() => {
    if (id) {
      fetchInternship();
    }
  }, [id]);

  const fetchInternship = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiRequest<InternshipDetail>(`/api/internships/${id}`, {
        method: 'GET',
      });
      setInternship(response);
      setSelectedStatus(response.status);

      // Fetch company evaluation if internship is COMPLETED or GRADED
      if (response.status === InternshipStatus.COMPLETED || response.status === InternshipStatus.GRADED) {
        try {
          const evaluation = await apiRequest<CompanyEvaluation>(`/api/internships/${id}/company-evaluation`, {
            method: 'GET',
          });
          setCompanyEvaluation(evaluation);
        } catch {
          // Evaluation might not exist yet
          setCompanyEvaluation(null);
        }
      }

      // Fetch goals and diary entries if internship has a student (ACTIVE or later)
      const hasStudent = response.status === InternshipStatus.ACTIVE ||
        response.status === InternshipStatus.APPROVED ||
        response.status === InternshipStatus.COMPLETED ||
        response.status === InternshipStatus.GRADED;
      if (hasStudent) {
        try {
          const goalsResponse = await apiRequest<Goal[]>(`/api/goals?internshipId=${id}`, {
            method: 'GET',
          });
          setGoals(goalsResponse);
        } catch {
          setGoals([]);
        }

        try {
          const diaryResponse = await apiRequest<DiaryEntry[]>(`/api/diary/internship/${id}`, {
            method: 'GET',
          });
          setDiaryEntries(diaryResponse);
        } catch {
          setDiaryEntries([]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju prakse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!id) return;

    setIsApproving(true);

    try {
      await apiRequest(`/api/internships/${id}/approve`, {
        method: 'POST',
      });

      toast.success('Praksa odobrena', {
        description: 'Praksa je uspješno odobrena.',
      });

      // Refresh internship data
      await fetchInternship();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri odobravanju prakse';
      toast.error('Greška', {
        description: message,
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleStatusChange = async (newStatus: InternshipStatusType) => {
    if (!id || !internship) return;

    // Prevent changing status if already approved (ACTIVE = approved and visible to students)
    if (internship.status === InternshipStatus.ACTIVE) {
      toast.error('Status se ne može promijeniti nakon odobrenja');
      return;
    }

    try {
      await apiRequest(`/api/internships/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      toast.success('Status uspješno ažuriran', {
        description: `Status prakse je promijenjen na "${getStatusLabel(newStatus)}"`,
      });

      setSelectedStatus(newStatus);
      // Reload to get updated data
      await fetchInternship();
    } catch (error) {
      console.error('Failed to update status:', error);
      const message = error instanceof Error ? error.message : 'Greška pri ažuriranju statusa';
      toast.error('Greška', {
        description: message,
      });
      setSelectedStatus(internship.status); // Revert on error
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
          onClick={() => navigate('/admin/internships')}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Natrag na listu
        </Button>
      </div>
    );
  }

  const isApprovedOrLater = internship.status === InternshipStatus.ACTIVE ||
    internship.status === InternshipStatus.APPROVED ||
    internship.status === InternshipStatus.COMPLETED ||
    internship.status === InternshipStatus.GRADED;
  const canApprove = isAdmin && !isApprovedOrLater;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/internships')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Natrag na listu
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{internship.title}</h1>
            <p className="text-gray-600">{internship.company.name}</p>
          </div>
          <Badge>
            {isApprovedOrLater && <Lock className="h-3 w-3 mr-1" />}
            {getStatusLabel(internship.status)}
          </Badge>
        </div>
      </div>

      {/* Approved Status Warning */}
      {isApprovedOrLater && (
        <Alert className="mb-6">
          <Lock className="h-4 w-4" />
          <AlertTitle>Status zaključan</AlertTitle>
          <AlertDescription>
            Ova praksa je odobrena. Status se ne može promijeniti nakon odobrenja.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Opis prakse</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{internship.description}</p>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Potrebne vještine</h2>
            <div className="flex flex-wrap gap-2">
              {internship.requiredSkills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {internship.student && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Student</h2>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Ime:</span>{' '}
                  {internship.student.user.firstName} {internship.student.user.lastName}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Email:</span>{' '}
                  {internship.student.user.email}
                </p>
                {internship.academicYear && (
                  <p className="text-gray-700">
                    <span className="font-medium">Akademska godina:</span>{' '}
                    {internship.academicYear}
                  </p>
                )}
              </div>
            </div>
          )}

          {internship.status === InternshipStatus.GRADED && internship.grade && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Ocjena akademskog mentora</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-700">{internship.grade}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Konačna ocjena</p>
                    {internship.gradedAt && (
                      <p className="text-sm text-gray-500">
                        {new Date(internship.gradedAt).toLocaleDateString('hr-HR')}
                      </p>
                    )}
                  </div>
                </div>
                {internship.gradeComment && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Komentar:</p>
                    <p className="text-gray-600">{internship.gradeComment}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Company Mentor Evaluation */}
          {companyEvaluation && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Evaluacija mentora iz tvrtke</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700">{companyEvaluation.rating}</p>
                    <p className="text-xs text-gray-500">Ukupna ocjena</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-700">{companyEvaluation.technicalSkills}</p>
                    <p className="text-xs text-gray-500">Tehničke vještine</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-700">{companyEvaluation.communication}</p>
                    <p className="text-xs text-gray-500">Komunikacija</p>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-700">{companyEvaluation.workEthic}</p>
                    <p className="text-xs text-gray-500">Radna etika</p>
                  </div>
                </div>
                {companyEvaluation.overallPerformance && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Ukupni dojam:</p>
                    <p className="text-gray-600">{companyEvaluation.overallPerformance}</p>
                  </div>
                )}
                {companyEvaluation.recommendations && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Preporuke:</p>
                    <p className="text-gray-600">{companyEvaluation.recommendations}</p>
                  </div>
                )}
                {companyEvaluation.submittedAt && (
                  <p className="text-xs text-gray-400">
                    Podneseno: {new Date(companyEvaluation.submittedAt).toLocaleDateString('hr-HR')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Awaiting evaluations message */}
          {internship.status === InternshipStatus.ACTIVE && internship.student && (
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
              <h2 className="text-xl font-semibold mb-2 text-amber-800">Čeka se evaluacija</h2>
              <p className="text-amber-700">
                Praksa je aktivna. Mentor iz tvrtke još nije podnio evaluaciju studenta.
              </p>
            </div>
          )}

          {internship.status === InternshipStatus.COMPLETED && !internship.grade && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h2 className="text-xl font-semibold mb-2 text-blue-800">Čeka se ocjena</h2>
              <p className="text-blue-700">
                Mentor iz tvrtke je podnio evaluaciju. Čeka se ocjena akademskog mentora.
              </p>
            </div>
          )}

          {/* Goals Section */}
          {goals.length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Ciljevi ({goals.length})</h2>
              <div className="space-y-3">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-lg border ${
                      goal.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                        goal.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {goal.completed && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium ${goal.completed ? 'text-green-800' : 'text-gray-800'}`}>
                          {goal.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          {goal.dueDate && (
                            <span>Rok: {new Date(goal.dueDate).toLocaleDateString('hr-HR')}</span>
                          )}
                          {goal.completedAt && (
                            <span>Završeno: {new Date(goal.completedAt).toLocaleDateString('hr-HR')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diary Entries Section */}
          {diaryEntries.length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Dnevnik aktivnosti ({diaryEntries.length})</h2>
                <div className="text-sm text-gray-500">
                  Ukupno sati: {diaryEntries.reduce((sum, e) => sum + Number(e.hoursWorked), 0).toFixed(1)}h
                </div>
              </div>
              <div className="space-y-4">
                {diaryEntries.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-lg border ${
                      entry.approved ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {new Date(entry.date).toLocaleDateString('hr-HR')}
                        </span>
                        <Badge variant={entry.approved ? 'default' : 'secondary'}>
                          {entry.approved ? 'Odobreno' : 'Čeka odobrenje'}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">{entry.hoursWorked}h</span>
                    </div>
                    <p className="text-gray-700 text-sm">{entry.entry}</p>
                    {entry.mentorComment && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                        <span className="font-medium text-blue-800">Komentar mentora: </span>
                        <span className="text-blue-700">{entry.mentorComment}</span>
                      </div>
                    )}
                  </div>
                ))}
                {diaryEntries.length > 5 && (
                  <p className="text-center text-sm text-gray-500">
                    ... i još {diaryEntries.length - 5} unosa
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {canApprove && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold mb-4">Akcije</h3>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full" disabled={isApproving}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isApproving ? 'Odobravanje...' : 'Odobri praksu'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Odobri praksu?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Jeste li sigurni da želite odobriti ovu praksu? Student će biti
                      obaviješten o odobrenju.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Odustani</AlertDialogCancel>
                    <AlertDialogAction onClick={handleApprove}>
                      Potvrdi
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Status Management */}
          {isAdmin && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold mb-4">Upravljanje statusom</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="text-sm font-medium mb-2 block">
                    Promijeni status
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Select
                            value={selectedStatus}
                            onValueChange={(value) => handleStatusChange(value as InternshipStatusType)}
                            disabled={isApprovedOrLater}
                          >
                            <SelectTrigger
                              id="status"
                              className={isApprovedOrLater ? 'opacity-50 cursor-not-allowed' : ''}
                            >
                              <SelectValue placeholder="Odaberi status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={InternshipStatus.DRAFT}>Nacrt</SelectItem>
                              <SelectItem value={InternshipStatus.PUBLISHED}>Objavljeno</SelectItem>
                              <SelectItem value={InternshipStatus.ACTIVE}>Aktivno</SelectItem>
                              <SelectItem value={InternshipStatus.APPROVED}>Odobreno</SelectItem>
                              <SelectItem value={InternshipStatus.COMPLETED}>Završeno</SelectItem>
                              <SelectItem value={InternshipStatus.GRADED}>Ocijenjeno</SelectItem>
                              <SelectItem value={InternshipStatus.ARCHIVED}>Arhivirano</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TooltipTrigger>
                      {isApprovedOrLater && (
                        <TooltipContent>
                          <p>Status se ne može promijeniti nakon odobrenja</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {isApprovedOrLater && internship.approvedAt && (
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Odobreno {new Date(internship.approvedAt).toLocaleDateString('hr-HR')} u{' '}
                      {new Date(internship.approvedAt).toLocaleTimeString('hr-HR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Detalji</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Lokacija</p>
                <p className="font-medium">{internship.location}</p>
              </div>
              <div>
                <p className="text-gray-500">Trajanje</p>
                <p className="font-medium">{internship.duration} mjeseci</p>
              </div>
              <div>
                <p className="text-gray-500">Potrebni sati</p>
                <p className="font-medium">{internship.requiredHours}h</p>
              </div>
              {internship.salary && (
                <div>
                  <p className="text-gray-500">Plaća</p>
                  <p className="font-medium">{internship.salary} EUR</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Početak</p>
                <p className="font-medium">
                  {new Date(internship.startDate).toLocaleDateString('hr-HR')}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Kraj</p>
                <p className="font-medium">
                  {new Date(internship.endDate).toLocaleDateString('hr-HR')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Poduzeće</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{internship.company.name}</p>
              <p className="text-gray-600">{internship.company.address}</p>
              <p className="text-gray-600">{internship.company.phone}</p>
              <p className="text-gray-600">{internship.company.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
