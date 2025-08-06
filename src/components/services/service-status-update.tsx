'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface Technician {
  id: string;
  name: string;
  email: string;
}

interface Service {
  id: string;
  serviceNumber: string;
  status: string;
  deviceType: string;
  brand: string;
  model: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  technician?: {
    id: string;
    name: string;
  };
  estimatedFee?: number;
  actualFee?: number;
}

interface ServiceStatusUpdateProps {
  service: Service;
  onSuccess?: () => void;
  onCancel?: () => void;
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

const statusFlow = {
  RECEIVED: ['DIAGNOSIS_PENDING', 'CANCELLED'],
  DIAGNOSIS_PENDING: ['CUSTOMER_APPROVAL_PENDING', 'REPAIRING', 'CANCELLED'],
  CUSTOMER_APPROVAL_PENDING: ['REPAIRING', 'CANCELLED'],
  PARTS_PENDING: ['REPAIRING', 'CANCELLED'],
  REPAIRING: ['COMPLETED_READY_FOR_DELIVERY', 'PARTS_PENDING', 'CANCELLED'],
  COMPLETED_READY_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  RETURNED: []
};

export function ServiceStatusUpdate({ service, onSuccess, onCancel }: ServiceStatusUpdateProps) {
  const [status, setStatus] = useState(service.status);
  const [notes, setNotes] = useState('');
  const [technicianId, setTechnicianId] = useState(service.technician?.id || 'UNASSIGNED');
  const [actualFee, setActualFee] = useState(service.actualFee?.toString() || '');
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      const response = await fetch('/api/users?role=TECHNICIAN');
      if (response.ok) {
        const data = await response.json();
        setTechnicians(data);
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/services/${service.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          notes,
          technicianId: technicianId === 'UNASSIGNED' ? null : technicianId,
          actualFee: status === 'DELIVERED' ? actualFee : null
        }),
      });

      if (response.ok) {
        onSuccess?.();
      } else {
        const data = await response.json();
        setError(data.error || 'Durum güncellenemedi');
      }
    } catch (err) {
      setError('Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const availableStatuses = statusFlow[service.status as keyof typeof statusFlow] || [];

  if (loadingData) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Servis Durumu Güncelle</CardTitle>
        <CardDescription>
          Servis #{service.serviceNumber} durumunu güncelleyin
        </CardDescription>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Mevcut Durum:</span>
          <Badge className={statusColors[service.status as keyof typeof statusColors]}>
            {statusLabels[service.status as keyof typeof statusLabels]}
          </Badge>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Service Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Müşteri:</span> {service.customer.name}
              </div>
              <div>
                <span className="font-medium">Cihaz:</span> {service.brand} {service.model}
              </div>
              <div>
                <span className="font-medium">Telefon:</span> {service.customer.phone}
              </div>
              {service.estimatedFee && (
                <div>
                  <span className="font-medium">Tahmini Ücret:</span> ₺{service.estimatedFee}
                </div>
              )}
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Yeni Durum *</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((statusOption) => (
                  <SelectItem key={statusOption} value={statusOption}>
                    {statusLabels[statusOption as keyof typeof statusLabels]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Technician Assignment */}
          <div className="space-y-2">
            <Label htmlFor="technicianId">Teknisyen</Label>
            <Select value={technicianId} onValueChange={setTechnicianId}>
              <SelectTrigger>
                <SelectValue placeholder="Teknisyen seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNASSIGNED">Atanmamış</SelectItem>
                {technicians.map((technician) => (
                  <SelectItem key={technician.id} value={technician.id}>
                    {technician.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actual Fee (only for delivered status) */}
          {status === 'DELIVERED' && (
            <div className="space-y-2">
              <Label htmlFor="actualFee">Gerçekleşen Ücret *</Label>
              <Input
                id="actualFee"
                type="number"
                step="0.01"
                value={actualFee}
                onChange={(e) => setActualFee(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Durum değişikliği hakkında notlar..."
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              İptal
            </Button>
          )}
          <Button type="submit" disabled={isLoading || !status}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Güncelleniyor...
              </>
            ) : (
              'Güncelle'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}