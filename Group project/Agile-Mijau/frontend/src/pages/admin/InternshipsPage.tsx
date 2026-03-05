import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { AlertCircle, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { internshipsService, InternshipStatus, type Internship, type InternshipsFilterParams } from '../../services/internshipsService';
import { companyService } from '../../services/companyService';

type InternshipStatusType = typeof InternshipStatus[keyof typeof InternshipStatus];
type StatusFilter = InternshipStatusType | 'ALL';

interface Company {
  id: string;
  name: string;
}

const getStatusBadgeVariant = (status: InternshipStatusType) => {
  switch (status) {
    case InternshipStatus.DRAFT:
      return 'secondary';
    case InternshipStatus.PUBLISHED:
      return 'default';
    case InternshipStatus.ACTIVE:
      return 'default';
    case InternshipStatus.APPROVED:
      return 'default';
    case InternshipStatus.COMPLETED:
      return 'secondary';
    case InternshipStatus.GRADED:
      return 'secondary';
    case InternshipStatus.ARCHIVED:
      return 'destructive';
    default:
      return 'secondary';
  }
};

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

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

export const InternshipsPage = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [yearFilter, setYearFilter] = useState<string>('');
  const [studentFilter, setStudentFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchInternships();
  }, [currentPage, yearFilter, studentFilter, companyFilter, statusFilter]);

  const fetchCompanies = async () => {
    try {
      const response = await companyService.getAll({ limit: 100 });
      setCompanies(response.data || []);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchInternships = async () => {
    setIsLoading(true);
    setError('');

    try {
      const params: InternshipsFilterParams = {
        page: currentPage,
        limit: pageSize,
        sortBy: 'createdAt',
        order: 'DESC',
      };

      if (yearFilter) params.year = parseInt(yearFilter);
      if (studentFilter.trim()) params.student = studentFilter.trim();
      if (companyFilter) params.company = companyFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const response = await internshipsService.getAll(params);
      setInternships(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotal(response.meta?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju praksi');
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setYearFilter('');
    setStudentFilter('');
    setCompanyFilter('');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  const hasActiveFilters = yearFilter || studentFilter || companyFilter || statusFilter !== 'ALL';

  const getStudentName = (internship: Internship) => {
    if (internship.applications && internship.applications.length > 0) {
      const acceptedApp = internship.applications.find((app: any) =>
        app.status === 'ACCEPTED' || app.status === 'APPROVED'
      );
      if (acceptedApp?.student?.user) {
        return `${acceptedApp.student.user.firstName} ${acceptedApp.student.user.lastName}`;
      }
    }
    return '-';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Prakse</h1>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Godina
            </label>
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sve godine</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Student Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Ime ili prezime..."
                value={studentFilter}
                onChange={(e) => {
                  setStudentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="pr-8"
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Company Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Poduzeće
            </label>
            <select
              value={companyFilter}
              onChange={(e) => {
                setCompanyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sva poduzeća</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setCurrentPage(1);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Svi statusi</option>
              <option value="DRAFT">Nacrt</option>
              <option value="PUBLISHED">Objavljeno</option>
              <option value="ACTIVE">Aktivno</option>
              <option value="APPROVED">Odobreno</option>
              <option value="COMPLETED">Završeno</option>
              <option value="GRADED">Ocijenjeno</option>
              <option value="ARCHIVED">Arhivirano</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Očisti filtere
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Učitavanje...</div>
        </div>
      ) : internships.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500 text-lg mb-2">
            {hasActiveFilters ? 'Nema praksi koje odgovaraju filterima' : 'Nema dostupnih praksi'}
          </p>
          <p className="text-gray-400 text-sm">
            {hasActiveFilters
              ? 'Pokušajte promijeniti kriterije pretraživanja.'
              : 'Prakse će se prikazati kada ih poslodavci objave.'}
          </p>
        </div>
      ) : (
        <>
          {/* Results info */}
          <div className="text-sm text-gray-600 mb-4">
            Prikazano {internships.length} od {total} praksi
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Naziv
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Poduzeće
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum početka
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
                  {internships.map((internship) => (
                    <tr key={internship.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {internship.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {internship.company?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getStudentName(internship)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {internship.startDate
                            ? new Date(internship.startDate).toLocaleDateString('hr-HR')
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(internship.status)}>
                          {getStatusLabel(internship.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/admin/internships/${internship.id}`}>
                          <Button variant="ghost" size="sm">
                            Pregled
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Stranica {currentPage} od {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prethodna
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sljedeća
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
