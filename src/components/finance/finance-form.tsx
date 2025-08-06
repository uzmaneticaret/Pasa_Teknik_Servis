'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, DollarSign, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  serviceNumber: string;
  customer: {
    name: string;
    phone: string;
  };
  deviceType: string;
  brand: string;
  model: string;
}

interface FinanceFormData {
  amount: string;
  type: string;
  description: string;
  serviceId: string;
}

interface FinanceFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  trigger?: React.ReactNode;
  record?: FinancialRecord | null;
}

interface FinancialRecord {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
  recordedAt: string;
  serviceId?: string | null;
  service?: {
    id: string;
    serviceNumber: string;
    customer: {
      name: string;
      phone: string;
    };
  };
}

export function FinanceForm({ onSuccess, onCancel, trigger, record }: FinanceFormProps) {
  const [formData, setFormData] = useState<FinanceFormData>({
    amount: '',
    type: '',
    description: '',
    serviceId: 'none',
  });
  
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Dialog'u record prop'u değiştiğinde otomatik aç
  useEffect(() => {
    if (record) {
      setOpen(true);
    }
  }, [record]);

  // Dialog kapatıldığında düzenlemeyi temizle
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && record) {
      // Dialog kapatıldığında düzenlemeyi iptal et
      onCancel?.();
    }
  };

  useEffect(() => {
    if (open) {
      fetchServices();
    }
  }, [open]);

  useEffect(() => {
    if (record) {
      setFormData({
        amount: record.amount.toString(),
        type: record.type.toLowerCase(),
        description: record.description || '',
        serviceId: record.serviceId || 'none',
      });
    } else {
      setFormData({
        amount: '',
        type: '',
        description: '',
        serviceId: 'none',
      });
    }
  }, [record]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services?limit=100');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url = record ? `/api/finance/${record.id}` : '/api/finance';
      const method = record ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          serviceId: formData.serviceId === 'none' ? null : formData.serviceId,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: record ? 'Finansal kayıt güncellendi' : 'Finansal kayıt oluşturuldu',
        });
        
        // Reset form
        setFormData({
          amount: '',
          type: '',
          description: '',
          serviceId: 'none',
        });
        
        setOpen(false);
        onSuccess?.();
        
        // Eğer düzenleme modundaysak, form verilerini temizle
        if (record) {
          setTimeout(() => {
            setFormData({
              amount: '',
              type: '',
              description: '',
              serviceId: 'none',
            });
          }, 300); // Dialog kapanma animasyonu için küçük bir gecikme
        }
      } else {
        const data = await response.json();
        setError(data.error || (record ? 'Finansal kayıt güncellenemedi' : 'Finansal kayıt oluşturulamadı'));
      }
    } catch (err) {
      setError('Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof FinanceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedService = services.find(s => s.id === formData.serviceId);

  if (loadingData) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger || (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kayıt
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {record ? 'Finansal Kayıtı Düzenle' : 'Yeni Finansal Kayıt'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kayıt
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {record ? 'Finansal Kayıtı Düzenle' : 'Yeni Finansal Kayıt'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Card className="border-0 shadow-none">
            <CardContent className="space-y-4 pt-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Tutar *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₺
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => handleChange('amount', e.target.value)}
                      placeholder="0.00"
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Tür *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tür seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Gelir</SelectItem>
                      <SelectItem value="expense">Gider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceId">İlişkili Servis (İsteğe Bağlı)</Label>
                <Select value={formData.serviceId} onValueChange={(value) => handleChange('serviceId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Servis seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Seçilmedi</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div>
                          <div className="font-medium">{service.serviceNumber}</div>
                          <div className="text-sm text-gray-500">
                            {service.customer.name} - {service.brand} {service.model}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedService && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="text-sm">
                    <div className="font-medium">Seçili Servis:</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {selectedService.serviceNumber} - {selectedService.customer.name}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {selectedService.brand} {selectedService.model}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Finansal işlem hakkında açıklama..."
                  rows={3}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end space-x-2 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setOpen(false);
                  onCancel?.();
                }}
                disabled={isLoading}
              >
                İptal
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !formData.amount || !formData.type}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {record ? 'Güncelleniyor...' : 'Kaydediliyor...'}
                  </>
                ) : (
                  record ? 'Güncelle' : 'Kaydet'
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </DialogContent>
    </Dialog>
  );
}