'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { useAuth } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  ArrowLeft, 
  RefreshCw, 
  Download, 
  Users, 
  TrendingUp, 
  Award, 
  Clock, 
  DollarSign,
  Menu,
  X,
  UserCheck,
  Sparkles,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface TechnicianData {
  id: string;
  name: string;
  email: string;
  serviceCount: number;
  completedServices: number;
  totalRevenue: number;
  averageRevenue: number;
  completionRate: number;
  averageServiceTime: number;
  rank: number;
  efficiency: number;
}

interface AnalyticsData {
  performance?: {
    technicians: TechnicianData[];
    summary: {
      totalTechnicians: number;
      totalServices: number;
      totalRevenue: number;
      averageCompletionRate: number;
    };
  };
  efficiency?: {
    efficiency: Array<{
      technician: any;
      revenuePerHour: number;
      servicesPerDay: number;
      utilizationRate: number;
    }>;
    summary: {
      averageRevenuePerHour: number;
      averageServicesPerDay: number;
      averageUtilizationRate: number;
    };
  };
  comparison?: {
    comparison: Array<{
      id: string;
      name: string;
      email: string;
      performance: any;
      efficiency: any;
      overallScore: number;
    }>;
    metrics: {
      topPerformer: any;
      mostEfficient: any;
      highestCompletion: any;
    };
  };
}

