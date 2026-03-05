import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api';
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
import { AlertCircle, ArrowLeft, CheckCircle, XCircle, Mail, Calendar, FileText, ExternalLink, Eye } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const ApplicationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

type ApplicationStatusType = typeof ApplicationStatus[keyof typeof ApplicationStatus];

interface Application {
  id: string;
  status: ApplicationStatusType;
  coverLetter: string | null;
  cvPath: string | null;
  documentsPaths?: string[] | null;
  appliedAt: string;
  student: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    studentNumber: string;
    major: string;
    academicYear: string;
  };
}

interface Internship {
  id: string;
  title: string;
  company: {
    id: string;
    name: string;
  };
}

const getStatusBadgeVariant = (status: ApplicationStatusType) => {
  switch (status) {
    case ApplicationStatus.PENDING:
      return 'secondary';
    case ApplicationStatus.APPROVED:
      return 'default';
    case ApplicationStatus.REJECTED:
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: ApplicationStatusType) => {
  switch (status) {
    case ApplicationStatus.PENDING:
      return 'Na čekanju';
    case ApplicationStatus.APPROVED:
      return 'Prihvaćeno';
    case ApplicationStatus.REJECTED:
      return 'Odbijeno';
    default:
      return status;
  }
};

const openDocumentWithAuth = async (documentPath: string) => {
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
    console.error('Error opening document:', err);
    toast.error('Greška pri otvaranju dokumenta');
  }
};

export const InternshipApplicantsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [internship, setInternship] = useState<Internship | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<{ name: string; text: string } | null>(null);

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
      const internshipData = await apiRequest<Internship>(`/api/internships/${id}`, {
        method: 'GET',
      });
      setInternship(internshipData);

      // Fetch applications
      const applicationsData = await apiRequest<Application[]>(
        `/api/applications/internship/${id}`,
        {
          method: 'GET',
        }
      );
      setApplications(applicationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju prijava');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    setProcessingId(applicationId);

    try {
      await apiRequest(`/api/applications/${applicationId}/approve`, {
        method: 'PATCH',
      });

      toast.success('Prijava prihvaćena', {
        description: 'Student je obaviješten putem emaila.',
      });

      // Refresh data
      await fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri prihvaćanju prijave';
      toast.error('Greška', {
        description: message,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    setProcessingId(applicationId);

    try {
      await apiRequest(`/api/applications/${applicationId}/reject`, {
        method: 'PATCH',
      });

      toast.success('Prijava odbijena', {
        description: 'Student je obaviješten putem emaila.',
      });

      // Refresh data
      await fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri odbijanju prijave';
      toast.error('Greška', {
        description: message,
      });
    } finally {
      setProcessingId(null);
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
          onClick={() => navigate('/employer/dashboard')}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Natrag
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/employer/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Natrag
        </Button>

        <div>
          <h1 className="text-3xl font-bold mb-2">Prijave kandidata</h1>
          <p className="text-gray-600">{internship.title}</p>
          <p className="text-sm text-gray-500">{internship.company.name}</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500 text-lg mb-2">Nema prijava</p>
          <p className="text-gray-400 text-sm">
            Prijave će se prikazati kada se studenti prijave na ovu praksu.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum prijave
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dokumenti
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((application) => {
                  const isFinalized = application.status !== ApplicationStatus.PENDING;
                  return (
                  <tr
                    key={application.id}
                    className={`hover:bg-gray-50 ${isFinalized ? 'bg-gray-50/50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {application.student.user.firstName}{' '}
                          {application.student.user.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {application.student.studentNumber} • {application.student.major}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {application.student.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(application.appliedAt).toLocaleDateString('hr-HR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        {application.coverLetter && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedCoverLetter({
                                    name: `${application.student.user.firstName} ${application.student.user.lastName}`,
                                    text: application.coverLetter!
                                  })}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Motivacija
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Pregledaj motivacijsko pismo</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {application.cvPath && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDocumentWithAuth(application.cvPath!)}
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  CV
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Otvori životopis</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {application.documentsPaths && application.documentsPaths.length > 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => application.documentsPaths?.forEach(path => openDocumentWithAuth(path))}
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  +{application.documentsPaths.length}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Otvori dodatne dokumente</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {!application.coverLetter && !application.cvPath && (!application.documentsPaths || application.documentsPaths.length === 0) && (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(application.status)}>
                        {getStatusLabel(application.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {application.status === ApplicationStatus.PENDING && (
                        <div className="flex items-center justify-end gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                disabled={processingId === application.id}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Prihvati
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Prihvati prijavu?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Jeste li sigurni da želite prihvatiti prijavu studenta{' '}
                                  {application.student.user.firstName}{' '}
                                  {application.student.user.lastName}? Student će biti
                                  obaviješten putem emaila.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Odustani</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleApprove(application.id)}
                                >
                                  Potvrdi
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={processingId === application.id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Odbij
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Odbij prijavu?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Jeste li sigurni da želite odbiti prijavu studenta{' '}
                                  {application.student.user.firstName}{' '}
                                  {application.student.user.lastName}? Student će biti
                                  obaviješten putem emaila.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Odustani</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleReject(application.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Potvrdi
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                      {application.status !== ApplicationStatus.PENDING && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-gray-400 cursor-help">Obrađeno</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Prijava je već obrađena</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cover Letter Dialog */}
      <Dialog open={!!selectedCoverLetter} onOpenChange={() => setSelectedCoverLetter(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Motivacijsko pismo</DialogTitle>
            <DialogDescription>
              {selectedCoverLetter?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {selectedCoverLetter?.text}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
