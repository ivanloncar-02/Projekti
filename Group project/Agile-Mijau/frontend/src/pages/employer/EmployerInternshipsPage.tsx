import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  AlertCircle,
  Plus,
  Edit,
  Users,
  Archive,
  ArchiveRestore,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Internship {
  id: string;
  title: string;
  location: string;
  duration: number;
  status: string;
  createdAt: string;
  applicationsCount?: number;
}

export const EmployerInternshipsPage: React.FC = () => {
  const navigate = useNavigate();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiRequest<{ items: Internship[]; total: number }>('/api/internships/my', {
        method: 'GET',
      });
      setInternships(response.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju praksi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!selectedInternship) return;

    setIsArchiving(true);
    try {
      await apiRequest(`/api/internships/${selectedInternship.id}/archive`, {
        method: 'PATCH',
      });

      toast.success(
        selectedInternship.status === 'ARCHIVED'
          ? 'Praksa je vraćena iz arhive'
          : 'Praksa je arhivirana'
      );

      fetchInternships();
    } catch (err) {
      toast.error('Greška pri arhiviranju prakse');
    } finally {
      setIsArchiving(false);
      setArchiveDialogOpen(false);
      setSelectedInternship(null);
    }
  };

  const openArchiveDialog = (internship: Internship) => {
    setSelectedInternship(internship);
    setArchiveDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      ACTIVE: { label: 'Aktivna', variant: 'default' },
      PUBLISHED: { label: 'Objavljena', variant: 'default' },
      DRAFT: { label: 'Nacrt', variant: 'secondary' },
      ARCHIVED: { label: 'Arhivirana', variant: 'outline' },
      COMPLETED: { label: 'Završena', variant: 'secondary' },
    };

    const config = statusMap[status] || { label: status, variant: 'outline' as const };

    return <Badge variant={config.variant}>{config.label}</Badge>;
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Moje prakse</h1>
            <Button onClick={() => navigate('/employer/internships/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Nova praksa
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {internships.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nema praksi</h3>
              <p className="mt-1 text-sm text-gray-500">
                Započnite kreiranjem nove ponude za praksu.
              </p>
              <div className="mt-6">
                <Button onClick={() => navigate('/employer/internships/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Kreiraj prvu praksu
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naziv</TableHead>
                    <TableHead>Lokacija</TableHead>
                    <TableHead>Trajanje</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prijave</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internships.map((internship) => (
                    <TableRow key={internship.id}>
                      <TableCell className="font-medium">{internship.title}</TableCell>
                      <TableCell>{internship.location}</TableCell>
                      <TableCell>{internship.duration} mj.</TableCell>
                      <TableCell>{getStatusBadge(internship.status)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {internship.applicationsCount || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(internship.createdAt).toLocaleDateString('hr-HR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/employer/internships/${internship.id}/edit`)}
                                    disabled={internship.status === 'ARCHIVED' || internship.status === 'ACTIVE'}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {internship.status === 'ACTIVE'
                                  ? 'Odobrene prakse nije moguće uređivati'
                                  : internship.status === 'ARCHIVED'
                                    ? 'Arhivirane prakse nije moguće uređivati'
                                    : 'Uredi praksu'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/employer/internships/${internship.id}/applicants`)}
                                >
                                  <Users className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Pregledaj prijave</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant={internship.status === 'ARCHIVED' ? 'default' : 'outline'}
                                  onClick={() => openArchiveDialog(internship)}
                                >
                                  {internship.status === 'ARCHIVED' ? (
                                    <ArchiveRestore className="h-4 w-4" />
                                  ) : (
                                    <Archive className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {internship.status === 'ARCHIVED' ? 'Vrati iz arhive' : 'Arhiviraj'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Archive Confirmation Dialog */}
      <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedInternship?.status === 'ARCHIVED'
                ? 'Vrati iz arhive'
                : 'Arhiviraj praksu'}
            </DialogTitle>
            <DialogDescription>
              {selectedInternship?.status === 'ARCHIVED'
                ? `Jeste li sigurni da želite vratiti praksu "${selectedInternship?.title}" iz arhive? Praksa će ponovno biti vidljiva studentima.`
                : `Jeste li sigurni da želite arhivirati praksu "${selectedInternship?.title}"? Arhivirana praksa neće biti vidljiva studentima.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setArchiveDialogOpen(false)}
              disabled={isArchiving}
            >
              Odustani
            </Button>
            <Button
              variant={selectedInternship?.status === 'ARCHIVED' ? 'default' : 'destructive'}
              onClick={handleArchive}
              disabled={isArchiving}
            >
              {isArchiving
                ? 'Učitavanje...'
                : selectedInternship?.status === 'ARCHIVED'
                  ? 'Vrati iz arhive'
                  : 'Arhiviraj'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployerInternshipsPage;
