import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users,
  FileText,
  Building2,
  CheckCircle,
  BarChart3,
  UserPlus,
  ClipboardList,
  Settings,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { statisticsService } from '@/services/statisticsService';
import type { StatisticsResponse } from '@/services/statisticsService';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      const data = await statisticsService.getStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Nije moguće učitati statistiku');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Ukupno prijava',
      value: statistics?.totalApplications ?? 0,
      icon: Users,
      color: 'bg-blue-500',
      description: 'Prijave studenata',
    },
    {
      title: 'Aktivne ponude',
      value: statistics?.activeOffers ?? 0,
      icon: FileText,
      color: 'bg-green-500',
      description: 'Trenutno dostupno',
    },
    {
      title: 'Odobrene prakse',
      value: statistics?.approvedInternships ?? 0,
      icon: CheckCircle,
      color: 'bg-purple-500',
      description: 'Odobreno i u tijeku',
    },
    {
      title: 'Završene prakse',
      value: statistics?.completedInternships ?? 0,
      icon: Building2,
      color: 'bg-orange-500',
      description: 'Uspješno završeno',
    },
  ];

  const quickActions = [
    {
      title: 'Upravljanje korisnicima',
      description: 'Pregled i upravljanje studentima',
      icon: Users,
      color: 'bg-blue-600 hover:bg-blue-700',
      path: '/admin/users',
    },
    {
      title: 'Pregled praksi',
      description: 'Sve prakse u sustavu',
      icon: FileText,
      color: 'bg-green-600 hover:bg-green-700',
      path: '/admin/internships',
    },
    {
      title: 'Tvrtke',
      description: 'Upravljanje tvrtkama',
      icon: Building2,
      color: 'bg-purple-600 hover:bg-purple-700',
      path: '/admin/companies',
    },
    {
      title: 'Statistika',
      description: 'Detaljna statistika sustava',
      icon: BarChart3,
      color: 'bg-orange-600 hover:bg-orange-700',
      path: '/admin/statistics',
    },
  ];

  const adminTools = [
    {
      title: 'Dodijeli mentora',
      icon: UserPlus,
      path: '/admin/assign-mentor',
    },
    {
      title: 'Parametri prakse',
      icon: Settings,
      path: '/admin/parameters',
    },
    {
      title: 'Povijest praksi',
      icon: ClipboardList,
      path: '/admin/internships/history',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Nadzorna ploča</h1>
            <p className="text-gray-600 mt-2">Dobrodošli u admin panel</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {isLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div
                              className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                            >
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                {stat.title}
                              </dt>
                              <dd className="text-2xl font-bold text-gray-900">{stat.value}</dd>
                              <dd className="text-xs text-gray-400 mt-1">{stat.description}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Brze akcije</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className={`${action.color} text-white p-6 rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-xl text-left cursor-pointer`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-6 w-6 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-lg mb-1">{action.title}</h4>
                        <p className="text-sm opacity-90">{action.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin Tools */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dodatni alati</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {adminTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <Link key={index} to={tool.path}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <Icon className="h-5 w-5 text-gray-700" />
                          </div>
                          <span className="font-medium text-gray-900">{tool.title}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Activity / Additional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Pregled sustava
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Aktivne prakse:</span>
                    <span className="font-semibold text-gray-900">
                      {statistics?.approvedInternships ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Prakse na čekanju:</span>
                    <span className="font-semibold text-gray-900">
                      {statistics?.pendingApplications ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Prosječna ocjena:</span>
                    <span className="font-semibold text-gray-900">
                      {statistics?.averageGrade?.toFixed(2) ?? 'N/A'}
                    </span>
                  </div>
                  <div className="pt-3 border-t">
                    <Link to="/admin/statistics">
                      <Button variant="outline" className="w-full">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Detaljna statistika
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                  Brzi pristup
                </h3>
                <div className="space-y-2">
                  <Link to="/admin/companies/new">
                    <Button variant="outline" className="w-full justify-start">
                      <Building2 className="h-4 w-4 mr-2" />
                      Dodaj novu tvrtku
                    </Button>
                  </Link>
                  <Link to="/admin/users?role=STUDENT">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Pregled studenata
                    </Button>
                  </Link>
                  <Link to="/admin/internships">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Sve prakse
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
