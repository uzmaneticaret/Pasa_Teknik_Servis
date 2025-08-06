'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/dashboard/stats-card';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  RefreshCw, 
  Download, 
  ArrowLeft,
  Users,
  Wrench,
  Target,
  Activity,
  Zap,
  Award,
  Clock,
  Star,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp as TrendingIcon,
  Filter
} from 'lucide-react';
import Link from 'next/link';

interface ChartData {
  period: string;
  income: number;
  expense: number;
  net: number;
  customers?: number;
  services?: number;
}

interface ServiceData {
  name: string;
  value: number;
  color: string;
  count?: number;
}

interface PerformanceData {
  subject: string;
  score: number;
  fullMark: number;
}

interface CustomerSegment {
  name: string;
  value: number;
  color: string;
  growth: number;
}

interface DashboardData {
  currentMonth?: {
    summary: {
      totalIncome: number;
      totalExpense: number;
      netProfit: number;
      transactionCount: number;
    };
  };
  currentYear?: {
    summary: {
      totalIncome: number;
      totalExpense: number;
      netProfit: number;
      transactionCount: number;
    };
    monthlyBreakdown: ChartData[];
  };
  trends?: {
    trends: ChartData[];
  };
  serviceAnalysis?: Array<{
    serviceId: string;
    _sum: { amount: number };
    _count: { _all: number };
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

const PERFORMANCE_COLORS = {
  excellent: '#10B981',
  good: '#3B82F6',
  average: '#F59E0B',
  poor: '#EF4444'
};

export default function VisualDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');
  const [chartType, setChartType] = useState('line');
  const [activeTab, setActiveTab] = useState('overview');
  const [isRealTime, setIsRealTime] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    
    if (isRealTime) {
      const interval = setInterval(() => {
        fetchDashboardData();
        setLastUpdate(new Date());
      }, 30000); // Update every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [timeRange, isRealTime]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: 'general',
      });

