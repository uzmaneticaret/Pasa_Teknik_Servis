'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { useAuth } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Calendar, Download, RefreshCw, Menu, X, Sparkles, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportData {
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
    monthlyBreakdown: Array<{
      month: number;
      income: number;
      expense: number;
      net: number;
      transactionCount: number;
    }>;
  };
  trends?: {
    trends: Array<{
      period: string;
      income: number;
      expense: number;
      net: number;
    }>;
  };
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({});
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('general');
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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());

  useEffect(() => {
    fetchReportData();
  }, [reportType, selectedYear, selectedMonth]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: reportType,
        year: selectedYear,
        month: selectedMonth,
      });

      const response = await fetch(`/api/reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
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

  const exportToCSV = () => {
    // CSV export functionality
    const csvContent = generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rapor_${reportType}_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSVContent = () => {
    let csv = 'Dönem,Gelir,Gider,Net Kar,İşlem Sayısı\n';
    
    if (reportData.currentYear?.monthlyBreakdown) {
      reportData.currentYear.monthlyBreakdown.forEach(month => {
        csv += `${getMonthName(month.month)},${month.income},${month.expense},${month.net},${month.transactionCount}\n`;
      });
    }
    
    return csv;
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
              <h1 className="text-3xl font-bold tracking-tight">Raporlar</h1>
              <p className="text-muted-foreground">
                Gelişmiş finansal raporlar ve analizler
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
      <div className="flex h-screen bg-gradient-to-br from-cyan-50 via-blue-50/30 to-sky-50/20 dark:from-gray-900 dark:via-cyan-900/20 dark:to-gray-900">
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
                      className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center"
                    >
                      <FileText className="w-5 h-5 text-white" />
                    </motion.div>
                    <span className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Raporlar</span>
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
                className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center"
              >
                <FileText className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Raporlar</span>
              <Badge variant="outline" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                Analiz
              </Badge>
            </div>
          </motion.div>

          {/* Reports Content */}
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
                  className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2"
                >
                  Finansal Raporlar
                </motion.h1>
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 dark:text-gray-400"
                >
                  Gelir, gider ve karlılık raporlarını görüntüleyin
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
            <h1 className="text-3xl font-bold tracking-tight">Raporlar</h1>
            <p className="text-muted-foreground">
              Gelişmiş finansal raporlar ve analizler
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchReportData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Rapor Filtreleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Rapor tipi seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Genel Bakış</SelectItem>
                <SelectItem value="monthly">Aylık Rapor</SelectItem>
                <SelectItem value="yearly">Yıllık Rapor</SelectItem>
                <SelectItem value="comparison">Yıl Karşılaştırma</SelectItem>
                <SelectItem value="trends">Trend Analizi</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Yıl seçin" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Ay seçin" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {getMonthName(i + 1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {reportData.currentMonth && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Aylık Gelir"
            value={formatCurrency(reportData.currentMonth.summary.totalIncome)}
            description="Bu ayki toplam gelir"
            icon={TrendingUp}
          />
          <StatsCard
            title="Aylık Gider"
            value={formatCurrency(reportData.currentMonth.summary.totalExpense)}
            description="Bu ayki toplam gider"
            icon={TrendingDown}
          />
          <StatsCard
            title="Aylık Net Kar"
            value={formatCurrency(reportData.currentMonth.summary.netProfit)}
            description="Bu ayki net kar"
            icon={DollarSign}
          />
          <StatsCard
            title="İşlem Sayısı"
            value={reportData.currentMonth.summary.transactionCount}
            description="Bu ayki toplam işlem"
            icon={Calendar}
          />
        </div>
      )}

      {/* Yearly Breakdown */}
      {reportData.currentYear?.monthlyBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle>Aylık Breakdown - {selectedYear}</CardTitle>
            <CardDescription>
              {selectedYear} yılına ait aylık gelir-gider analizi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ay</TableHead>
                  <TableHead className="text-right">Gelir</TableHead>
                  <TableHead className="text-right">Gider</TableHead>
                  <TableHead className="text-right">Net Kar</TableHead>
                  <TableHead className="text-right">İşlem Sayısı</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.currentYear.monthlyBreakdown.map((month) => (
                  <TableRow key={month.month}>
                    <TableCell className="font-medium">
                      {getMonthName(month.month)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(month.income)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatCurrency(month.expense)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      month.net >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(month.net)}
                    </TableCell>
                    <TableCell className="text-right">
                      {month.transactionCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Trends */}
      {reportData.trends?.trends && (
        <Card>
          <CardHeader>
            <CardTitle>Trend Analizi</CardTitle>
            <CardDescription>
              Son 6 aylık finansal trendler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dönem</TableHead>
                  <TableHead className="text-right">Gelir</TableHead>
                  <TableHead className="text-right">Gider</TableHead>
                  <TableHead className="text-right">Net Kar</TableHead>
                  <TableHead className="text-right">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.trends.trends.map((trend, index) => {
                  const prevTrend = index > 0 ? reportData.trends!.trends[index - 1] : null;
                  const netChange = prevTrend ? trend.net - prevTrend.net : 0;
                  const isPositive = netChange >= 0;
                  
                  return (
                    <TableRow key={trend.period}>
                      <TableCell className="font-medium">
                        {trend.period}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(trend.income)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(trend.expense)}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        trend.net >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(trend.net)}
                      </TableCell>
                      <TableCell className="text-right">
                        {prevTrend && (
                          <Badge variant={isPositive ? 'default' : 'destructive'}>
                            {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            {formatPercentage((netChange / Math.abs(prevTrend.net)) * 100)}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
              </div>
            </motion.div>
          </div>
        </div>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}