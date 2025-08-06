'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Wrench, User } from 'lucide-react';

interface Service {
  id: string;
  serviceNumber: string;
  deviceType: string;
  brand: string;
  model: string;
  status: string;
  problemDescription: string;
  createdAt: string;
  completedAt?: string;
  deliveredAt?: string;
  technician?: {
    name: string;
    email: string;
  };
}

interface CustomerHistoryProps {
  customerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const deviceTypeLabels = {
  PHONE: 'Telefon',
  LAPTOP: 'Laptop',
  TABLET: 'Tablet',
  DESKTOP: 'Masaüstü',
  OTHER: 'Diğer'
};

export function CustomerHistory({ customerId, open, onOpenChange }: CustomerHistoryProps) {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && customerId) {
      fetchCustomerDetails();
    }
  }, [open, customerId]);

  const fetchCustomerDetails = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer?.name} - Servis Geçmişi
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : customer ? (
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Müşteri Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Ad Soyad</p>
                    <p className="font-medium">{customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Telefon</p>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                  {customer.email && (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{customer.email}</p>
                    </div>
                  )}
                  {customer.address && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Adres</p>
                      <p className="font-medium">{customer.address}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Servis Kayıtları ({customer.services.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customer.services.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Bu müşteriye ait servis kaydı bulunamadı
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Servis No</TableHead>
                        <TableHead>Cihaz</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Teknisyen</TableHead>
                        <TableHead>Tarih</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customer.services.map((service: Service) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">
                            {service.serviceNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {deviceTypeLabels[service.deviceType as keyof typeof deviceTypeLabels]}
                              </p>
                              <p className="text-sm text-gray-500">
                                {service.brand} {service.model}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[service.status as keyof typeof statusColors]}>
                              {statusLabels[service.status as keyof typeof statusLabels]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {service.technician ? service.technician.name : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-4 w-4" />
                              {new Date(service.createdAt).toLocaleDateString('tr-TR')}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <p>Müşteri bilgileri yüklenemedi</p>
        )}
      </DialogContent>
    </Dialog>
  );
}