import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AccountStatusBadge } from '../../components/AccountStatusBadge';
import { InactiveAccountBanner } from '../../components/InactiveAccountBanner';
import { Building2, Mail, Calendar, User, MapPin, Phone, Globe, FileText } from 'lucide-react';
import { apiRequest } from '../../services/api';

interface Company {
  id: string;
  name: string;
  oib: string;
  email: string;
  address: string;
  phone?: string;
  website?: string;
  contactPerson?: string;
  status: string;
  createdAt: string;
}

export const EmployerProfile = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.companyId) {
      fetchCompany();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchCompany = async () => {
    try {
      const response = await apiRequest<Company>(`/api/companies/${user?.companyId}`, {
        method: 'GET',
      });
      setCompany(response);
    } catch (error) {
      console.error('Failed to fetch company:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Učitavanje...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {!user.isActive && <InactiveAccountBanner />}

      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Profil poduzeća</h1>
          <AccountStatusBadge isActive={user.isActive} />
        </div>

        {/* Company Information */}
        <div className="px-6 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Podaci o poduzeću</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Naziv poduzeća</p>
                <p className="text-gray-900 font-medium">
                  {company?.name || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">OIB</p>
                <p className="text-gray-900 font-medium">{company?.oib || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900 font-medium">{company?.email || user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Adresa</p>
                <p className="text-gray-900 font-medium">{company?.address || 'N/A'}</p>
              </div>
            </div>

            {company?.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Telefon</p>
                  <p className="text-gray-900 font-medium">{company.phone}</p>
                </div>
              </div>
            )}

            {company?.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Web stranica</p>
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                    {company.website}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Kontakt osoba</p>
                <p className="text-gray-900 font-medium">{company?.contactPerson || `${user.firstName} ${user.lastName}`}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Datum registracije</p>
                <p className="text-gray-900 font-medium">
                  {company?.createdAt ? new Date(company.createdAt).toLocaleDateString('hr-HR') : new Date(user.createdAt).toLocaleDateString('hr-HR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status Section */}
        <div className="px-6 py-6 border-t border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Status računa</h2>
          <div className="flex items-center gap-2">
            <AccountStatusBadge isActive={user.isActive} />
            {user.isActive ? (
              <p className="text-sm text-gray-600">
                Vaš račun je aktivan i možete kreirati i upravljati praksama.
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
