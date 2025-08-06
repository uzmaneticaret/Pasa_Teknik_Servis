'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { useAuth } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bell, 
  Mail, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Send, 
  Menu, 
  X, 
  Sparkles, 
  Search,
  Filter,
  TrendingUp,
  Clock,
  AlertTriangle 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationLog {
  id: string;
  type: string;
  serviceId: string;
  customerEmail: string;
  status: 'SENT' | 'FAILED';
  subject: string;
  sentAt: string;
  service?: {
    serviceNumber: string;
    customer: {
      name: string;
    };
  };
}

interface NotificationStats {
  total: number;
  sent: number;
  failed: number;
  today: number;
}

export default function NotificationsPage() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    sent: 0,
    failed: 0,
    today: 0
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const calculateStats = useCallback((notifications: NotificationLog[]): NotificationStats => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      total: notifications.length,
      sent: notifications.filter(n => n.status === 'SENT').length,
      failed: notifications.filter(n => n.status === 'FAILED').length,
      today: notifications.filter(n => {
        const sentDate = new Date(n.sentAt);
        sentDate.setHours(0, 0, 0, 0);
        return sentDate.getTime() === today.getTime();
      }).length
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/notifications?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data);
      setStats(calculateStats(data));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Hata',
        description: 'Bildirimler yüklenirken hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshNotifications = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
    toast({
      title: 'Yenilendi',
      description: 'Bildirimler başarıyla yenilendi',
    });
  };

  const sendTestEmail = async () => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Test e-postası gönderildi',
        });
        await fetchNotifications();
      } else {
        throw new Error('Test email failed');
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Test e-postası gönderilemedi',
        variant: 'destructive',
      });
    }
  };

  const filteredAndSearchedNotifications = useMemo(() => {
    let filtered = notifications;
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(notification => notification.status === statusFilter);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(notification => {
        const matchesSubject = notification.subject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesEmail = notification.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesServiceNumber = notification.service?.serviceNumber?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCustomerName = notification.service?.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesSubject || matchesEmail || matchesServiceNumber || matchesCustomerName;
      });
    }
    
    return filtered;
  }, [notifications, statusFilter, searchQuery]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SERVICE_RECEIVED':
        return <Bell className="h-4 w-4" />;
      case 'CUSTOMER_APPROVAL_PENDING':
        return <CheckCircle className="h-4 w-4" />;
      case 'SERVICE_COMPLETED':
        return <Sparkles className="h-4 w-4" />;
      case 'PAYMENT_REMINDER':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'SERVICE_RECEIVED': 'Servis Alındı',
      'CUSTOMER_APPROVAL_PENDING': 'Müşteri Onayı Bekliyor',
      'SERVICE_COMPLETED': 'Servis Tamamlandı',
      'PAYMENT_REMINDER': 'Ödeme Hatırlatması',
    };
    return labels[type] || type;
  };

  useEffect(() => {
    fetchNotifications();
  }, [statusFilter]);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <SidebarNav onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Bildirimler</h1>
                    <p className="text-gray-600">SMS ve e-posta bildirimlerini yönetin</p>
                  </div>
                </div>
                <Button
                  onClick={refreshNotifications}
                  disabled={refreshing}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Yenile</span>
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Toplam Bildirim</p>
                        {loading ? (
                          <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        )}
                      </div>
                      <Bell className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Gönderilen</p>
                        {loading ? (
                          <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                          <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
                        )}
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Başarısız</p>
                        {loading ? (
                          <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                        )}
                      </div>
                      <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Bugün</p>
                        {loading ? (
                          <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                          <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
                        )}
                      </div>
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters and Search */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div>
                      <CardTitle>Bildirim Geçmişi</CardTitle>
                      <CardDescription>
                        Gönderilen tüm bildirimler ve durumları
                      </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Bildirimlerde ara..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-full sm:w-64"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                          <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tüm Durumlar</SelectItem>
                          <SelectItem value="SENT">Gönderilen</SelectItem>
                          <SelectItem value="FAILED">Başarısız</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                          <Skeleton className="h-6 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tip</TableHead>
                            <TableHead>Konu</TableHead>
                            <TableHead>Müşteri</TableHead>
                            <TableHead>E-posta</TableHead>
                            <TableHead>Servis No</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Tarih</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <AnimatePresence>
                            {filteredAndSearchedNotifications.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                  <div className="flex flex-col items-center space-y-2">
                                    <Bell className="h-12 w-12 text-gray-400" />
                                    <p className="text-gray-500">Bildirim bulunamadı</p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredAndSearchedNotifications.map((notification, index) => (
                                <motion.tr
                                  key={notification.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  transition={{ duration: 0.3, delay: index * 0.05 }}
                                  className="hover:bg-gray-50"
                                >
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      {getNotificationIcon(notification.type)}
                                      <span className="text-sm font-medium">
                                        {getNotificationTypeLabel(notification.type)}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="max-w-xs truncate">
                                    {notification.subject}
                                  </TableCell>
                                  <TableCell>
                                    {notification.service?.customer?.name || 'N/A'}
                                  </TableCell>
                                  <TableCell>{notification.customerEmail}</TableCell>
                                  <TableCell>{notification.service?.serviceNumber || 'N/A'}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={notification.status === 'SENT' ? 'default' : 'destructive'}
                                      className={
                                        notification.status === 'SENT'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-red-100 text-red-800'
                                      }
                                    >
                                      {notification.status === 'SENT' ? 'Gönderildi' : 'Başarısız'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {new Date(notification.sentAt).toLocaleDateString('tr-TR', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </TableCell>
                                </motion.tr>
                              ))
                            )}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
      <Toaster />
    </ProtectedRoute>
  );
}
