import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, BookOpen, CheckCircle, Clock, Users } from 'lucide-react';

interface DiaryEntry {
  id: string;
  date: string;
  description: string;
  approved: boolean;
  mentorComment?: string;
}

interface Internship {
  id: string;
  title: string;
  student: {
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
  diaryEntries?: DiaryEntry[];
  evaluationCompleted?: boolean;
}

interface Stats {
  totalInternships: number;
  pendingDiaries: number;
  approvedDiaries: number;
}

export const CompanyMentorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalInternships: 0,
    pendingDiaries: 0,
    approvedDiaries: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Fetch internships assigned to this company mentor
      const response = await apiRequest<{ items: Internship[] }>('/api/mentors/company/students', {
        method: 'GET',
      });

      const items = response.items || [];
      setInternships(items);

      // Calculate stats
      const totalInternships = items.length;
      let pendingDiaries = 0;
      let approvedDiaries = 0;

      items.forEach((internship) => {
        internship.diaryEntries?.forEach((entry) => {
          if (entry.approved) {
            approvedDiaries++;
          } else {
            pendingDiaries++;
          }
        });
      });

      setStats({
        totalInternships,
        pendingDiaries,
        approvedDiaries,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju praksi');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      ACTIVE: { label: 'Aktivna', variant: 'default' },
      PENDING: { label: 'Na čekanju', variant: 'secondary' },
      APPROVED: { label: 'Odobrena', variant: 'default' },
      COMPLETED: { label: 'Završena', variant: 'outline' },
      GRADED: { label: 'Ocijenjeno', variant: 'default' },
      REJECTED: { label: 'Odbijena', variant: 'destructive' },
    };

    const config = statusMap[status] || { label: status, variant: 'outline' as const };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getPendingDiariesCount = (internship: Internship): number => {
    return internship.diaryEntries?.filter((entry) => !entry.approved).length || 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Mentor u tvrtki - Nadzorna ploča
          </h1>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Ukupno praksi
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {stats.totalInternships}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Dnevnici za pregled
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {stats.pendingDiaries}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Odobreni unosi
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {stats.approvedDiaries}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Internships Table */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Prakse studenata</h2>
            </div>

            {internships.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nema praksi</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Trenutno nema dodijeljenih praksi za mentorstvo.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Pozicija</TableHead>
                      <TableHead>Tvrtka</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dnevnici</TableHead>
                      <TableHead>Akcije</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {internships.map((internship) => {
                      const pendingCount = getPendingDiariesCount(internship);

                      return (
                        <TableRow key={internship.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">
                                {internship.student.user.firstName} {internship.student.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {internship.student.user.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{internship.title}</TableCell>
                          <TableCell>{internship.company.name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{new Date(internship.startDate).toLocaleDateString('hr-HR')}</div>
                              <div className="text-gray-500">
                                {new Date(internship.endDate).toLocaleDateString('hr-HR')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(internship.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant={pendingCount > 0 ? 'destructive' : 'secondary'}>
                                {pendingCount} za odobriti
                              </Badge>
                              {internship.diaryEntries && internship.diaryEntries.length > 0 && (
                                <span className="text-xs text-gray-500">
                                  {internship.diaryEntries.length} ukupno
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/mentor/company/internships/${internship.id}`)}
                            >
                              Detalji
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
