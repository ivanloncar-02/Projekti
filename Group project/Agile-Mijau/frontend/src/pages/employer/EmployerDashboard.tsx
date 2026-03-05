import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { croatianTranslations } from '../../translations/croatian';
import { apiRequest } from '../../services/api';
import { CompanyStatus } from '../../types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  status: string;
}

interface DashboardData {
  activeInternships: number;
  totalApplications: number;
  pendingApplications: number;
}

export const EmployerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    activeInternships: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    if (user?.companyId) {
      fetchCompany();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const response = await apiRequest<DashboardData>('/api/dashboard/me', {
        method: 'GET',
      });
      setDashboardData(response);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const fetchCompany = async () => {
    if (!user?.companyId) return;

    try {
      const response = await apiRequest<Company>(`/api/companies/${user.companyId}`, {
        method: 'GET',
      });
      setCompany(response);
    } catch (error) {
      console.error('Failed to fetch company:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isArchived = company?.status === CompanyStatus.ARCHIVED;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {croatianTranslations.employer.dashboard.title}
            </h1>
            {isArchived && (
              <Badge variant="destructive" className="text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                ARHIVIRANO
              </Badge>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              {croatianTranslations.employer.dashboard.welcome}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">💼</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {croatianTranslations.employer.dashboard.activeInternships}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">{dashboardData.activeInternships}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">📄</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {croatianTranslations.employer.dashboard.totalApplications}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">{dashboardData.totalApplications}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">👥</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Prijave na čekanju
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">{dashboardData.pendingApplications}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Brze akcije</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-block w-full">
                      <button
                        onClick={() => !isArchived && navigate('/employer/internships/new')}
                        disabled={isArchived}
                        className={`w-full px-6 py-3 rounded-lg transition-colors ${
                          isArchived
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                        }`}
                      >
                        Kreiraj novu praksu
                      </button>
                    </div>
                  </TooltipTrigger>
                  {isArchived && (
                    <TooltipContent>
                      <p>Ne možete kreirati ponude za arhivirana poduzeća</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              <button
                onClick={() => navigate('/employer/internships')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
              >
                Pregledaj prakse i prijave
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
