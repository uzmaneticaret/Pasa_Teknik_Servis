'use client';

import { useState, useEffect } from 'react';
import { ServiceForm } from '@/components/services/service-form';
import { ServiceList } from '@/components/services/service-list';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, List, Wrench, TrendingUp, Clock, CheckCircle, AlertCircle, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function ServicesPage() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('list');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    activeServices: 0,
    completedServices: 0,
    pendingServices: 0,
    monthlyRevenue: 0,
    activeChange: 0,
    completedChange: 0,
    pendingChange: 0,
    revenueChange: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceStats();
  }, []);

  const fetchServiceStats = async () => {
    try {
      const response = await fetch('/api/services/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching service stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Çıkış başarılı',
      description: 'Güvenli bir şekilde çıkış yapıldı',
    });
    router.push('/login');
  };

  const handleServiceCreated = () => {
    toast({
      title: 'Başarılı',
      description: 'Servis kaydı oluşturuldu',
      variant: 'default',
    });
    setActiveTab('list');
    // Refresh stats after service creation
    fetchServiceStats();
  };

  const statsCards = [
    {
      title: 'Aktif Servisler',
      value: loading ? '...' : stats.activeServices.toString(),
      change: loading ? '' : `${stats.activeChange >= 0 ? '+' : ''}${stats.activeChange.toFixed(1)}%`,
      icon: Clock,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Tamamlanan',
      value: loading ? '...' : stats.completedServices.toString(),
      change: loading ? '' : `${stats.completedChange >= 0 ? '+' : ''}${stats.completedChange.toFixed(1)}%`,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Bekleyen',
      value: loading ? '...' : stats.pendingServices.toString(),
      change: loading ? '' : `${stats.pendingChange >= 0 ? '+' : ''}${stats.pendingChange.toFixed(1)}%`,
      icon: AlertCircle,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      textColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      title: 'Bu Ay Gelir',
      value: loading ? '...' : `₺${(stats.monthlyRevenue / 1000).toFixed(1)}K`,
      change: loading ? '' : `${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      textColor: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
                className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl"
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center"
                    >
                      <Wrench className="w-5 h-5 text-white" />
                    </motion.div>
                    <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Servisler</span>
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
                className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center"
              >
                <Wrench className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Servis Yönetimi</span>
            </div>
          </motion.div>

          {/* Services Content */}
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
                  className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2"
                >
                  Servis Yönetimi
                </motion.h1>
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 dark:text-gray-400"
                >
                  Tüm servis işlemlerinizi buradan yönetin
                </motion.p>
              </div>

              {/* Statistics Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                {statsCards.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (index + 1) }}
                  >
                    <Card className={`border-0 shadow-lg bg-gradient-to-br ${stat.color} text-white overflow-hidden`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white/90 flex items-center justify-between text-sm font-medium">
                          <span>{stat.title}</span>
                          <stat.icon className="h-4 w-4" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-white/80 text-xs mt-1 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {stat.change}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Servis Listesi
                  </TabsTrigger>
                  <TabsTrigger value="new" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Yeni Servis
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                  <ServiceList onServiceSelect={(service) => console.log('Selected service:', service)} />
                </TabsContent>

                <TabsContent value="new" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Yeni Servis Kaydı</CardTitle>
                      <CardDescription>
                        Yeni servis için müşteri ve cihaz bilgilerini girin
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ServiceForm 
                        onSuccess={handleServiceCreated}
                        onCancel={() => setActiveTab('list')}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
