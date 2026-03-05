import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, MapPin, Clock, Calendar, DollarSign, Building, Send, CheckCircle } from 'lucide-react';

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
  status: string;
  company: {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string | null;
  };
  createdAt: string;
}

export const InternshipDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [internship, setInternship] = useState<InternshipDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInternship();
      if (isAuthenticated && user?.role === UserRole.STUDENT) {
        checkApplicationStatus();
      }
    }
  }, [id, isAuthenticated, user]);

  const fetchInternship = async () => {
    if (!id) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await apiRequest<InternshipDetail>(`/api/internships/${id}`, {
        method: 'GET',
      });
      setInternship(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju prakse');
    } finally {
      setIsLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    if (!id) return;

    setCheckingApplication(true);
    try {
      const response = await apiRequest<{ hasApplied: boolean }>(
        `/api/applications/check/${id}`,
        { method: 'GET' }
      );
      setHasApplied(response.hasApplied);
    } catch (err) {
      console.error('Error checking application status:', err);
      setHasApplied(false);
    } finally {
      setCheckingApplication(false);
    }
  };

  const handleApplyClick = () => {
    navigate(`/student/internships/${id}/apply`);
  };

  const handleLoginClick = () => {
    navigate('/login', { state: { from: `/student/internships/${id}` } });
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
          onClick={() => navigate('/student/internships')}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Natrag na listu
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Button
            variant="ghost"
            onClick={() => navigate('/student/internships')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Natrag na listu
          </Button>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{internship.title}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <Building className="h-5 w-5" />
                <span className="text-xl">{internship.company.name}</span>
              </div>
            </div>
            {internship.salary && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                Plaćena praksa
              </Badge>
            )}
          </div>

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

              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">O poduzeću</h2>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-lg">{internship.company.name}</p>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {internship.company.address}
                  </div>
                  <p className="text-gray-600">{internship.company.email}</p>
                  <p className="text-gray-600">{internship.company.phone}</p>
                  {internship.company.website && (
                    <a
                      href={internship.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {internship.company.website}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Sticky on desktop */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg border p-6 lg:sticky lg:top-6">
                <h3 className="font-semibold mb-4">Prijavi se</h3>

                {/* Show Apply button if user is student and hasn't applied */}
                {isAuthenticated && user?.role === UserRole.STUDENT && !hasApplied && !checkingApplication && (
                  <>
                    <Button
                      onClick={handleApplyClick}
                      className="w-full mb-4 bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      <Send className="h-5 w-5 mr-2" />
                      Prijavi se
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      Trebat će vam CV i motivacijsko pismo
                    </p>
                  </>
                )}

                {/* Show Applied badge if user has already applied */}
                {isAuthenticated && user?.role === UserRole.STUDENT && hasApplied && (
                  <div className="text-center py-4">
                    <Badge className="bg-green-100 text-green-800 border-green-300 text-base px-4 py-2">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Već prijavljeno
                    </Badge>
                    <p className="text-sm text-gray-600 mt-3">
                      Vaša prijava je u obradi
                    </p>
                  </div>
                )}

                {/* Show Login button if not authenticated */}
                {!isAuthenticated && (
                  <>
                    <Button
                      onClick={handleLoginClick}
                      className="w-full mb-4"
                      size="lg"
                      variant="outline"
                    >
                      Prijavi se za pristup
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      Morate se prijaviti kako biste se prijavili na praksu
                    </p>
                  </>
                )}

                {/* Show loading state */}
                {checkingApplication && (
                  <div className="text-center py-4 text-gray-500">
                    Provjera statusa prijave...
                  </div>
                )}

                {/* Show nothing for non-student users */}
                {isAuthenticated && user?.role !== UserRole.STUDENT && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Samo studenti mogu se prijaviti na praksu
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-semibold mb-4">Detalji</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Lokacija</p>
                      <p className="font-medium">{internship.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Trajanje</p>
                      <p className="font-medium">
                        {internship.duration} {internship.duration === 1 ? 'mjesec' : 'mjeseca'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Početak</p>
                      <p className="font-medium">
                        {new Date(internship.startDate).toLocaleDateString('hr-HR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Kraj</p>
                      <p className="font-medium">
                        {new Date(internship.endDate).toLocaleDateString('hr-HR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Potrebni sati</p>
                      <p className="font-medium">{internship.requiredHours}h</p>
                    </div>
                  </div>

                  {internship.salary && (
                    <div className="flex items-start">
                      <DollarSign className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Plaća</p>
                        <p className="font-medium">{internship.salary} EUR</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-50">
        {/* Show Apply button if user is student and hasn't applied */}
        {isAuthenticated && user?.role === UserRole.STUDENT && !hasApplied && !checkingApplication && (
          <Button
            onClick={handleApplyClick}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <Send className="h-5 w-5 mr-2" />
            Prijavi se
          </Button>
        )}

        {/* Show Applied badge if user has already applied */}
        {isAuthenticated && user?.role === UserRole.STUDENT && hasApplied && (
          <Badge className="w-full bg-green-100 text-green-800 border-green-300 text-base px-4 py-3 justify-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Već prijavljeno
          </Badge>
        )}

        {/* Show Login button if not authenticated */}
        {!isAuthenticated && (
          <Button
            onClick={handleLoginClick}
            className="w-full"
            size="lg"
            variant="outline"
          >
            Prijavi se za pristup
          </Button>
        )}
      </div>
    </div>
  );
};
