'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Settings, Bell, Database, Shield, Palette, Home, Mail, Menu, X, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { useAuth } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { motion, AnimatePresence } from 'framer-motion';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  currency: string;
  timezone: string;
  language: string;
  notifications: {
    email: boolean;
    browser: boolean;
    serviceUpdates: boolean;
    financialUpdates: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
  };
  smtp: {
    host: string;
    port: number;
    username: string;
    password: string;
    fromEmail: string;
    fromName: string;
    secure: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'PAŞA Servis',
    siteDescription: 'Profesyonel Servis Yönetim Sistemi',
    contactEmail: 'info@pasaservis.com',
    contactPhone: '+90 (555) 123-4567',
    currency: 'TRY',
    timezone: 'Europe/Istanbul',
    language: 'tr',
    notifications: {
      email: true,
      browser: true,
      serviceUpdates: true,
      financialUpdates: true,
    },
    appearance: {
      theme: 'auto',
      primaryColor: '#3B82F6',
    },
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      username: '',
      password: '',
      fromEmail: 'noreply@pasaservis.com',
      fromName: 'PAŞA Servis',
      secure: true,
    },
  });
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Çıkış başarılı',
      description: 'Güvenli bir şekilde çıkış yapıldı',
    });
    router.push('/login');
  };
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // In a real application, this would save to an API
      // For now, we'll just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage for persistence
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      
      setSuccess('Ayarlar başarıyla kaydedildi');
      toast({
        title: 'Başarılı',
        description: 'Ayarlar başarıyla kaydedildi',
      });
    } catch (err) {
      setError('Ayarlar kaydedilirken bir hata oluştu');
      toast({
        title: 'Hata',
        description: 'Ayarlar kaydedilirken bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('systemSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Ensure all nested objects exist
        setSettings({
          ...parsed,
          notifications: {
            email: true,
            browser: true,
            serviceUpdates: true,
            financialUpdates: true,
            ...parsed.notifications
          },
          appearance: {
            theme: 'auto',
            primaryColor: '#3B82F6',
            ...parsed.appearance
          },
          smtp: {
            host: 'smtp.gmail.com',
            port: 587,
            username: '',
            password: '',
            fromEmail: 'info@pasa.com',
            fromName: 'PAŞA Servis',
            secure: true,
            ...parsed.smtp
          }
        });
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  useEffect(() => {
    // Clear any potentially corrupted localStorage data
    const corruptedSettings = localStorage.getItem('systemSettings');
    if (corruptedSettings) {
      try {
        JSON.parse(corruptedSettings);
      } catch (e) {
        console.log('Clearing corrupted settings data');
        localStorage.removeItem('systemSettings');
      }
    }
    loadSettings();
  }, []);

  const updateNotificationSetting = (key: keyof SystemSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...(prev.notifications || {
          email: true,
          browser: true,
          serviceUpdates: true,
          financialUpdates: true,
        }),
        [key]: value,
      },
    }));
  };

  const updateAppearanceSetting = (key: keyof SystemSettings['appearance'], value: string) => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...(prev.appearance || {
          theme: 'auto',
          primaryColor: '#3B82F6',
        }),
        [key]: value,
      },
    }));
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
            <p className="text-muted-foreground">
              Sistem ayarlarını yönetin ve yapılandırın
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Anasayfa
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Kaydet
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Genel Ayarlar
              </CardTitle>
              <CardDescription>
                Sistem genel ayarları
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Adı</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  placeholder="Site adı"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Açıklaması</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  placeholder="Site açıklaması"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">İletişim E-posta</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="E-posta adresi"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">İletişim Telefon</Label>
                  <Input
                    id="contactPhone"
                    value={settings.contactPhone}
                    onChange={(e) => setSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="Telefon numarası"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Para Birimi</Label>
                  <Select value={settings.currency} onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRY">Türk Lirası (₺)</SelectItem>
                      <SelectItem value="USD">ABD Doları ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Saat Dilimi</Label>
                  <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Istanbul">İstanbul</SelectItem>
                      <SelectItem value="Europe/Ankara">Ankara</SelectItem>
                      <SelectItem value="Europe/Izmir">İzmir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Dil</Label>
                <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tr">Türkçe</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Bildirim Ayarları
              </CardTitle>
              <CardDescription>
                Bildirim tercihlerini yönetin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>E-posta Bildirimleri</Label>
                  <p className="text-sm text-muted-foreground">
                    Önemli olaylar hakkında e-posta bildirimi alın
                  </p>
                </div>
                <Switch
                  checked={settings.notifications?.email || false}
                  onCheckedChange={(checked) => updateNotificationSetting('email', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tarayıcı Bildirimleri</Label>
                  <p className="text-sm text-muted-foreground">
                    Tarayıcı üzerinden bildirim alın
                  </p>
                </div>
                <Switch
                  checked={settings.notifications?.browser || false}
                  onCheckedChange={(checked) => updateNotificationSetting('browser', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Servis Güncellemeleri</Label>
                  <p className="text-sm text-muted-foreground">
                    Servis durumu değişiklikleri hakkında bildirim
                  </p>
                </div>
                <Switch
                  checked={settings.notifications?.serviceUpdates || false}
                  onCheckedChange={(checked) => updateNotificationSetting('serviceUpdates', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Finansal Güncellemeler</Label>
                  <p className="text-sm text-muted-foreground">
                    Gelir-gider işlemleri hakkında bildirim
                  </p>
                </div>
                <Switch
                  checked={settings.notifications?.financialUpdates || false}
                  onCheckedChange={(checked) => updateNotificationSetting('financialUpdates', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Görünüm Ayarları
              </CardTitle>
              <CardDescription>
                Sistem görünümünü özelleştirin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tema</Label>
                <Select 
                  value={settings.appearance?.theme || 'auto'} 
                  onValueChange={(value) => updateAppearanceSetting('theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Açık</SelectItem>
                    <SelectItem value="dark">Koyu</SelectItem>
                    <SelectItem value="auto">Otomatik</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ana Renk</Label>
                <div className="flex gap-2">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        settings.appearance?.primaryColor === color ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateAppearanceSetting('primaryColor', color)}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SMTP Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                SMTP E-posta Ayarları
              </CardTitle>
              <CardDescription>
                E-posta gönderimi için SMTP sunucu ayarları
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Sunucu</Label>
                  <Input
                    id="smtpHost"
                    value={settings.smtp?.host || ''}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      smtp: { ...(prev.smtp || {}), host: e.target.value }
                    }))}
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={settings.smtp?.port || 587}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      smtp: { ...(prev.smtp || {}), port: parseInt(e.target.value) || 587 }
                    }))}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">Kullanıcı Adı</Label>
                  <Input
                    id="smtpUsername"
                    value={settings.smtp?.username || ''}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      smtp: { ...(prev.smtp || {}), username: e.target.value }
                    }))}
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">Şifre</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.smtp?.password || ''}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      smtp: { ...(prev.smtp || {}), password: e.target.value }
                    }))}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">Gönderici E-posta</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={settings.smtp?.fromEmail || ''}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      smtp: { ...(prev.smtp || {}), fromEmail: e.target.value }
                    }))}
                    placeholder="noreply@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromName">Gönderici Adı</Label>
                  <Input
                    id="fromName"
                    value={settings.smtp?.fromName || ''}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      smtp: { ...(prev.smtp || {}), fromName: e.target.value }
                    }))}
                    placeholder="PAŞA Servis"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Güvenli Bağlantı (SSL/TLS)</Label>
                  <p className="text-sm text-muted-foreground">
                    SMTP sunucusu için güvenli bağlantı kullan
                  </p>
                </div>
                <Switch
                  checked={settings.smtp?.secure || false}
                  onCheckedChange={(checked) => setSettings(prev => ({ 
                    ...prev, 
                    smtp: { ...(prev.smtp || {}), secure: checked }
                  }))}
                />
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Not:</strong> Gmail için SMTP ayarları: Sunucu: smtp.gmail.com, Port: 587, 
                  Güvenli bağlantı: Aktif. Google Hesabınızda "daha az güvenli uygulama erişimi"ni etkinleştirmeniz gerekebilir.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Sistem Bilgileri
              </CardTitle>
              <CardDescription>
                Sistem hakkında teknik bilgiler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Versiyon</Label>
                  <p className="text-sm">1.0.0</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Son Güncelleme</Label>
                  <p className="text-sm">{new Date().toLocaleDateString('tr-TR')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Çalışma Zamanı</Label>
                  <p className="text-sm">Node.js</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Veritabanı</Label>
                  <p className="text-sm">SQLite</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Aktif Özellikler</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Servis Yönetimi</Badge>
                  <Badge variant="secondary">Müşteri Yönetimi</Badge>
                  <Badge variant="secondary">Finans Takibi</Badge>
                  <Badge variant="secondary">Bildirimler</Badge>
                  <Badge variant="secondary">Arama</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}