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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Loader2, 
  User, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Monitor, 
  HelpCircle,
  Wrench,
  DollarSign,
  Package,
  ArrowLeft,
  Plus,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CustomerForm } from '@/components/customers/customer-form';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface Technician {
  id: string;
  name: string;
  email: string;
}

interface Service {
  id: string;
  serviceNumber: string;
  customerId: string;
  deviceType: string;
  brand: string;
  model: string;
  serialNumber?: string;
  imei?: string;
  problemDescription: string;
  accessories?: string;
  physicalCondition?: string;
  estimatedFee?: number;
  technicianId?: string;
}

interface ServiceFormData {
  customerId: string;
  deviceType: string;
  brand: string;
  model: string;
  serialNumber?: string;
  imei?: string;
  problemDescription: string;
  accessories?: string;
  physicalCondition?: string;
  estimatedFee?: string;
  technicianId?: string;
}

interface ServiceFormProps {
  service?: Service;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const deviceTypeIcons = {
  PHONE: Smartphone,
  LAPTOP: Laptop,
  TABLET: Tablet,
  DESKTOP: Monitor,
  OTHER: HelpCircle
};

const deviceTypeLabels = {
  PHONE: 'Telefon',
  LAPTOP: 'Laptop',
  TABLET: 'Tablet',
  DESKTOP: 'Masaüstü',
  OTHER: 'Diğer'
};

export function ServiceForm({ service, onSuccess, onCancel }: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    customerId: service?.customerId || '',
    deviceType: service?.deviceType || '',
    brand: service?.brand || '',
    model: service?.model || '',
    serialNumber: service?.serialNumber || '',
    imei: service?.imei || '',
    problemDescription: service?.problemDescription || '',
    accessories: service?.accessories || '',
    physicalCondition: service?.physicalCondition || '',
    estimatedFee: service?.estimatedFee?.toString() || '',
    technicianId: service?.technicianId || 'UNASSIGNED'
  });
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCreateCustomerDialogOpen, setIsCreateCustomerDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCustomers();
    fetchTechnicians();
  }, []);

  useEffect(() => {
    // Filter customers based on search term
    if (customerSearch.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const searchTerm = customerSearch.toLowerCase();
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.phone.toLowerCase().includes(searchTerm) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm))
      );
      setFilteredCustomers(filtered);
    }
  }, [customers, customerSearch]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
        setFilteredCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

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
      // Prepare form data, converting UNASSIGNED to null for technicianId
      const submitData = {
        ...formData,
        technicianId: formData.technicianId === 'UNASSIGNED' ? null : formData.technicianId
      };

      const url = service?.id ? `/api/services/${service.id}` : '/api/services';
      const method = service?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        onSuccess?.();
      } else {
        const data = await response.json();
        setError(data.error || (service?.id ? 'Servis güncellenemedi' : 'Servis oluşturulamadı'));
      }
    } catch (err) {
      setError('Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerCreated = () => {
    setIsCreateCustomerDialogOpen(false);
    fetchCustomers(); // Refresh customer list
  };

  const handleChange = (field: keyof ServiceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'customerId') {
      const customer = customers.find(c => c.id === value);
      setSelectedCustomer(customer || null);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {service ? 'Servis Düzenle' : 'Yeni Servis Kaydı'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {service ? 'Servis kaydını güncelleyin' : 'Teknik servis için yeni kayıt oluşturun'}
              </p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Customer Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <Card className="border-0 shadow-lg h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Müşteri Bilgileri
                  </CardTitle>
                  <CardDescription>
                    Servis için müşteri seçin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="customerId">Müşteri *</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Müşteri ara..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="pl-10 h-11"
                        onFocus={() => {
                          if (customerSearch.trim() === '') {
                            setFilteredCustomers(customers);
                          }
                        }}
                      />
                    </div>
                    
                    {/* Filtered customers dropdown */}
                    {customerSearch.trim() !== '' && (
                      <div className="border rounded-md shadow-sm bg-white dark:bg-gray-800 max-h-60 overflow-y-auto">
                        {filteredCustomers.length > 0 ? (
                          filteredCustomers.map((customer) => (
                            <div
                              key={customer.id}
                              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b last:border-b-0 transition-colors"
                              onClick={() => {
                                handleChange('customerId', customer.id);
                                setCustomerSearch('');
                              }}
                            >
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-gray-500">{customer.phone}</div>
                              {customer.email && (
                                <div className="text-xs text-gray-400">{customer.email}</div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-gray-500">
                            Arama kriterine uygun müşteri bulunamadı
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Select value={formData.customerId} onValueChange={(value) => handleChange('customerId', value)}>
                        <SelectTrigger className="h-11 flex-1">
                          <SelectValue placeholder="Müşteri seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              <div>
                                <div className="font-medium">{customer.name}</div>
                                <div className="text-sm text-gray-500">{customer.phone}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Dialog open={isCreateCustomerDialogOpen} onOpenChange={setIsCreateCustomerDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" className="h-11 w-11 flex-shrink-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Yeni Müşteri Oluştur</DialogTitle>
                          </DialogHeader>
                          <CustomerForm 
                            onSuccess={handleCustomerCreated}
                            onCancel={() => setIsCreateCustomerDialogOpen(false)}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {selectedCustomer && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {selectedCustomer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {selectedCustomer.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedCustomer.phone}
                          </p>
                          {selectedCustomer.email && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {selectedCustomer.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Device and Service Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Device Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    Cihaz Bilgileri
                  </CardTitle>
                  <CardDescription>
                    Servis edilecek cihazın detayları
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deviceType">Cihaz Tipi *</Label>
                      <Select value={formData.deviceType} onValueChange={(value) => handleChange('deviceType', value)}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Cihaz tipi seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(deviceTypeLabels).map(([key, label]) => {
                            const Icon = deviceTypeIcons[key as keyof typeof deviceTypeIcons];
                            return (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  {label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="brand">Marka *</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => handleChange('brand', e.target.value)}
                        placeholder="Örn: Apple, Samsung"
                        className="h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => handleChange('model', e.target.value)}
                      placeholder="Örn: iPhone 13, Galaxy S21"
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="serialNumber">Seri Numarası</Label>
                      <Input
                        id="serialNumber"
                        value={formData.serialNumber}
                        onChange={(e) => handleChange('serialNumber', e.target.value)}
                        placeholder="Cihaz seri numarası"
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="imei">IMEI</Label>
                      <Input
                        id="imei"
                        value={formData.imei}
                        onChange={(e) => handleChange('imei', e.target.value)}
                        placeholder="Telefon IMEI numarası"
                        className="h-11"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Problem Description */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-orange-600" />
                    Sorun ve Aksesuar Bilgileri
                  </CardTitle>
                  <CardDescription>
                    Cihazın sorunu ve teslim edilen aksesuarlar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="problemDescription">Sorun Açıklaması *</Label>
                    <Textarea
                      id="problemDescription"
                      value={formData.problemDescription}
                      onChange={(e) => handleChange('problemDescription', e.target.value)}
                      placeholder="Cihazın ne sorunu var? Detaylı açıklayın..."
                      rows={4}
                      className="resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accessories">Aksesuarlar</Label>
                      <Textarea
                        id="accessories"
                        value={formData.accessories}
                        onChange={(e) => handleChange('accessories', e.target.value)}
                        placeholder="Şarj cihazı, kulaklık, kılıf vb."
                        rows={3}
                        className="resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="physicalCondition">Fiziksel Durum</Label>
                      <Textarea
                        id="physicalCondition"
                        value={formData.physicalCondition}
                        onChange={(e) => handleChange('physicalCondition', e.target.value)}
                        placeholder="Çizikler, kırıklar, ekran durumu vb."
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Ücret ve Teknisyen
                  </CardTitle>
                  <CardDescription>
                    Tahmini ücret ve atama bilgileri
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estimatedFee">Tahmini Ücret</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ₺
                        </span>
                        <Input
                          id="estimatedFee"
                          type="number"
                          step="0.01"
                          value={formData.estimatedFee}
                          onChange={(e) => handleChange('estimatedFee', e.target.value)}
                          placeholder="0.00"
                          className="pl-8 h-11"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="technicianId">Teknisyen</Label>
                      <Select value={formData.technicianId} onValueChange={(value) => handleChange('technicianId', value)}>
                        <SelectTrigger className="h-11">
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
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel} className="h-11 px-6">
                    İptal
                  </Button>
                )}
                <Button 
                  type="submit" 
                  className="h-11 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {service ? 'Güncelleniyor...' : 'Oluşturuluyor...'}
                    </>
                  ) : (
                    service ? 'Servis Güncelle' : 'Servis Kaydı Oluştur'
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}