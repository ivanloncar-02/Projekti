import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { croatianTranslations } from '../../translations/croatian';
import { apiRequest } from '../../services/api';

interface ActiveInternship {
  id: string;
  title: string;
  companyName: string;
  status: string;
  grade?: number;
  gradeComment?: string;
}

interface DashboardStats {
  activeApplications: number;
  activeInternships: number;
  activeInternship?: ActiveInternship;
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeApplications: 0,
    activeInternships: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiRequest<DashboardStats>('/api/dashboard/me', {
          method: 'GET',
        });
        setStats(response);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {croatianTranslations.student.dashboard.title}
          </h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              {croatianTranslations.student.dashboard.welcome}, {user?.firstName}!
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">📊</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {croatianTranslations.student.dashboard.activeApplications}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {isLoading ? '...' : stats.activeApplications}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link
                    to="/student/applications"
                    className="font-medium text-blue-700 hover:text-blue-600"
                  >
                    Pogledaj sve prijave →
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">💼</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {croatianTranslations.student.dashboard.internshipsStatus}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {isLoading ? '...' : (
                          stats.activeInternship?.status === 'GRADED'
                            ? '1 Ocijenjeno'
                            : stats.activeInternship?.status === 'COMPLETED'
                              ? '1 Završeno'
                              : `${stats.activeInternships} Aktivna`
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link
                    to="/student/internships"
                    className="font-medium text-green-700 hover:text-green-600"
                  >
                    Pogledaj prakse →
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* Graded Internship Notification */}
          {stats.activeInternship?.status === 'GRADED' && (
            <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Čestitamo! Praksa je uspješno završena</h3>
                    <p className="text-green-100 text-sm">
                      {stats.activeInternship.title} • {stats.activeInternship.companyName}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full flex items-center justify-center border-4 border-green-500">
                      <span className="text-3xl font-bold text-green-600">{stats.activeInternship.grade}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Konačna ocjena</p>
                  </div>
                  <div className="flex-1">
                    {stats.activeInternship.gradeComment ? (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Komentar mentora:</p>
                        <p className="text-gray-600 text-sm">{stats.activeInternship.gradeComment}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Uspješno ste završili praksu i dobili ocjenu. Možete pregledati sve detalje prakse, evaluaciju mentora i preuzeti izvješće.
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to={`/student/my-internship/${stats.activeInternship.id}`}
                    className="inline-flex items-center gap-2 text-green-600 font-medium hover:text-green-700 transition-colors"
                  >
                    Pogledaj detalje prakse
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Completed Internship (awaiting grade) */}
          {stats.activeInternship?.status === 'COMPLETED' && (
            <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Praksa završena - čeka se ocjena</h3>
                    <p className="text-amber-100 text-sm">
                      {stats.activeInternship.title} • {stats.activeInternship.companyName}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-orange-50 rounded-full flex items-center justify-center border-4 border-amber-400">
                      <span className="text-2xl">📋</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Evaluacija završena</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm">
                      Vaš mentor iz tvrtke je završio evaluaciju. Čekate ocjenu akademskog mentora. Nakon što mentor dodijeli ocjenu, bit ćete obaviješteni.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to={`/student/my-internship/${stats.activeInternship.id}`}
                    className="inline-flex items-center gap-2 text-amber-600 font-medium hover:text-amber-700 transition-colors"
                  >
                    Pogledaj detalje prakse
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Active Internship Section */}
          {stats.activeInternship && stats.activeInternship.status === 'ACTIVE' && (
            <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💼</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Aktivna praksa</h3>
                    <p className="text-blue-100 text-sm">
                      {stats.activeInternship.title} • {stats.activeInternship.companyName}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4">
                  Pratite svoje ciljeve, vodite dnevnik aktivnosti i pregledavajte napredak na praksi.
                </p>
                <Link
                  to={`/student/my-internship/${stats.activeInternship.id}`}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Upravljaj praksom
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Brze akcije</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/student/internships"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                Pretraži prakse
              </Link>
              <Link
                to="/student/applications"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                Moje prijave
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
