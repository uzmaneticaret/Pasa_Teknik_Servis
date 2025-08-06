'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ServiceStatusTracker } from './service-status-tracker';
import { ServiceForm } from './service-form';
import { useToast } from '@/hooks/use-toast';
import { Search, Eye, Edit, Trash2, Filter, Clock, CheckCircle, AlertTriangle, XCircle, Package, Wrench, Truck, RefreshCw, User, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Service {
  id: string;
  serviceNumber: string;
  status: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  deviceType: string;
  brand: string;
  model: string;
  problemDescription: string;
  estimatedFee?: number;
  actualFee?: number;
  createdAt: string;
  financialRecord?: {
    amount: number;
    recordedAt: string;
  };
}

interface ServiceListProps {
  onServiceSelect?: (service: Service) => void;
}

const statusOptions = [
  { value: 'ALL', label: 'Tümü', icon: Filter, color: 'gray' },
  { value: 'RECEIVED', label: 'Alındı', icon: Clock, color: 'blue' },
  { value: 'DIAGNOSIS_PENDING', label: 'Teşhis Bekliyor', icon: Search, color: 'yellow' },
  { value: 'CUSTOMER_APPROVAL_PENDING', label: 'Müşteri Onayı Bekleniyor', icon: User, color: 'orange' },
  { value: 'PARTS_PENDING', label: 'Parça Bekleniyor', icon: Package, color: 'purple' },
  { value: 'REPAIRING', label: 'Tamir Ediliyor', icon: Wrench, color: 'indigo' },
  { value: 'COMPLETED_READY_FOR_DELIVERY', label: 'Tamamlandı', icon: CheckCircle, color: 'green' },
  { value: 'DELIVERED', label: 'Teslim Edildi', icon: Truck, color: 'emerald' },
  { value: 'CANCELLED', label: 'İptal Edildi', icon: XCircle, color: 'red' },
  { value: 'RETURNED', label: 'İade', icon: RefreshCw, color: 'pink' },
];

const deviceTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
  PHONE: { label: 'Telefon', icon: Smartphone, color: 'blue' },
  LAPTOP: { label: 'Laptop', icon: Wrench, color: 'purple' },
  TABLET: { label: 'Tablet', icon: Smartphone, color: 'green' },
  DESKTOP: { label: 'Masaüstü', icon: Wrench, color: 'orange' },
  OTHER: { label: 'Diğer', icon: Wrench, color: 'gray' },
};

const statusLabels: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  RECEIVED: { label: 'Alındı', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900', icon: Clock },
  DIAGNOSIS_PENDING: { label: 'Teşhis Bekliyor', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900', icon: Search },
  CUSTOMER_APPROVAL_PENDING: { label: 'Müşteri Onayı Bekleniyor', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900', icon: User },
  PARTS_PENDING: { label: 'Parça Bekleniyor', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900', icon: Package },
  REPAIRING: { label: 'Tamir Ediliyor', color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-900', icon: Wrench },
  COMPLETED_READY_FOR_DELIVERY: { label: 'Tamamlandı', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900', icon: CheckCircle },
  DELIVERED: { label: 'Teslim Edildi', color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900', icon: Truck },
  CANCELLED: { label: 'İptal Edildi', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900', icon: XCircle },
  RETURNED: { label: 'İade', color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900', icon: RefreshCw },
};

export function ServiceList({ onServiceSelect }: ServiceListProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showStatusTracker, setShowStatusTracker] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, [page, statusFilter, search]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter && statusFilter !== 'ALL' && { status: statusFilter }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/services?${params}`);
      if (response.ok) {
        const data = await response.json();
        setServices(data.services);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Servisler yüklenirken bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Bu servisi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Servis silindi',
        });
        fetchServices();
      } else {
        throw new Error('Servis silinemedi');
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Servis silinirken bir hata oluştu',
        variant: 'destructive',
      });
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowEditForm(true);
  };

  const handleServiceUpdated = () => {
    setShowEditForm(false);
    setEditingService(null);
    fetchServices();
    toast({
      title: 'Başarılı',
      description: 'Servis güncellendi',
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchServices();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'default';
      case 'COMPLETED_READY_FOR_DELIVERY':
        return 'secondary';
      case 'CANCELLED':
      case 'RETURNED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Servis Listesi
          </h2>
          <p className="text-muted-foreground">
            Tüm servis kayıtlarını görüntüle ve yönet
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Filter className="h-5 w-5" />
              Filtreler ve Arama
            </CardTitle>
          </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Servis ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Durum filtrele" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Toplam: {services.length} servis</span>
              {(search || (statusFilter && statusFilter !== 'ALL')) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('ALL');
                    setPage(1);
                  }}
                >
                  Filtreleri Temizle
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Service List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Servis Listesi
            </CardTitle>
            <CardDescription className="text-purple-100">
              Tüm servis kayıtlarını görüntüleyin ve yönetin
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-2 p-6">
                {[...Array(5)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Servis No</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>Cihaz</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Ücret</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {services.map((service, index) => (
                        <motion.tr 
                          key={service.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950 dark:hover:to-indigo-950 transition-all duration-200"
                        >
                          <TableCell className="font-medium">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="font-mono text-blue-600 dark:text-blue-400"
                            >
                              {service.serviceNumber}
                            </motion.div>
                          </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{service.customer.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {service.customer.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {(() => {
                                const deviceInfo = deviceTypeLabels[service.deviceType];
                                const DeviceIcon = deviceInfo?.icon || Wrench;
                                return (
                                  <>
                                    <DeviceIcon className="w-4 h-4" />
                                    {deviceInfo?.label || service.deviceType}
                                  </>
                                );
                              })()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {service.brand} {service.model}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const statusInfo = statusLabels[service.status];
                            const StatusIcon = statusInfo?.icon || Clock;
                            return (
                              <Badge variant="secondary" className={`${statusInfo?.bgColor} ${statusInfo?.color} border-0`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusInfo?.label || service.status}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          {service.financialRecord
                            ? `₺${service.financialRecord.amount.toFixed(2)}`
                            : service.estimatedFee
                            ? `₺${service.estimatedFee.toFixed(2)}`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {new Date(service.createdAt).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedService(service);
                                setShowStatusTracker(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditService(service)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {onServiceSelect && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onServiceSelect(service)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteService(service.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Önceki
                  </Button>
                  <span className="flex items-center px-3">
                    Sayfa {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Sonraki
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {selectedService && (
        <Dialog open={showStatusTracker} onOpenChange={setShowStatusTracker}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Servis Durum Takibi - {selectedService.serviceNumber}
              </DialogTitle>
            </DialogHeader>
            <ServiceStatusTracker
              serviceId={selectedService.id}
              onUpdate={() => {
                fetchServices();
                setShowStatusTracker(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {editingService && (
        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Servis Düzenle - {editingService.serviceNumber}
              </DialogTitle>
            </DialogHeader>
            <ServiceForm
              service={editingService}
              onSuccess={handleServiceUpdated}
              onCancel={() => {
                setShowEditForm(false);
                setEditingService(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      </motion.div>
    </div>
  );
}