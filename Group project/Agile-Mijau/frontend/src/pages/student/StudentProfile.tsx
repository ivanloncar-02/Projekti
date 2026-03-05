import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AccountStatusBadge } from '../../components/AccountStatusBadge';
import { InactiveAccountBanner } from '../../components/InactiveAccountBanner';
import { User, Mail, Calendar, FileText, Upload, Check, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const StudentProfile = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [hasCv, setHasCv] = useState(false);
  const [cvPath, setCvPath] = useState<string | null>(null);
  const [cvUploadDate, setCvUploadDate] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing CV on mount
  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!user?.id) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/students/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.cv) {
            setHasCv(true);
            setCvPath(`/api/uploads/cv/${data.cv}`);
            if (data.updatedAt) {
              setCvUploadDate(new Date(data.updatedAt).toLocaleDateString('hr-HR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching student profile:', error);
      }
    };

    fetchStudentProfile();
  }, [user?.id]);

  const handleViewCV = async () => {
    if (!cvPath) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${cvPath}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Greška pri preuzimanju CV-a');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      toast.error('Greška pri otvaranju CV-a');
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Dozvoljeni formati: PDF, DOC, DOCX');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Maksimalna veličina datoteke je 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/uploads/cv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setHasCv(true);
      setCvPath(data.path);
      setCvUploadDate(new Date().toLocaleDateString('hr-HR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }));
      toast.success('CV uspješno učitan');
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast.error('Greška pri učitavanju CV-a');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {!user.isActive && <InactiveAccountBanner />}

      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
          <AccountStatusBadge isActive={user.isActive} />
        </div>

        {/* Personal Information */}
        <div className="px-6 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Osobni podaci</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Ime i prezime</p>
                <p className="text-gray-900 font-medium">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Datum registracije</p>
                <p className="text-gray-900 font-medium">
                  {new Date(user.createdAt).toLocaleDateString('hr-HR')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Uloga</p>
                <p className="text-gray-900 font-medium">Student</p>
              </div>
            </div>
          </div>
        </div>

        {/* CV Upload Section */}
        <div className="px-6 py-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Životopis (CV)</h2>
          <div className="space-y-4">
            {hasCv ? (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <FileText className="w-5 h-5 text-green-600" />
                  <div>
                    <span className="text-green-800 font-medium">CV učitan</span>
                    {cvUploadDate && (
                      <p className="text-xs text-green-600">{cvUploadDate}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleViewCV}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Pregledaj
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    variant="outline"
                    size="sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Učitavam...' : 'Zamijeni'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-500">Niste učitali CV</span>
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Učitavam...' : 'Učitaj CV'}
                </Button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx"
              className="hidden"
            />
            <p className="text-sm text-gray-500">
              Dozvoljeni formati: PDF, DOC, DOCX. Maksimalna veličina: 5MB
            </p>
          </div>
        </div>

        {/* Account Status Section */}
        <div className="px-6 py-6 border-t border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Status računa</h2>
          <div className="flex items-center gap-2">
            <AccountStatusBadge isActive={user.isActive} />
            {user.isActive ? (
              <p className="text-sm text-gray-600">
                Vaš račun je aktivan i možete koristiti sve funkcionalnosti.
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Vaš račun je trenutno neaktivan. Kontaktirajte administratora.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
