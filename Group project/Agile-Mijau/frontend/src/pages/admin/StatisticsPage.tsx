import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart3, Users, Building2, FileText, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { statisticsService } from '@/services/statisticsService';
import type { StatisticsResponse } from '@/services/statisticsService';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Calculate current academic year (academic year starts in September)
const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed, so 8 = September
  // If before September, we're in the previous academic year
  if (month < 8) {
    return `${year - 1}/${year}`;
  }
  return `${year}/${year + 1}`;
};

const CURRENT_ACADEMIC_YEAR = getCurrentAcademicYear();

const ACADEMIC_YEARS = [
  { value: '2023/2024', label: '2023/2024' },
  { value: '2024/2025', label: '2024/2025' },
  { value: '2025/2026', label: '2025/2026' },
  { value: '2026/2027', label: '2026/2027' },
];

// Chart colors
const COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f97316', '#ef4444'];

export default function StatisticsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(
    searchParams.get('year') || CURRENT_ACADEMIC_YEAR
  );
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);

  useEffect(() => {
    // Update URL params when year changes
    const params = new URLSearchParams();
    if (selectedYear) params.set('year', selectedYear);
    setSearchParams(params);

    // Load statistics
    loadStatistics();
  }, [selectedYear]);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const yearFilter = selectedYear === 'ALL' ? undefined : selectedYear;
      const response = await statisticsService.getStatistics(yearFilter);
      setStatistics(response);
    } catch (error) {
      console.error('Failed to load statistics:', error);
      toast.error('Failed to load statistics. Please try again.');
      setStatistics(null);
    } finally {
      setIsLoading(false);
    }
  };

  const hasActiveFilters = selectedYear !== 'ALL' && selectedYear !== CURRENT_ACADEMIC_YEAR;
  const hasNoData =
    !statistics ||
    (statistics.totalApplications === 0 &&
      statistics.approvedInternships === 0 &&
      statistics.completedInternships === 0 &&
      statistics.activeOffers === 0 &&
      statistics.pendingApplications === 0);

  const statCards = [
    {
      title: 'Ukupno prijava',
      value: statistics?.totalApplications ?? 0,
      icon: Users,
      description: 'Prijave studenata',
      color: '#3b82f6',
    },
    {
      title: 'Aktivne ponude',
      value: statistics?.activeOffers ?? 0,
      icon: Building2,
      description: 'Trenutno aktivne ponude praksi',
      color: '#22c55e',
    },
    {
      title: 'Odobrene prakse',
      value: statistics?.approvedInternships ?? 0,
      icon: FileText,
      description: 'Odobreno i u tijeku',
      color: '#a855f7',
    },
    {
      title: 'Završene prakse',
      value: statistics?.completedInternships ?? 0,
      icon: TrendingUp,
      description: 'Uspješno završeno',
      color: '#f97316',
    },
  ];

  // Prepare chart data
  const barChartData = [
    { name: 'Prijave', value: statistics?.totalApplications ?? 0 },
    { name: 'Aktivne ponude', value: statistics?.activeOffers ?? 0 },
    { name: 'Odobrene', value: statistics?.approvedInternships ?? 0 },
    { name: 'Završene', value: statistics?.completedInternships ?? 0 },
    { name: 'Na čekanju', value: statistics?.pendingApplications ?? 0 },
  ];

  const pieChartData = [
    { name: 'Odobrene prakse', value: statistics?.approvedInternships ?? 0 },
    { name: 'Završene prakse', value: statistics?.completedInternships ?? 0 },
    { name: 'Prijave na čekanju', value: statistics?.pendingApplications ?? 0 },
  ].filter((item) => item.value > 0);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 className="h-8 w-8" />
          Statistika
        </h1>
        <p className="text-muted-foreground mt-1">Pregled statistike i metrika sustava</p>
      </div>

      {/* Filters Section */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filteri</h2>
        </div>

        <div className="max-w-xs">
          <Label htmlFor="year">Akademska godina</Label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger id="year" className="mt-2">
              <SelectValue placeholder="Odaberi godinu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Sve godine</SelectItem>
              {ACADEMIC_YEARS.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center h-48">
            <p className="text-muted-foreground">Učitavanje statistike...</p>
          </div>
        ) : (
          statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Empty State Alert (only when filters applied and no data) */}
      {hasActiveFilters && hasNoData && !isLoading && (
        <Alert>
          <BarChart3 className="h-4 w-4" />
          <AlertTitle>Nema podataka za odabrane filtere</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              Nema dostupne statistike za akademsku godinu {selectedYear}. Pokušajte odabrati
              drugu godinu.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Charts Section */}
      {!hasNoData && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Pregled po kategorijama</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" name="Broj" radius={[4, 4, 0, 0]}>
                      {barChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Distribucija praksi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Nema podataka za prikaz</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Sažetak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {statistics?.totalApplications ?? 0}
                  </p>
                  <p className="text-sm text-gray-600">Ukupno prijava</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {statistics?.activeOffers ?? 0}
                  </p>
                  <p className="text-sm text-gray-600">Aktivne ponude</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {statistics?.pendingApplications ?? 0}
                  </p>
                  <p className="text-sm text-gray-600">Na čekanju</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {statistics?.averageGrade?.toFixed(2) ?? 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">Prosječna ocjena</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
