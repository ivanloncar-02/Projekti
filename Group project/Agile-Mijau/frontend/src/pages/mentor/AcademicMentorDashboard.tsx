import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, BookOpen, GraduationCap, Users, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Student {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    profilePhoto?: string;
  };
}

interface Internship {
  id: string;
  title: string;
  student: Student;
  company: {
    name: string;
  };
  startDate: string;
  endDate: string;
  status: string;
  grade?: number;
  gradeComment?: string;
  companyEvaluationCompleted?: boolean;
  totalDiaryEntries?: number;
  approvedDiaryEntries?: number;
}

interface Stats {
  totalInternships: number;
  pendingGrades: number;
  completedGrades: number;
}

export const AcademicMentorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalInternships: 0,
    pendingGrades: 0,
    completedGrades: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Fetch internships assigned to this academic mentor
      const response = await apiRequest<{ items: Internship[] }>('/api/mentors/academic/students', {
        method: 'GET',
      });

      const items = response.items || [];
      setInternships(items);

      // Calculate stats
      const totalInternships = items.length;
      const completedGrades = items.filter((i) => i.grade !== null && i.grade !== undefined).length;
      const pendingGrades = totalInternships - completedGrades;

      setStats({
        totalInternships,
        pendingGrades,
        completedGrades,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Učitavanje...</div>
      </div>
    );
  }

  const renderStudentCards = () => {
    if (internships.length === 0) {
      return (
        <div className="col-span-full px-6 py-12 text-center bg-white rounded-lg shadow">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nema studenata</h3>
          <p className="mt-1 text-sm text-gray-500">
            Trenutno nemate dodijeljenih studenata za praćenje.
          </p>
        </div>
      );
    }

    return internships.map((internship) => {
      const progressPercentage = internship.totalDiaryEntries
        ? Math.round((internship.approvedDiaryEntries || 0) / internship.totalDiaryEntries * 100)
        : 0;
      const progressText = `${internship.approvedDiaryEntries || 0}/${internship.totalDiaryEntries || 0} dnevničkih unosa odobreno`;

      return (
        <Card key={internship.id} className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                {internship.student.user.profilePhoto ? (
                  <img
                    src={internship.student.user.profilePhoto}
                    alt={`${internship.student.user.firstName} ${internship.student.user.lastName}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {internship.student.user.firstName} {internship.student.user.lastName}
                </h3>
                <p className="text-sm text-gray-500 truncate">{internship.student.user.email}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Tvrtka</p>
              <p className="text-sm text-gray-900">{internship.company.name}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Status</p>
              {getStatusBadge(internship.status)}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Napredak</p>
              <Progress value={progressPercentage} className="h-2 mb-1" />
              <p className="text-xs text-gray-600">{progressText}</p>
            </div>
          </CardContent>

          <CardFooter className="bg-gray-50 pt-4">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/mentor/academic/internships/${internship.id}`)}
            >
              Pregled napretka
            </Button>
          </CardFooter>
        </Card>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Dobrodošli, {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-gray-600 mt-1">Akademski mentor - Pregled studenata na praksi</p>
          </div>

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
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Ocjena na čekanju
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {stats.pendingGrades}
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
                    <GraduationCap className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Ocijenjeno
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {stats.completedGrades}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Moji studenti</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                onClick={() => setViewMode('cards')}
              >
                Kartice
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'table' ? 'default' : 'outline'}
                onClick={() => setViewMode('table')}
              >
                Tablica
              </Button>
            </div>
          </div>

          {/* Student Cards Grid */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderStudentCards()}
            </div>
          )}

          {/* Internships Table */}
          {viewMode === 'table' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Prakse studenata</h2>
              </div>

              {internships.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nema praksi</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Trenutno nema dodijeljenih praksi za ocjenjivanje.
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
                        <TableHead>Ocjena</TableHead>
                        <TableHead>Akcije</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {internships.map((internship) => (
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
                            {internship.grade !== null && internship.grade !== undefined ? (
                              <div>
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  Ocjena: {internship.grade}
                                </Badge>
                              </div>
                            ) : (
                              <Badge variant="secondary">Bez ocjene</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/mentor/academic/internships/${internship.id}`)}
                            >
                              Detalji
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
