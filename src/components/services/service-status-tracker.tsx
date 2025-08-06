'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Clock, MessageSquare, Edit } from 'lucide-react';

interface ServiceStatusHistory {
  id: string;
  status: string;
  notes?: string;
  changedBy: string;
  changedAt: string;
}

interface Service {
  id: string;
  serviceNumber: string;
  status: string;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  deviceType: string;
  brand: string;
  model: string;
  statusHistory: ServiceStatusHistory[];
}

interface ServiceStatusTrackerProps {
  serviceId: string;
  onUpdate?: () => void;
}

const statusLabels: Record<string, string> = {
  RECEIVED: 'Alındı',
  DIAGNOSIS_PENDING: 'Teşhis Bekliyor',
  CUSTOMER_APPROVAL_PENDING: 'Müşteri Onayı Bekleniyor',
  PARTS_PENDING: 'Parça Bekleniyor',
  REPAIRING: 'Tamir Ediliyor',
  COMPLETED_READY_FOR_DELIVERY: 'Tamamlandı - Teslime Hazır',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
  RETURNED: 'İade',
};

const statusOptions = [
  { value: 'RECEIVED', label: 'Alındı' },
  { value: 'DIAGNOSIS_PENDING', label: 'Teşhis Bekliyor' },
  { value: 'CUSTOMER_APPROVAL_PENDING', label: 'Müşteri Onayı Bekleniyor' },
  { value: 'PARTS_PENDING', label: 'Parça Bekleniyor' },
  { value: 'REPAIRING', label: 'Tamir Ediliyor' },
  { value: 'COMPLETED_READY_FOR_DELIVERY', label: 'Tamamlandı - Teslime Hazır' },
  { value: 'DELIVERED', label: 'Teslim Edildi' },
  { value: 'CANCELLED', label: 'İptal Edildi' },
  { value: 'RETURNED', label: 'İade' },
];

export function ServiceStatusTracker({ serviceId, onUpdate }: ServiceStatusTrackerProps) {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [actualFee, setActualFee] = useState('');
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/services/${serviceId}`);
      if (response.ok) {
        const data = await response.json();
        setService(data);
        setNewStatus(data.status);
        setActualFee(data.actualFee?.toString() || '');
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Servis bilgileri yüklenirken bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast({
        title: 'Hata',
        description: 'Lütfen bir durum seçin',
        variant: 'destructive',
      });
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notes,
          actualFee: actualFee ? parseFloat(actualFee) : undefined,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Servis durumu güncellendi',
        });
        setShowUpdateDialog(false);
        setNotes('');
        fetchService();
        onUpdate?.();
      } else {
        throw new Error('Durum güncellenemedi');
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Servis durumu güncellenirken bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!service) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Servis bilgileri yüklenemedi
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Mevcut Durum
          </CardTitle>
          <CardDescription>
            Servis #{service.serviceNumber} için mevcut durum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant={getStatusBadgeVariant(service.status)} className="text-lg px-3 py-1">
                {statusLabels[service.status] || service.status}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                {service.customer.name} - {service.brand} {service.model}
              </p>
            </div>
            <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Durum Güncelle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Servis Durumunu Güncelle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Yeni Durum</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Durum seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(newStatus === 'DELIVERED' || newStatus === 'COMPLETED_READY_FOR_DELIVERY') && (
                    <div className="space-y-2">
                      <Label>Gerçekleşen Ücret (₺)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={actualFee}
                        onChange={(e) => setActualFee(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Notlar</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Durum değişikliği hakkında notlar..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
                      İptal
                    </Button>
                    <Button onClick={handleStatusUpdate} disabled={updating}>
                      {updating ? 'Güncelleniyor...' : 'Güncelle'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Status History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Durum Geçmişi
          </CardTitle>
          <CardDescription>
            Servis durum değişikliklerinin geçmişi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {service.statusHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Henüz durum geçmişi bulunmuyor
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Durum</TableHead>
                  <TableHead>Notlar</TableHead>
                  <TableHead>Değiştiren</TableHead>
                  <TableHead>Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {service.statusHistory.map((history) => (
                  <TableRow key={history.id}>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(history.status)}>
                        {statusLabels[history.status] || history.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {history.notes || '-'}
                    </TableCell>
                    <TableCell>{history.changedBy}</TableCell>
                    <TableCell>
                      {new Date(history.changedAt).toLocaleString('tr-TR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}