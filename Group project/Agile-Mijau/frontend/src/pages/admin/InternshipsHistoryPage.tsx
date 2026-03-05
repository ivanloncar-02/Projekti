import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { internshipsService, InternshipStatus, type Internship } from '@/services/internshipsService';

type StatusFilter = 'ALL' | InternshipStatus;

const InternshipsHistoryPage = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchInternships();
  }, [statusFilter, currentPage]);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        status: statusFilter !== 'ALL' ? (statusFilter as InternshipStatus) : undefined,
        sortBy: 'createdAt',
        order: 'DESC' as const,
      };

      const response = await internshipsService.getAll(params);
      setInternships(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Error fetching internships:', error);
      toast.error('Greška pri učitavanju praksi');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: InternshipStatus) => {
    const styles: Record<InternshipStatus, string> = {
      [InternshipStatus.DRAFT]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [InternshipStatus.PUBLISHED]: 'bg-blue-100 text-blue-800 border-blue-200',
      [InternshipStatus.ACTIVE]: 'bg-green-100 text-green-800 border-green-200',
      [InternshipStatus.APPROVED]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      [InternshipStatus.COMPLETED]: 'bg-purple-100 text-purple-800 border-purple-200',
      [InternshipStatus.GRADED]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      [InternshipStatus.ARCHIVED]: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    const labels: Record<InternshipStatus, string> = {
      [InternshipStatus.DRAFT]: 'Nacrt',
      [InternshipStatus.PUBLISHED]: 'Objavljeno',
      [InternshipStatus.ACTIVE]: 'Aktivno',
      [InternshipStatus.APPROVED]: 'Odobreno',
      [InternshipStatus.COMPLETED]: 'Završeno',
      [InternshipStatus.GRADED]: 'Ocijenjeno',
      [InternshipStatus.ARCHIVED]: 'Arhivirano',
    };

    return (
      <span className={cn('px-3 py-1 rounded-full text-xs font-medium border', styles[status])}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Povijest praksi</h1>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setCurrentPage(1); // Reset to first page when filter changes
            }}
            className="px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">Svi statusi</option>
            <option value={InternshipStatus.DRAFT}>Nacrt</option>
            <option value={InternshipStatus.PUBLISHED}>Objavljeno</option>
            <option value={InternshipStatus.ACTIVE}>Aktivno</option>
            <option value={InternshipStatus.APPROVED}>Odobreno</option>
            <option value={InternshipStatus.COMPLETED}>Završeno</option>
            <option value={InternshipStatus.GRADED}>Ocijenjeno</option>
            <option value={InternshipStatus.ARCHIVED}>Arhivirano</option>
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="text-left p-4 font-semibold">Tvrtka</th>
              <th className="text-left p-4 font-semibold">Pozicija</th>
              <th className="text-left p-4 font-semibold">Datum kreiranja</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold">Prijave</th>
              <th className="text-left p-4 font-semibold">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {internships.map((internship) => (
              <tr
                key={internship.id}
                className={cn(
                  'border-b border-border hover:bg-muted/50 transition-colors',
                  internship.status === InternshipStatus.ARCHIVED && 'text-muted-foreground'
                )}
              >
                <td className="p-4">{internship.company?.name || 'N/A'}</td>
                <td className="p-4 font-medium">{internship.title}</td>
                <td className="p-4">{new Date(internship.createdAt).toLocaleDateString()}</td>
                <td className="p-4">{getStatusBadge(internship.status)}</td>
                <td className="p-4 text-center">{internship.applicationsCount || 0}</td>
                <td className="p-4">
                  <Link to={`/admin/internships/${internship.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      Pregledaj
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {internships.length === 0 && !loading && (
          <div className="p-12 text-center text-muted-foreground">
            Nema praksi za odabrani status
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Prethodna
          </button>
          <span className="px-4 py-2 text-sm text-muted-foreground">
            Stranica {currentPage} od {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Sljedeća
          </button>
        </div>
      )}
    </div>
  );
};

export default InternshipsHistoryPage;