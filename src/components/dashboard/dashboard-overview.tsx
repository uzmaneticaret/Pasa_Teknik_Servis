'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatsCard } from './stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Wrench, 
  CheckCircle, 
  DollarSign, 
  TrendingUp,
  Clock,
  AlertCircle,
  Package,
  Plus,
  ArrowUpRight,
  Activity,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  todayServices: number;
  pendingServices: number;
  completedServices: number;
  todayRevenue: number;
  todayServiceChange?: number;
  revenueChange?: number;
  servicesByStatus: Array<{
    status: string;
    _count: { status: number };
  }>;
  monthlyRevenue: Record<string, number>;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timeAgo: string;
  icon: string;
  color: string;
}

const statusLabels = {
  RECEIVED: 'Alındı',
  DIAGNOSIS_PENDING: 'Teşhis Bekliyor',
  CUSTOMER_APPROVAL_PENDING: 'Müşteri Onayı Bekliyor',
  PARTS_PENDING: 'Parça Bekliyor',
  REPAIRING: 'Tamir Ediliyor',
  COMPLETED_READY_FOR_DELIVERY: 'Teslime Hazır',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
  RETURNED: 'İade Edildi'
};

const statusColors = {
  RECEIVED: '#3B82F6',
  DIAGNOSIS_PENDING: '#F59E0B',
  CUSTOMER_APPROVAL_PENDING: '#F97316',
  PARTS_PENDING: '#8B5CF6',
  REPAIRING: '#6366F1',
  COMPLETED_READY_FOR_DELIVERY: '#10B981',
  DELIVERED: '#6B7280',
  CANCELLED: '#EF4444',
  RETURNED: '#EF4444'
};

const statusBgColors = {
  RECEIVED: 'bg-blue-100 text-blue-800',
  DIAGNOSIS_PENDING: 'bg-yellow-100 text-yellow-800',
  CUSTOMER_APPROVAL_PENDING: 'bg-orange-100 text-orange-800',
  PARTS_PENDING: 'bg-purple-100 text-purple-800',
  REPAIRING: 'bg-indigo-100 text-indigo-800',
  COMPLETED_READY_FOR_DELIVERY: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  RETURNED: 'bg-red-100 text-red-800'
};

export function DashboardOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchActivities();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/dashboard/activities');
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  // Prepare chart data
  const monthlyRevenueData = stats ? Object.entries(stats.monthlyRevenue)
    .map(([month, revenue]) => ({
      month: new Date(month + '-01').toLocaleDateString('tr-TR', { month: 'short' }),
      revenue
    }))
    .reverse() : [];

  const statusData = stats?.servicesByStatus.map(item => ({
    name: statusLabels[item.status as keyof typeof statusLabels],
    value: item._count.status,
    color: statusColors[item.status as keyof typeof statusColors]
  })) || [];

  const totalServices = statusData.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <div className="space-y-6">
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

  if (!stats) {
    return <div>İstatistikler yüklenemedi</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Hoş geldiniz, {typeof window !== 'undefined' && localStorage.getItem('userName') || 'Admin'}! İşte son durum.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => router.push('/services')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Yeni Servis
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push('/reports')}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Raporlar
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-100 flex items-center justify-between">
                <span>Bugünkü Servisler</span>
                <Package className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.todayServices}</div>
              <p className="text-blue-100 text-sm mt-1">
                Bugün alınan toplam servis
              </p>
              <div className="flex items-center mt-2 text-blue-200 text-xs">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {stats.todayServiceChange !== undefined ? (
                  stats.todayServiceChange >= 0 ? `+${stats.todayServiceChange.toFixed(1)}% dünden` : 
                  `${stats.todayServiceChange.toFixed(1)}% dünden`
                ) : 'Hesaplanıyor...'}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-100 flex items-center justify-between">
                <span>Bekleyen Servisler</span>
                <Clock className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingServices}</div>
              <p className="text-amber-100 text-sm mt-1">
                Tamamlanmamış servisler
              </p>
              <div className="flex items-center mt-2 text-amber-200 text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Aktif takip
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-100 flex items-center justify-between">
                <span>Tamamlanan Servisler</span>
                <CheckCircle className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.completedServices}</div>
              <p className="text-green-100 text-sm mt-1">
                Teslime hazır veya teslim edilmiş
              </p>
              <div className="flex items-center mt-2 text-green-200 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Toplam tamamlanan
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-100 flex items-center justify-between">
                <span>Bugünkü Ciro</span>
                <DollarSign className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₺{stats.todayRevenue.toLocaleString('tr-TR')}</div>
              <p className="text-purple-100 text-sm mt-1">
                Bugün teslim edilen servislerden
              </p>
              <div className="flex items-center mt-2 text-purple-200 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stats.revenueChange !== undefined ? (
                  stats.revenueChange > 0 ? `+${stats.revenueChange.toFixed(1)}% artış` : 
                  stats.revenueChange < 0 ? `${stats.revenueChange.toFixed(1)}% azalış` : 
                  'Değişiklik yok'
                ) : 'Hesaplanıyor...'}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Aylık Gelir Trendi
              </CardTitle>
              <CardDescription>
                Son 6 aydaki gelir performansı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6b7280" 
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      fontSize={12}
                      tickFormatter={(value) => `₺${value.toLocaleString('tr-TR')}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`₺${value.toLocaleString('tr-TR')}`, 'Gelir']}
                      labelFormatter={(label) => `${label} Ayı`}
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: '#fff'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      fill="url(#colorRevenue)" 
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Service Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-purple-600" />
                Servis Durum Dağılımı
              </CardTitle>
              <CardDescription>
                Mevcut servislerin durum analizi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${value} (${((value / totalServices) * 100).toFixed(1)}%)`,
                        name
                      ]}
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Status Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Son Aktiviteler
            </CardTitle>
            <CardDescription>
              Sistemdeki son hareketler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.length > 0 ? activities.map((activity) => (
                <div key={activity.id} className={`flex items-center justify-between p-3 ${
                  activity.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
                  activity.color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
                  'bg-purple-50 dark:bg-purple-900/20'
                } rounded-lg`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${
                      activity.color === 'blue' ? 'bg-blue-500' :
                      activity.color === 'green' ? 'bg-green-500' :
                      'bg-purple-500'
                    } rounded-full flex items-center justify-center`}>
                      {activity.icon === 'Package' && <Package className="h-4 w-4 text-white" />}
                      {activity.icon === 'CheckCircle' && <CheckCircle className="h-4 w-4 text-white" />}
                      {activity.icon === 'Users' && <Users className="h-4 w-4 text-white" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{activity.timeAgo}</span>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Henüz aktivite bulunmuyor
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}