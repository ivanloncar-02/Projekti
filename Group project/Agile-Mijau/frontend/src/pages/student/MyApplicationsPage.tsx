import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Calendar, Briefcase } from 'lucide-react';
import { apiRequest } from '@/services/api';

// Application status enum
const ApplicationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

const getStatusLabel = (status: ApplicationStatus): string => {
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

interface Application {
  id: string;
  internshipId: string;
  companyName?: string;
  companyLogo?: string;
  title?: string;
  appliedAt: string;
  status: ApplicationStatus;
  location?: string;
  duration?: number;
  internship?: {
    id: string;
    title: string;
    location: string;
    duration: number;
    company: {
      id: string;
      name: string;
      logo?: string;
    };
  };
}

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest<Application[]>('/api/applications/me', {
        method: 'GET',
      });
      setApplications(response);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case ApplicationStatus.APPROVED:
        return 'bg-green-100 text-green-800 border-green-300';
      case ApplicationStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filterApplications = (status: string) => {
    if (status === 'all') return applications;
    return applications.filter(app => app.status.toLowerCase() === status);
  };

  const sortedApplications = (apps: Application[]) => {
    return [...apps].sort((a, b) =>
      new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hr-HR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderApplicationCard = (app: Application) => {
    const isPending = app.status === ApplicationStatus.PENDING;
    const isApproved = app.status === ApplicationStatus.APPROVED;
    const isRejected = app.status === ApplicationStatus.REJECTED;

    return (
      <Card
        key={app.id}
        className={`${isRejected ? 'opacity-60' : ''} hover:shadow-lg transition-shadow`}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{app.internship?.company?.name || 'Nepoznato poduzeće'}</CardTitle>
                <CardDescription className="mt-1">{app.internship?.title || 'Nepoznata praksa'}</CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(app.status)}>
              {getStatusLabel(app.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            Prijavljeno {formatDate(app.appliedAt)}
          </div>

          {app.internship && (
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>📍 {app.internship.location}</span>
              <span>⏱️ {app.internship.duration} mjeseci</span>
            </div>
          )}

          {isPending && (
            <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-md">
              Vaša prijava je u obradi. Obavijestit ćemo vas kada poduzeće donese odluku.
            </p>
          )}

          {isApproved && (
            <div className="flex gap-2">
              <Button
                onClick={() => navigate(`/student/internships/${app.internshipId}`)}
                variant="outline"
              >
                Pogledaj detalje
              </Button>
              <Button
                onClick={() => navigate(`/student/my-internship/${app.internshipId}`)}
                className="flex-1"
              >
                Upravljaj praksom
              </Button>
            </div>
          )}

          {isRejected && (
            <p className="text-sm text-red-700 bg-red-50 p-3 rounded-md">
              Nažalost, vaša prijava ovaj put nije bila uspješna. Nastavite se prijavljivati na druge prilike!
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <Card className="col-span-full">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Nema prijava</h3>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          Još se niste prijavili na praksu. Istražite dostupne prilike!
        </p>
        <Button onClick={() => navigate('/student/internships')}>
          Pregledaj prakse
        </Button>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Učitavanje prijava...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Moje prijave</h1>
        <p className="text-muted-foreground">
          Pratite status svojih prijava na praksu
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="all">
            Sve ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Na čekanju ({filterApplications('pending').length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Prihvaćeno ({filterApplications('approved').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Odbijeno ({filterApplications('rejected').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {applications.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedApplications(applications).map(renderApplicationCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filterApplications('pending').length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nema prijava na čekanju
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedApplications(filterApplications('pending')).map(renderApplicationCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {filterApplications('approved').length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nema prihvaćenih prijava
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedApplications(filterApplications('approved')).map(renderApplicationCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {filterApplications('rejected').length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nema odbijenih prijava
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedApplications(filterApplications('rejected')).map(renderApplicationCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