export default function TechnicianAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);
  const [analysisType, setAnalysisType] = useState('general');
  const [period, setPeriod] = useState('monthly');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Çıkış başarılı',
      description: 'Güvenli bir şekilde çıkış yapıldı',
    });
    router.push('/login');
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [analysisType, period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: analysisType,
        period: period,
      });

      const response = await fetch(`/api/technician-analytics?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
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

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getPerformanceChartData = () => {
    if (!analyticsData.performance?.technicians) return [];
    
    return analyticsData.performance.technicians.slice(0, 10).map(tech => ({
      name: tech.name.split(' ')[0], // Sadece isim
      services: tech.serviceCount,
      revenue: tech.totalRevenue,
      completion: tech.completionRate,
    }));
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
              <h1 className="text-3xl font-bold tracking-tight">Teknisyen Performansı</h1>
              <p className="text-muted-foreground">
                Performans metrikleri ve verimlilik raporları
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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
    <ProtectedRoute>
      <div className="flex h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-yellow-50/20 dark:from-gray-900 dark:via-orange-900/20 dark:to-gray-900">
        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 lg:hidden"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 left-0 w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl"
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-8 h-8 bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg flex items-center justify-center"
                    >
                      <BarChart3 className="w-5 h-5 text-white" />
                    </motion.div>
                    <span className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Teknisyen Analitik</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="p-4">
                  <SidebarNav onLogout={handleLogout} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="w-80 flex flex-col bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700">
            <SidebarNav onLogout={handleLogout} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="lg:hidden flex items-center justify-between p-4 border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
          >
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-8 h-8 bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg flex items-center justify-center"
              >
                <BarChart3 className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Teknisyen Analitik</span>
              <Badge variant="outline" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
                <TrendingUp className="w-3 h-3 mr-1" />
                Analiz
              </Badge>
            </div>
          </motion.div>

          {/* Analytics Content */}
          <div className="flex-1 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6"
            >
              <div className="mb-6">
                <motion.h1
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2"
                >
                  Teknisyen Performans Analizi
                </motion.h1>
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 dark:text-gray-400"
                >
                  Teknisyen performansını izleyin ve optimize edin
                </motion.p>
              </div>
              
              <div className="space-y-6">{/* İçerik burada devam edecek */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ana Sayfa
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teknisyen Performansı</h1>
            <p className="text-muted-foreground">
              Performans metrikleri ve verimlilik raporları
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchAnalyticsData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Analiz Kontrolleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger>
                <SelectValue placeholder="Analiz tipi seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Genel Analiz</SelectItem>
                <SelectItem value="performance">Performans Analizi</SelectItem>
                <SelectItem value="efficiency">Verimlilik Metrikleri</SelectItem>
                <SelectItem value="comparison">Teknisyen Karşılaştırma</SelectItem>
              </SelectContent>
            </Select>

            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Dönem seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Günlük</SelectItem>
                <SelectItem value="weekly">Haftalık</SelectItem>
                <SelectItem value="monthly">Aylık</SelectItem>
                <SelectItem value="yearly">Yıllık</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performans Analizi</TabsTrigger>
          <TabsTrigger value="efficiency">Verimlilik Metrikleri</TabsTrigger>
          <TabsTrigger value="comparison">Teknisyen Karşılaştırma</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          {analyticsData.performance && (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Toplam Teknisyen"
                  value={analyticsData.performance.summary.totalTechnicians}
                  description="Aktif teknisyen sayısı"
                  icon={Users}
                />
                <StatsCard
                  title="Toplam Servis"
                  value={analyticsData.performance.summary.totalServices}
                  description="Tamamlanan servis sayısı"
                  icon={TrendingUp}
                />
                <StatsCard
                  title="Toplam Gelir"
                  value={formatCurrency(analyticsData.performance.summary.totalRevenue)}
                  description="Teknisyenlerden gelen gelir"
                  icon={DollarSign}
                />
                <StatsCard
                  title="Tamamlama Oranı"
                  value={`${analyticsData.performance.summary.averageCompletionRate.toFixed(1)}%`}
                  description="Ortalama tamamlama oranı"
                  icon={Award}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Performans Sıralaması</CardTitle>
                    <CardDescription>
                      En çok gelir getiren teknisyenler
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getPerformanceChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number, name: string) => 
                          name === 'revenue' ? formatCurrency(value) : value
                        } />
                        <Legend />
                        <Bar dataKey="revenue" fill="#00C49F" name="Gelir" />
                        <Bar dataKey="services" fill="#0088FE" name="Servis Sayısı" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>En İyi Performans</CardTitle>
                    <CardDescription>
                      En iyi teknisyenler
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.performance.technicians.slice(0, 5).map((tech, index) => (
                        <div key={tech.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">{index + 1}</span>
                            </div>
                            <div>
                              <div className="font-medium">{tech.name}</div>
                              <div className="text-sm text-gray-500">{tech.email}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(tech.totalRevenue)}</div>
                            <div className="text-sm text-gray-500">{tech.serviceCount} servis</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Performance Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Detaylı Performans Tablosu</CardTitle>
                  <CardDescription>
                    Tüm teknisyyenlerin performans detayları
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sıra</TableHead>
                        <TableHead>Teknisyen</TableHead>
                        <TableHead>Servis Sayısı</TableHead>
                        <TableHead>Tamamlanan</TableHead>
                        <TableHead>Tamamlama Oranı</TableHead>
                        <TableHead>Toplam Gelir</TableHead>
                        <TableHead>Ortalama Süre</TableHead>
                        <TableHead>Verimlilik</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyticsData.performance.technicians.map((tech) => (
                        <TableRow key={tech.id}>
                          <TableCell>
                            <Badge variant={tech.rank <= 3 ? 'default' : 'secondary'}>
                              #{tech.rank}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{tech.name}</div>
                              <div className="text-sm text-gray-500">{tech.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{tech.serviceCount}</TableCell>
                          <TableCell>{tech.completedServices}</TableCell>
                          <TableCell>
                            <Badge variant={tech.completionRate >= 90 ? 'default' : 'secondary'}>
                              {tech.completionRate.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(tech.totalRevenue)}</TableCell>
                          <TableCell>{formatTime(tech.averageServiceTime)}</TableCell>
                          <TableCell>
                            <Badge variant={tech.efficiency >= 80 ? 'default' : 'secondary'}>
                              {tech.efficiency.toFixed(0)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-4">
          {analyticsData.efficiency && (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Ortalama Saatlik Gelir"
                  value={formatCurrency(analyticsData.efficiency.summary.averageRevenuePerHour)}
                  description="Teknisyen başına saatlik ortalama"
                  icon={DollarSign}
                />
                <StatsCard
                  title="Günlük Ortalama Servis"
                  value={analyticsData.efficiency.summary.averageServicesPerDay.toFixed(1)}
                  description="Teknisyen başına günlük servis"
                  icon={TrendingUp}
                />
                <StatsCard
                  title="Kullanım Oranı"
                  value={`${analyticsData.efficiency.summary.averageUtilizationRate.toFixed(1)}%`}
                  description="Ortalama kullanım oranı"
                  icon={Clock}
                />
                <StatsCard
                  title="Verimlilik Skoru"
                  value="85%"
                  description="Genel verimlilik skoru"
                  icon={Award}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Verimlilik Metrikleri</CardTitle>
                  <CardDescription>
                    Teknisyenlerin verimlilik karşılaştırması
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teknisyen</TableHead>
                        <TableHead>Saatlik Gelir</TableHead>
                        <TableHead>Günlük Servis</TableHead>
                        <TableHead>Kullanım Oranı</TableHead>
                        <TableHead>Verimlilik</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyticsData.efficiency.efficiency.map((tech, index) => (
                        <TableRow key={tech.technician.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{tech.technician.name}</div>
                              <div className="text-sm text-gray-500">{tech.technician.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(tech.revenuePerHour)}</TableCell>
                          <TableCell>{tech.servicesPerDay.toFixed(1)}</TableCell>
                          <TableCell>
                            <Badge variant={tech.utilizationRate >= 80 ? 'default' : 'secondary'}>
                              {tech.utilizationRate.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={index < 3 ? 'default' : 'secondary'}>
                              {Math.round((tech.revenuePerHour / 1000) * 50 + tech.utilizationRate * 0.5 + (tech.servicesPerDay * 10))}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          {analyticsData.comparison && (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="En İyi Performans"
                  value={analyticsData.comparison.metrics.topPerformer?.name || '-'}
                  description="Genel en iyi teknisyen"
                  icon={Award}
                />
                <StatsCard
                  title="En Verimli"
                  value={analyticsData.comparison.metrics.mostEfficient?.name || '-'}
                  description="En yüksek verimlilik"
                  icon={TrendingUp}
                />
                <StatsCard
                  title="En Yüksek Tamamlama"
                  value={analyticsData.comparison.metrics.highestCompletion?.name || '-'}
                  description="En yüksek tamamlama oranı"
                  icon={Users}
                />
                <StatsCard
                  title="Ortalama Skor"
                  value="78"
                  description="Genel ortalama skor"
                  icon={Clock}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Genel Sıralama</CardTitle>
                  <CardDescription>
                    Tüm metriklere göre genel sıralama
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sıra</TableHead>
                        <TableHead>Teknisyen</TableHead>
                        <TableHead>Performans Skoru</TableHead>
                        <TableHead>Verimlilik Skoru</TableHead>
                        <TableHead>Genel Skor</TableHead>
                        <TableHead>Durum</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyticsData.comparison.comparison.map((tech, index) => (
                        <TableRow key={tech.id}>
                          <TableCell>
                            <Badge variant={index < 3 ? 'default' : 'secondary'}>
                              #{index + 1}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{tech.name}</div>
                              <div className="text-sm text-gray-500">{tech.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{Math.round(tech.performance.completionRate)}</TableCell>
                          <TableCell>{Math.round(tech.efficiency.revenuePerHour / 10)}</TableCell>
                          <TableCell>
                            <Badge variant={tech.overallScore >= 80 ? 'default' : 'secondary'}>
                              {Math.round(tech.overallScore)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={index === 0 ? 'default' : index < 3 ? 'secondary' : 'outline'}>
                              {index === 0 ? 'Şampiyon' : index < 3 ? 'İlk 3' : 'Standart'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
              </div>
            </motion.div>
          </div>
        </div>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}