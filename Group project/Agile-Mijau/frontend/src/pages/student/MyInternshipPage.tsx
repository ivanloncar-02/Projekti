import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertCircle,
  ArrowLeft,
  Target,
  Calendar,
  FileText,
  Award,
  Plus,
  CheckCircle,
  Download,
  Trash2,
  Edit,
  Upload,
  File,
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Goal {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

interface DiaryEntry {
  id: string;
  date: string;
  entry: string;
  hoursWorked?: number;
  approved: boolean;
  mentorComment?: string;
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
  isLocked: boolean;
  submittedAt: string;
}

interface Internship {
  id: string;
  title: string;
  company: { id: string; name: string };
  startDate: string;
  endDate: string;
  requiredHours: number;
  status: string;
  grade?: number;
  gradeComment?: string;
}

export const MyInternshipPage: React.FC = () => {
  const { internshipId } = useParams<{ internshipId: string }>();
  const navigate = useNavigate();

  const [internship, setInternship] = useState<Internship | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [documents, setDocuments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog states
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showDiaryDialog, setShowDiaryDialog] = useState(false);
  const [editingDiary, setEditingDiary] = useState<DiaryEntry | null>(null);

  // Form states
  const [goalForm, setGoalForm] = useState({ title: '', description: '', dueDate: '' });
  const [diaryForm, setDiaryForm] = useState({ date: '', entry: '', hoursWorked: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('goals');

  useEffect(() => {
    if (internshipId) {
      fetchData();
    }
  }, [internshipId]);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Fetch internship details
      const internshipData = await apiRequest<Internship>(`/api/internships/${internshipId}`);
      setInternship(internshipData);

      // Fetch goals
      try {
        const goalsData = await apiRequest<Goal[]>(`/api/goals?internshipId=${internshipId}`);
        setGoals(goalsData || []);
      } catch {
        setGoals([]);
      }

      // Fetch diary entries
      try {
        const diaryData = await apiRequest<DiaryEntry[]>(`/api/diary/internship/${internshipId}`);
        setDiaryEntries(diaryData || []);
      } catch {
        setDiaryEntries([]);
      }

      // Fetch evaluation - API returns single object, not array
      try {
        const evalData = await apiRequest<Evaluation | null>(`/api/evaluations/internship/${internshipId}`);
        if (evalData) {
          setEvaluation(evalData);
        }
      } catch {
        setEvaluation(null);
      }

      // Fetch documents from application
      try {
        const appData = await apiRequest<{ documentsPaths: string[] | null }>(
          `/api/applications/internship/${internshipId}/my`
        );
        setDocuments(appData?.documentsPaths || []);
      } catch {
        setDocuments([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju podataka');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!goalForm.title) {
      toast.error('Molimo unesite naziv cilja');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('/api/goals', {
        method: 'POST',
        body: JSON.stringify({
          internshipId,
          title: goalForm.title,
          description: goalForm.description,
          dueDate: goalForm.dueDate || null,
        }),
      });
      toast.success('Cilj uspješno dodan');
      setShowGoalDialog(false);
      setGoalForm({ title: '', description: '', dueDate: '' });
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri dodavanju cilja');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    try {
      await apiRequest(`/api/goals/${goalId}/complete`, { method: 'PATCH' });
      toast.success('Cilj označen kao završen');
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri označavanju cilja');
    }
  };

  const handleCreateDiary = async () => {
    if (!diaryForm.date || !diaryForm.entry) {
      toast.error('Molimo unesite datum i opis aktivnosti');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingDiary) {
        await apiRequest(`/api/diary/${editingDiary.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            date: diaryForm.date,
            entry: diaryForm.entry,
            hoursWorked: diaryForm.hoursWorked,
          }),
        });
        toast.success('Unos uspješno ažuriran');
      } else {
        await apiRequest('/api/diary', {
          method: 'POST',
          body: JSON.stringify({
            internshipId,
            date: diaryForm.date,
            entry: diaryForm.entry,
            hoursWorked: diaryForm.hoursWorked,
          }),
        });
        toast.success('Unos uspješno dodan');
      }
      setShowDiaryDialog(false);
      setEditingDiary(null);
      setDiaryForm({ date: '', entry: '', hoursWorked: 0 });
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri spremanju unosa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDiary = async (entryId: string) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovaj unos?')) return;

    try {
      await apiRequest(`/api/diary/${entryId}`, { method: 'DELETE' });
      toast.success('Unos uspješno obrisan');
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri brisanju unosa');
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/internship/${internshipId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Greška pri preuzimanju izvješća');

      const contentType = response.headers.get('content-type') || 'application/pdf';
      const blob = await response.blob();
      const typedBlob = new Blob([blob], { type: contentType });
      const url = window.URL.createObjectURL(typedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `izvjesce-praksa-${internshipId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Izvješće uspješno preuzeto');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri preuzimanju izvješća');
    }
  };

  const openEditDiary = (entry: DiaryEntry) => {
    setEditingDiary(entry);
    setDiaryForm({
      date: entry.date.split('T')[0],
      entry: entry.entry,
      hoursWorked: entry.hoursWorked || 0,
    });
    setShowDiaryDialog(true);
  };

  const handleUploadDocuments = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/uploads/documents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Greška pri učitavanju dokumenata');

      const data = await response.json();
      const newPaths = data.files.map((f: { path: string }) => f.path);

      // Add documents to application
      await apiRequest(`/api/applications/internship/${internshipId}/documents`, {
        method: 'PATCH',
        body: JSON.stringify({ documentPaths: newPaths }),
      });

      toast.success('Dokumenti uspješno učitani');
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri učitavanju dokumenata');
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleDeleteDocument = async (documentPath: string) => {
    if (!confirm('Jeste li sigurni da želite ukloniti ovaj dokument?')) return;

    try {
      await apiRequest(`/api/applications/internship/${internshipId}/documents/remove`, {
        method: 'PATCH',
        body: JSON.stringify({ documentPath }),
      });
      toast.success('Dokument uklonjen');
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri uklanjanju dokumenta');
    }
  };

  const getDocumentName = (path: string) => {
    const parts = path.split('/');
    return parts[parts.length - 1];
  };

  const handleViewDocument = async (documentPath: string) => {
    try {
      // Ensure we use the backend URL for document fetching
      const fullUrl = documentPath.startsWith('http')
        ? documentPath
        : `${API_BASE_URL}${documentPath}`;

      const response = await fetch(fullUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Greška pri preuzimanju dokumenta');

      // Get content type from response or default to PDF
      const contentType = response.headers.get('content-type') || 'application/pdf';
      const blob = await response.blob();

      // Create a new blob with the correct MIME type
      const typedBlob = new Blob([blob], { type: contentType });
      const url = window.URL.createObjectURL(typedBlob);
      window.open(url, '_blank');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri otvaranju dokumenta');
    }
  };

  const totalHours = diaryEntries.reduce((sum, e) => sum + Number(e.hoursWorked || 0), 0);
  const approvedEntries = diaryEntries.filter((e) => e.approved).length;
  const completedGoals = goals.filter((g) => g.completed).length;
  const isInternshipFinished = internship?.status === 'COMPLETED' || internship?.status === 'GRADED';

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      ACTIVE: 'Aktivna',
      PENDING: 'Na čekanju',
      APPROVED: 'Odobrena',
      COMPLETED: 'Završena',
      GRADED: 'Ocijenjeno',
      REJECTED: 'Odbijena',
    };
    return statusMap[status] || status;
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
      <div className="min-h-screen bg-gray-50 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Praksa nije pronađena'}</AlertDescription>
        </Alert>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Natrag
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Natrag
        </Button>

        {/* Internship Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{internship.title}</h1>
          <p className="text-gray-600 mt-1">{internship.company.name}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <span>
              {new Date(internship.startDate).toLocaleDateString('hr-HR')} -{' '}
              {new Date(internship.endDate).toLocaleDateString('hr-HR')}
            </span>
            <Badge className={internship.status === 'GRADED' ? 'bg-green-100 text-green-800' : ''}>
              {getStatusLabel(internship.status)}
            </Badge>
          </div>

          {/* Progress Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{Math.round(totalHours)}h</div>
              <div className="text-sm text-blue-600">od {internship.requiredHours}h sati</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{completedGoals}</div>
              <div className="text-sm text-green-600">
                od {goals.length} {goals.length === 1 ? 'cilja' : 'ciljeva'}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">{approvedEntries}</div>
              <div className="text-sm text-purple-600">
                {approvedEntries === 1 ? 'odobren unos' : 'odobrenih unosa'}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">
                {internship.grade || '-'}
              </div>
              <div className="text-sm text-orange-600">ocjena</div>
            </div>
          </div>

          {/* Download Report Button */}
          <div className="mt-6">
            <Button onClick={handleDownloadReport}>
              <Download className="h-4 w-4 mr-2" /> Preuzmi izvješće
            </Button>
          </div>
        </div>

        {/* Tabs for Goals, Diary, Evaluation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white shadow rounded-lg overflow-hidden">
          <TabsList className="w-full h-auto p-0 bg-gray-50 border-b rounded-none grid grid-cols-4">
            <TabsTrigger
              value="goals"
              className="gap-2 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              <Target className="h-4 w-4" /> Ciljevi ({goals.length})
            </TabsTrigger>
            <TabsTrigger
              value="diary"
              className="gap-2 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              <Calendar className="h-4 w-4" /> Dnevnik ({diaryEntries.length})
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="gap-2 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              <FileText className="h-4 w-4" /> Dokumenti ({documents.length})
            </TabsTrigger>
            <TabsTrigger
              value="evaluation"
              className="gap-2 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              <Award className="h-4 w-4" /> Evaluacija
            </TabsTrigger>
          </TabsList>

          {/* Goals Tab */}
          <TabsContent value="goals" className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Ciljevi prakse</h2>
              {!isInternshipFinished && (
                <Button onClick={() => setShowGoalDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Dodaj cilj
                </Button>
              )}
            </div>

            {isInternshipFinished && (
              <div className="mb-4 px-4 py-3 bg-blue-50 border-l-4 border-blue-400 text-blue-700 text-sm rounded-r">
                Praksa je završena. Pregled ciljeva je dostupan samo za čitanje.
              </div>
            )}

            {goals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nema unesenih ciljeva</h3>
                <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
                  {isInternshipFinished
                    ? 'Ciljevi nisu definirani tijekom trajanja prakse.'
                    : 'Definirajte ciljeve prakse kako biste pratili svoj napredak i imali jasan plan aktivnosti.'}
                </p>
                {!isInternshipFinished && (
                  <Button onClick={() => setShowGoalDialog(true)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" /> Dodaj prvi cilj
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-lg border ${
                      goal.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{goal.title}</span>
                          {goal.completed && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" /> Završeno
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                        {goal.dueDate && (
                          <p className="text-xs text-gray-500 mt-2">
                            Rok: {new Date(goal.dueDate).toLocaleDateString('hr-HR')}
                          </p>
                        )}
                      </div>
                      {!goal.completed && !isInternshipFinished && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCompleteGoal(goal.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Završi
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Diary Tab */}
          <TabsContent value="diary" className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Dnevnik aktivnosti</h2>
              {!isInternshipFinished && (
                <Button onClick={() => {
                  setEditingDiary(null);
                  setDiaryForm({ date: new Date().toISOString().split('T')[0], entry: '', hoursWorked: 0 });
                  setShowDiaryDialog(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" /> Novi unos
                </Button>
              )}
            </div>

            {isInternshipFinished && (
              <div className="mb-4 px-4 py-3 bg-blue-50 border-l-4 border-blue-400 text-blue-700 text-sm rounded-r">
                Praksa je završena. Pregled dnevnika je dostupan samo za čitanje.
              </div>
            )}

            {diaryEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nema unesenih aktivnosti</h3>
                <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
                  {isInternshipFinished
                    ? 'Dnevničke aktivnosti nisu zabilježene tijekom trajanja prakse.'
                    : 'Vodite dnevnik aktivnosti kako biste dokumentirali svoj rad i napredak na praksi.'}
                </p>
                {!isInternshipFinished && (
                  <Button onClick={() => {
                    setEditingDiary(null);
                    setDiaryForm({ date: new Date().toISOString().split('T')[0], entry: '', hoursWorked: 0 });
                    setShowDiaryDialog(true);
                  }} variant="outline">
                    <Plus className="h-4 w-4 mr-2" /> Dodaj prvi unos
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Opis</TableHead>
                    <TableHead>Sati</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {diaryEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {new Date(entry.date).toLocaleDateString('hr-HR')}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate">{entry.entry}</div>
                        {entry.mentorComment && (
                          <div className="text-xs text-blue-600 mt-1">
                            Komentar mentora: {entry.mentorComment}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{entry.hoursWorked || '-'}h</TableCell>
                      <TableCell>
                        {entry.approved ? (
                          <Badge className="bg-green-100 text-green-800">Odobreno</Badge>
                        ) : (
                          <Badge variant="secondary">Na čekanju</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!entry.approved && !isInternshipFinished && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDiary(entry)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteDiary(entry.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Dokumenti prakse</h2>
              <div>
                <input
                  type="file"
                  id="document-upload"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleUploadDocuments}
                  disabled={isUploading}
                />
                <Button
                  onClick={() => document.getElementById('document-upload')?.click()}
                  disabled={isUploading || documents.length >= 10}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Učitavanje...' : 'Učitaj dokumente'}
                </Button>
              </div>
            </div>

            {documents.length >= 10 && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Maksimalan broj dokumenata (10) je dosegnut.
                </AlertDescription>
              </Alert>
            )}

            {documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
                  <File className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nema učitanih dokumenata</h3>
                <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
                  Učitajte dokumente vezane uz vašu praksu (izvješća, certifikati, portfelj, itd.)
                </p>
                <label className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" /> Učitaj dokument
                    </span>
                  </Button>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleUploadDocuments}
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">{getDocumentName(doc)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDocument(doc)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteDocument(doc)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Evaluation Tab */}
          <TabsContent value="evaluation" className="p-6">
            <h2 className="text-lg font-semibold mb-4">Evaluacija mentora</h2>

            {!evaluation ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Evaluacija još nije dostupna</h3>
                <p className="text-sm text-gray-500 text-center max-w-sm">
                  Mentor iz tvrtke će ispuniti evaluaciju nakon završetka prakse.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-700">
                      {evaluation.technicalSkills}/5
                    </div>
                    <div className="text-sm text-blue-600">Tehničke vještine</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {evaluation.communication}/5
                    </div>
                    <div className="text-sm text-green-600">Komunikacija</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-700">
                      {evaluation.workEthic}/5
                    </div>
                    <div className="text-sm text-purple-600">Radna etika</div>
                  </div>
                </div>

                {evaluation.overallPerformance && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Ukupna izvedba</h3>
                    <p className="text-gray-700">{evaluation.overallPerformance}</p>
                  </div>
                )}

                {evaluation.recommendations && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Preporuke</h3>
                    <p className="text-gray-700">{evaluation.recommendations}</p>
                  </div>
                )}

                {internship.grade && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">
                        Konačna ocjena: {internship.grade}/5
                      </span>
                    </div>
                    {internship.gradeComment && (
                      <p className="text-sm text-green-700 mt-2">{internship.gradeComment}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj novi cilj</DialogTitle>
            <DialogDescription>Unesite podatke o cilju prakse</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="goalTitle">Naziv cilja *</Label>
              <Input
                id="goalTitle"
                value={goalForm.title}
                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                placeholder="npr. Naučiti React framework"
              />
            </div>
            <div>
              <Label htmlFor="goalDescription">Opis (opcionalno)</Label>
              <Textarea
                id="goalDescription"
                value={goalForm.description}
                onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                placeholder="Detaljniji opis cilja..."
                className="min-h-[80px]"
              />
            </div>
            <div>
              <Label htmlFor="goalDueDate">Rok (opcionalno)</Label>
              <Input
                id="goalDueDate"
                type="date"
                value={goalForm.dueDate}
                onChange={(e) => setGoalForm({ ...goalForm, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGoalDialog(false)}>
              Odustani
            </Button>
            <Button onClick={handleCreateGoal} disabled={isSubmitting}>
              {isSubmitting ? 'Spremanje...' : 'Dodaj cilj'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Diary Dialog */}
      <Dialog open={showDiaryDialog} onOpenChange={setShowDiaryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDiary ? 'Uredi unos' : 'Novi dnevnički unos'}</DialogTitle>
            <DialogDescription>Zabilježite aktivnosti na praksi</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="diaryDate">Datum *</Label>
              <Input
                id="diaryDate"
                type="date"
                value={diaryForm.date}
                onChange={(e) => setDiaryForm({ ...diaryForm, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="diaryEntry">Opis aktivnosti *</Label>
              <Textarea
                id="diaryEntry"
                value={diaryForm.entry}
                onChange={(e) => setDiaryForm({ ...diaryForm, entry: e.target.value })}
                placeholder="Što ste radili danas..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="diaryHours">Odrađeni sati</Label>
              <Input
                id="diaryHours"
                type="number"
                min="0"
                max="24"
                value={diaryForm.hoursWorked}
                onChange={(e) => setDiaryForm({ ...diaryForm, hoursWorked: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiaryDialog(false)}>
              Odustani
            </Button>
            <Button onClick={handleCreateDiary} disabled={isSubmitting}>
              {isSubmitting ? 'Spremanje...' : editingDiary ? 'Spremi promjene' : 'Dodaj unos'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
