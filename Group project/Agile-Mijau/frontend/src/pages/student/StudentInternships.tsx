import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { croatianTranslations } from '../../translations/croatian';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, MapPin, Clock, Calendar, Filter, X } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface Internship {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: number; // months
  requiredHours: number;
  salary: number | null;
  requiredSkills: string[];
  startDate: string;
  endDate: string;
  status: string;
  company: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface Application {
  id: string;
  internshipId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const StudentInternships: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [internships, setInternships] = useState<Internship[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter states
  const [selectedLocation, setSelectedLocation] = useState<string>(searchParams.get('location') || '');
  const [selectedCompany, setSelectedCompany] = useState<string>(searchParams.get('company') || '');
  const [selectedDuration, setSelectedDuration] = useState<string>(searchParams.get('duration') || '');
  const [selectedFieldOfStudy, setSelectedFieldOfStudy] = useState<string>(searchParams.get('field') || '');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Unique values for filters
  const [locations, setLocations] = useState<string[]>([]);
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [fieldsOfStudy] = useState<string[]>([
    'Računarstvo',
    'Elektrotehnički fakultet',
    'Strojarstvo',
    'Građevinarstvo',
    'Ekonomija',
    'Menadžment',
    'Marketing',
    'Dizajn',
  ]);

  useEffect(() => {
    fetchInternships();
    if (user) {
      fetchMyApplications();
    }
  }, [user]);

  const fetchMyApplications = async () => {
    try {
      const response = await apiRequest<Application[]>('/api/applications/me', {
        method: 'GET',
      });
      setMyApplications(response || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const fetchInternships = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Fetch only PUBLISHED/ACTIVE internships
      const response = await apiRequest<{ items: Internship[] }>('/api/internships/public', {
        method: 'GET',
      });

      // Sort by createdAt DESC (newest first)
      const sortedInternships = (response.items || []).sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setInternships(sortedInternships);

      // Extract unique locations and companies for filters
      const uniqueLocations = Array.from(new Set(sortedInternships.map((i) => i.location)));
      const uniqueCompanies = Array.from(
        new Map(sortedInternships.map((i) => [i.company.id, i.company])).values()
      );

      setLocations(uniqueLocations);
      setCompanies(uniqueCompanies);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju praksi');
    } finally {
      setIsLoading(false);
    }
  };

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedLocation) params.set('location', selectedLocation);
    if (selectedCompany) params.set('company', selectedCompany);
    if (selectedDuration) params.set('duration', selectedDuration);
    if (selectedFieldOfStudy) params.set('field', selectedFieldOfStudy);

    setSearchParams(params, { replace: true });
  }, [selectedLocation, selectedCompany, selectedDuration, selectedFieldOfStudy]);

  // Get IDs of internships where student has an approved application
  const approvedInternshipIds = myApplications
    .filter(app => app.status === 'APPROVED')
    .map(app => app.internshipId);

  // Apply all filters
  const filteredInternships = internships.filter((internship) => {
    // Exclude internships where student already has an approved application
    if (approvedInternshipIds.includes(internship.id)) {
      return false;
    }

    // Text search filter
    const matchesSearch =
      internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.location.toLowerCase().includes(searchTerm.toLowerCase());

    // Location filter
    const matchesLocation = !selectedLocation || internship.location === selectedLocation;

    // Company filter
    const matchesCompany = !selectedCompany || internship.company.id === selectedCompany;

    // Duration filter
    const matchesDuration =
      !selectedDuration ||
      (selectedDuration === 'short' && internship.duration <= 3) ||
      (selectedDuration === 'long' && internship.duration > 3);

    // Field of study filter (based on required skills)
    const matchesField =
      !selectedFieldOfStudy ||
      internship.requiredSkills.some((skill) =>
        skill.toLowerCase().includes(selectedFieldOfStudy.toLowerCase())
      );

    return matchesSearch && matchesLocation && matchesCompany && matchesDuration && matchesField;
  });

  // Count active filters
  const activeFiltersCount = [
    selectedLocation,
    selectedCompany,
    selectedDuration,
    selectedFieldOfStudy,
  ].filter(Boolean).length;

  // Pagination calculations
  const totalPages = Math.ceil(filteredInternships.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInternships = filteredInternships.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLocation, selectedCompany, selectedDuration, selectedFieldOfStudy]);

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
            {croatianTranslations.student.internships.title}
          </h1>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search Bar and Items Per Page */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={croatianTranslations.student.internships.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 po stranici</SelectItem>
                  <SelectItem value="20">20 po stranici</SelectItem>
                  <SelectItem value="50">50 po stranici</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">Filtriraj</h3>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount} aktivno
                  </Badge>
                )}
              </div>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedLocation('');
                    setSelectedCompany('');
                    setSelectedDuration('');
                    setSelectedFieldOfStudy('');
                    setSearchParams({}, { replace: true });
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Očisti filtere
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokacija
                </label>
                <Select value={selectedLocation || 'all'} onValueChange={(v) => setSelectedLocation(v === 'all' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sve lokacije" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Sve lokacije</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Company Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poduzeće
                </label>
                <Select value={selectedCompany || 'all'} onValueChange={(v) => setSelectedCompany(v === 'all' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sva poduzeća" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Sva poduzeća</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trajanje
                </label>
                <Select value={selectedDuration || 'all'} onValueChange={(v) => setSelectedDuration(v === 'all' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sve duljine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Sve duljine</SelectItem>
                    <SelectItem value="short">Kratkoročno (≤3 mjeseca)</SelectItem>
                    <SelectItem value="long">Dugoročno ({'>'}3 mjeseca)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Field of Study Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Područje studija
                </label>
                <Select value={selectedFieldOfStudy || 'all'} onValueChange={(v) => setSelectedFieldOfStudy(v === 'all' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sva područja" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Sva područja</SelectItem>
                    {fieldsOfStudy.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {filteredInternships.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-gray-500 text-lg mb-2">
                {searchTerm ? 'Nema rezultata pretrage' : 'Nema dostupnih praksi'}
              </p>
              <p className="text-gray-400 text-sm">
                {searchTerm
                  ? 'Pokušajte s drugim pojmom pretrage'
                  : 'Nove prakse će se prikazati kada ih poslodavci objave'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedInternships.map((internship) => (
                <div
                  key={internship.id}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 flex-1 pr-2">
                        {internship.title}
                      </h3>
                      {internship.salary && (
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                          Plaćena
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 font-medium mb-4">
                      {internship.company.name}
                    </p>

                    <div className="space-y-2 mb-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {internship.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {internship.duration} {internship.duration === 1 ? 'mjesec' : 'mjeseca'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(internship.startDate).toLocaleDateString('hr-HR')}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => navigate(`/student/internships/${internship.id}/apply`)}
                        className="flex-1"
                        size="sm"
                      >
                        {croatianTranslations.student.internships.apply}
                      </Button>
                      <Button
                        onClick={() => navigate(`/student/internships/${internship.id}`)}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        {croatianTranslations.student.internships.viewDetails}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {getPageNumbers().map((page, index) => (
                    <PaginationItem key={page === 'ellipsis' ? `ellipsis-${index}` : `page-${page}`}>
                      {page === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => handlePageChange(page as number)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={
                        currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
