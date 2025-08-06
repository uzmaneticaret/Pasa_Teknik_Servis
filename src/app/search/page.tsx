'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { useAuth } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search as SearchIcon, Filter, Eye, Calendar } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'service' | 'customer';
  title: string;
  description: string;
  details: any;
  createdAt: string;
}

const deviceTypeLabels: Record<string, string> = {
  PHONE: 'Telefon',
  LAPTOP: 'Laptop',
  TABLET: 'Tablet',
  DESKTOP: 'Masaüstü',
  OTHER: 'Diğer',
};

const statusLabels: Record<string, string> = {
  RECEIVED: 'Alındı',
  DIAGNOSIS_PENDING: 'Teşhis Bekliyor',
  CUSTOMER_APPROVAL_PENDING: 'Müşteri Onayı Bekleniyor',
  PARTS_PENDING: 'Parça Bekleniyor',
  REPAIRING: 'Tamir Ediliyor',
  COMPLETED_READY_FOR_DELIVERY: 'Tamamlandı',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
  RETURNED: 'İade',
};

export default function SearchPage() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('quick');

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Çıkış başarılı',
      description: 'Güvenli bir şekilde çıkış yapıldı',
    });
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Hata',
        description: 'Lütfen bir arama terimi girin',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Search services
      const serviceParams = new URLSearchParams({
        search: searchQuery,
        limit: '50',
      });

      const [serviceResponse, customerResponse] = await Promise.all([
        fetch(`/api/services?${serviceParams}`),
        fetch(`/api/customers?${serviceParams}`),
      ]);

      const searchResults: SearchResult[] = [];

      if (serviceResponse.ok) {
        const serviceData = await serviceResponse.json();
        serviceData.services.forEach((service: any) => {
          searchResults.push({
            id: service.id,
            type: 'service',
            title: `Servis #${service.serviceNumber}`,
            description: `${service.customer.name} - ${service.brand} ${service.model}`,
            details: service,
            createdAt: service.createdAt,
          });
        });
      }

      if (customerResponse.ok) {
        const customerData = await customerResponse.json();
        customerData.customers.forEach((customer: any) => {
          searchResults.push({
            id: customer.id,
            type: 'customer',
            title: customer.name,
            description: `${customer.phone} ${customer.email ? `- ${customer.email}` : ''}`,
            details: customer,
            createdAt: customer.createdAt,
          });
        });
      }

      // Sort by creation date (newest first)
      searchResults.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setResults(searchResults);
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Arama yapılırken bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (type: string, query: string) => {
    setSearchType(type);
    setSearchQuery(query);
    setActiveTab('advanced');
    setTimeout(() => performSearch(), 100);
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
    <ProtectedRoute>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <SidebarNav onLogout={handleLogout} />
        </div>
        <div className="flex flex-col">
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gelişmiş Arama</h1>
              <p className="text-muted-foreground">
                Servis numarası, müşteri adı, telefon veya cihaz bilgileriyle arama yapın
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="quick">Hızlı Arama</TabsTrigger>
                <TabsTrigger value="advanced">Gelişmiş Arama</TabsTrigger>
              </TabsList>

              <TabsContent value="quick" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Hızlı Arama Seçenekleri</CardTitle>
                    <CardDescription>
                      Sık kullanılan arama filtreleri
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card 
                        className="cursor-pointer hover:shadow-md transition-shadow p-4"
                        onClick={() => handleQuickSearch('all', '')}
                      >
                        <div className="text-center">
                          <SearchIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <h3 className="font-medium">Tüm Kayıtlar</h3>
                          <p className="text-sm text-muted-foreground">Son 50 kayıt</p>
                        </div>
                      </Card>
                      
                      <Card 
                        className="cursor-pointer hover:shadow-md transition-shadow p-4"
                        onClick={() => handleQuickSearch('service', 'DELIVERED')}
                      >
                        <div className="text-center">
                          <div className="h-8 w-8 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600">✓</span>
                          </div>
                          <h3 className="font-medium">Teslim Edilenler</h3>
                          <p className="text-sm text-muted-foreground">Tamamlanan servisler</p>
                        </div>
                      </Card>

                      <Card 
                        className="cursor-pointer hover:shadow-md transition-shadow p-4"
                        onClick={() => handleQuickSearch('service', 'RECEIVED')}
                      >
                        <div className="text-center">
                          <div className="h-8 w-8 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600">📥</span>
                          </div>
                          <h3 className="font-medium">Yeni Kayıtlar</h3>
                          <p className="text-sm text-muted-foreground">Alınan servisler</p>
                        </div>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Arama Parametreleri</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Servis numarası, müşteri adı, telefon veya cihaz bilgileri..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                      />
                      <Select value={searchType} onValueChange={setSearchType}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tümü</SelectItem>
                          <SelectItem value="service">Servisler</SelectItem>
                          <SelectItem value="customer">Müşteriler</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={performSearch} disabled={loading}>
                        <SearchIcon className="mr-2 h-4 w-4" />
                        {loading ? 'Aranıyor...' : 'Ara'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {results.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Arama Sonuçları</CardTitle>
                      <CardDescription>
                        {results.length} sonuç bulundu
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {results.map((result) => (
                          <div key={result.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant={result.type === 'service' ? 'default' : 'secondary'}>
                                    {result.type === 'service' ? 'Servis' : 'Müşteri'}
                                  </Badge>
                                  <h3 className="font-medium">{result.title}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {result.description}
                                </p>
                                
                                {result.type === 'service' && (
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                    <div>
                                      <span className="font-medium">Cihaz:</span>
                                      <span className="ml-1">
                                        {deviceTypeLabels[result.details.deviceType] || result.details.deviceType}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-medium">Marka:</span>
                                      <span className="ml-1">{result.details.brand}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium">Model:</span>
                                      <span className="ml-1">{result.details.model}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium">Durum:</span>
                                      <Badge 
                                        variant={getStatusBadgeVariant(result.details.status)} 
                                        className="ml-1 text-xs"
                                      >
                                        {statusLabels[result.details.status] || result.details.status}
                                      </Badge>
                                    </div>
                                  </div>
                                )}

                                {result.type === 'customer' && (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                                    <div>
                                      <span className="font-medium">Telefon:</span>
                                      <span className="ml-1">{result.details.phone}</span>
                                    </div>
                                    {result.details.email && (
                                      <div>
                                        <span className="font-medium">Email:</span>
                                        <span className="ml-1">{result.details.email}</span>
                                      </div>
                                    )}
                                    <div>
                                      <span className="font-medium">Servis Sayısı:</span>
                                      <span className="ml-1">{result.details._count?.services || 0}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(result.createdAt).toLocaleDateString('tr-TR')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {results.length === 0 && searchQuery && !loading && (
                  <Card>
                    <CardContent className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground">
                        "{searchQuery}" için sonuç bulunamadı
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
      <Toaster />
    </ProtectedRoute>
  );
}