      const response = await fetch(`/api/reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getMonthName = (month: number) => {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return months[month - 1];
  };

  const processChartData = () => {
    if (!dashboardData.trends?.trends) return [];
    
    return dashboardData.trends.trends.map(item => ({
      ...item,
      period: getMonthName(parseInt(item.period.split('-')[1])) + ' ' + item.period.split('-')[0]
    }));
  };

  const processServiceData = (): ServiceData[] => {
    if (!dashboardData.serviceAnalysis) return [];
    
    return dashboardData.serviceAnalysis
      .filter(item => item._sum.amount > 0)
      .map((item, index) => ({
        name: `Servis ${index + 1}`,
        value: item._sum.amount,
        count: item._count._all,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  const getPerformanceData = (): PerformanceData[] => {
    return [
      { subject: 'Gelir', score: 85, fullMark: 100 },
      { subject: 'Müşteri Memnuniyeti', score: 92, fullMark: 100 },
      { subject: 'Servis Hızı', score: 78, fullMark: 100 },
      { subject: 'Verimlilik', score: 88, fullMark: 100 },
      { subject: 'Kalite', score: 95, fullMark: 100 },
      { subject: 'Maliyet Kontrolü', score: 82, fullMark: 100 }
    ];
  };

  const getCustomerSegments = (): CustomerSegment[] => {
    return [
      { name: 'VIP Müşteriler', value: 25, color: '#FFD700', growth: 15 },
      { name: 'Sadık Müşteriler', value: 35, color: '#00C49F', growth: 8 },
      { name: 'Düzenli Müşteriler', value: 30, color: '#0088FE', growth: 5 },
      { name: 'Yeni Müşteriler', value: 10, color: '#FF8042', growth: 25 }
    ];
  };

  const renderMainChart = () => {
    const data = processChartData();
    
    if (data.length === 0) return null;

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value), 
                  name === 'income' ? 'Gelir' : name === 'expense' ? 'Gider' : 'Net Kar'
                ]} 
              />
              <Legend />
              <Area type="monotone" dataKey="income" stackId="1" stroke="#00C49F" fill="#00C49F" fillOpacity={0.2} name="Gelir" />
              <Area type="monotone" dataKey="expense" stackId="2" stroke="#FF8042" fill="#FF8042" fillOpacity={0.2} name="Gider" />
              <Line type="monotone" dataKey="net" stroke="#0088FE" strokeWidth={3} name="Net Kar" dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Area type="monotone" dataKey="income" stackId="1" stroke="#00C49F" fill="#00C49F" name="Gelir" />
              <Area type="monotone" dataKey="expense" stackId="2" stroke="#FF8042" fill="#FF8042" name="Gider" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="income" fill="#00C49F" name="Gelir" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#FF8042" name="Gider" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ana Sayfa
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Görsel Dashboard</h1>
              <p className="text-muted-foreground">
                Interactive grafikler ve real-time veri güncellemeleri
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ana Sayfa
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Görsel Dashboard</h1>
            <p className="text-muted-foreground">
              Interactive grafikler ve real-time veri güncellemeleri
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}</span>
          </div>
          <Button 
            onClick={() => setIsRealTime(!isRealTime)} 
            variant={isRealTime ? "default" : "outline"}
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            Real-time
          </Button>
          <Button onClick={fetchDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Dashboard Kontrolleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Zaman aralığı seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Son 1 Ay</SelectItem>
                <SelectItem value="3months">Son 3 Ay</SelectItem>
                <SelectItem value="6months">Son 6 Ay</SelectItem>
                <SelectItem value="1year">Son 1 Yıl</SelectItem>
                <SelectItem value="all">Tüm Zamanlar</SelectItem>
              </SelectContent>
            </Select>

            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger>
                <SelectValue placeholder="Grafik tipi seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Çizgi Grafik</SelectItem>
                <SelectItem value="area">Alan Grafik</SelectItem>
                <SelectItem value="bar">Bar Grafik</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center justify-between p-2 border rounded-md">
              <span className="text-sm font-medium">Real-time Güncelleme</span>
              <Button
                onClick={() => setIsRealTime(!isRealTime)}
                variant={isRealTime ? "default" : "outline"}
                size="sm"
              >
                {isRealTime ? 'Aktif' : 'Pasif'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Genel Bakış
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <TrendingIcon className="h-4 w-4" />
            Finansal
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Servisler
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Müşteriler
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          {dashboardData.currentMonth && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Aylık Gelir"
                value={formatCurrency(dashboardData.currentMonth.summary.totalIncome)}
                description="Bu ayki toplam gelir"
                icon={TrendingUp}
                trend={{ value: 12.5, isPositive: true }}
              />
              <StatsCard
                title="Aylık Gider"
                value={formatCurrency(dashboardData.currentMonth.summary.totalExpense)}
                description="Bu ayki toplam gider"
                icon={TrendingDown}
                trend={{ value: -3.2, isPositive: false }}
              />
              <StatsCard
                title="Aylık Net Kar"
                value={formatCurrency(dashboardData.currentMonth.summary.netProfit)}
                description="Bu ayki net kar"
                icon={DollarSign}
                trend={{ value: 8.7, isPositive: true }}
              />
              <StatsCard
                title="İşlem Sayısı"
                value={dashboardData.currentMonth.summary.transactionCount}
                description="Bu ayki toplam işlem"
                icon={Calendar}
                trend={{ value: 15.3, isPositive: true }}
              />
            </div>
          )}

          {/* Main Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Finansal Trendler</CardTitle>
              <CardDescription>
                Gelir, gider ve net kar trendleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderMainChart()}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performans Radar
                </CardTitle>
                <CardDescription>
                  Ana performans göstergeleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={getPerformanceData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Performans"
                      dataKey="score"
                      stroke="#0088FE"
                      fill="#0088FE"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Hızlı Metrikler
                </CardTitle>
                <CardDescription>
                  Önemli performans göstergeleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.currentYear && (
                    <>
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Yıllık Gelir Artışı</span>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          +12.5%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Kar Marjı</span>
                        </div>
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          {((dashboardData.currentYear.summary.netProfit / dashboardData.currentYear.summary.totalIncome) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">Ortalama İşlem Büyüklüğü</span>
                        </div>
                        <Badge variant="default" className="bg-purple-100 text-purple-800">
                          {formatCurrency(dashboardData.currentYear.summary.totalIncome / dashboardData.currentYear.summary.transactionCount)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium">Verimlilik Oranı</span>
                        </div>
                        <Badge variant="default" className="bg-orange-100 text-orange-800">
                          87.3%
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingIcon className="h-5 w-5" />
                  Detaylı Finansal Analiz
                </CardTitle>
                <CardDescription>
                  Gelir ve gider detayları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={processChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="income" fill="#00C49F" name="Gelir" />
                    <Bar dataKey="expense" fill="#FF8042" name="Gider" />
                    <Line type="monotone" dataKey="net" stroke="#0088FE" strokeWidth={3} name="Net Kar" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Gelir Dağılımı
                </CardTitle>
                <CardDescription>
                  Gelir kaynaklarının dağılımı
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={processServiceData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {processServiceData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Servis Performansı
                </CardTitle>
                <CardDescription>
                  Servis bazlı gelir analizi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={processServiceData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === 'value' ? formatCurrency(value) : value,
                        name === 'value' ? 'Gelir' : 'İşlem Sayısı'
                      ]} 
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#0088FE" name="Gelir" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="count" fill="#00C49F" name="İşlem Sayısı" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Servis İstatistikleri
                </CardTitle>
                <CardDescription>
                  Detaylı servis metrikleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {processServiceData().slice(0, 5).map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: service.color }}
                        />
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(service.value)}</div>
                        <div className="text-sm text-muted-foreground">{service.count} işlem</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Müşteri Segmentasyonu
                </CardTitle>
                <CardDescription>
                  Müşteri gruplarının dağılımı
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={getCustomerSegments()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getCustomerSegments().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Müşteri Metrikleri
                </CardTitle>
                <CardDescription>
                  Müşteri analizi özeti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getCustomerSegments().map((segment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="font-medium">{segment.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {segment.value}%
                        </Badge>
                        <Badge 
                          variant={segment.growth > 0 ? "default" : "destructive"}
                          className={segment.growth > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {segment.growth > 0 ? '+' : ''}{segment.growth}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}