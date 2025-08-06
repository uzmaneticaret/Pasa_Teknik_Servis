'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { useAuth } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
  Treemap,
  FunnelChart,
  Funnel
} from 'recharts';
import { 
  ArrowLeft, 
  RefreshCw, 
  Download, 
  Users, 
  TrendingUp, 
  Star, 
  Award, 
  Target,
  Menu,
  X,
  UserCheck,
  Sparkles,
  BarChart3,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Activity,
  Zap,
  Clock,
  UserX,
  AlertTriangle,
  ThumbsUp,
  Eye,
  Share2,
  MessageSquare,
  Gift,
  Crown,
  Shield,
  Gem,
  Medal,
  Trophy,
  PieChart as PieChartIcon,
  TrendingUp as TrendingIcon,
  Map,
  Heart,
  ShoppingCart,
  Repeat,
  UserPlus,
  MinusCircle,
  PlusCircle
} from 'lucide-react';
import Link from 'next/link';

interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceCount: number;
  totalSpent: number;
  lastService: string;
  averageSpent: number;
  daysSinceLastService: number;
  satisfaction?: number;
  npsScore?: number;
  referralCount?: number;
  preferredServices?: string[];
  communicationPreference?: string;
  riskScore?: number;
}

interface AnalyticsData {
  loyalty?: {
    loyaltyLevels: {
      bronze: CustomerData[];
      silver: CustomerData[];
      gold: CustomerData[];
      platinum: CustomerData[];
      diamond: CustomerData[];
    };
    rewards: Array<{
      level: string;
      minServices: number;
      minSpent: number;
      reward: string;
      description: string;
      benefits: string[];
    }>;
    summary: {
      totalCustomers: number;
      bronzeCount: number;
      silverCount: number;
      goldCount: number;
      platinumCount: number;
      diamondCount: number;
      averageLoyaltyScore: number;
      retentionRate: number;
    };
    progression: Array<{
      level: string;
      customers: number;
      revenue: number;
      growth: number;
    }>;
  };
  segmentation?: {
    segments: {
      champions: CustomerData[];
      loyalCustomers: CustomerData[];
      potentialLoyalists: CustomerData[];
      newCustomers: CustomerData[];
      atRisk: CustomerData[];
      lost: CustomerData[];
      hibernating: CustomerData[];
      priceSensitive: CustomerData[];
      needsAttention: CustomerData[];
    };
    rfmMatrix: Array<{
      recency: number;
      frequency: number;
      monetary: number;
      segment: string;
      count: number;
    }>;
    summary: {
      totalCustomers: number;
      championsCount: number;
      loyalCustomersCount: number;
      potentialLoyalistsCount: number;
      newCustomersCount: number;
      atRiskCount: number;
      lostCount: number;
      hibernatingCount: number;
      priceSensitiveCount: number;
      needsAttentionCount: number;
    };
    behaviorPatterns: Array<{
      pattern: string;
      description: string;
      customers: number;
      revenue: number;
      trend: 'up' | 'down' | 'stable';
    }>;
  };
  retention?: {
    monthlyData: Array<{
      month: string;
      newCustomers: number;
      returningCustomers: number;
      totalCustomers: number;
      totalRevenue: number;
      retentionRate: number;
      churnRate: number;
      customerLifetimeValue: number;
    }>;
    customerLifetimes: Array<{
      customerId: string;
      lifetime: number;
      serviceCount: number;
      totalSpent: number;
      segment: string;
    }>;
    churnPredictions: Array<{
      customerId: string;
      customerName: string;
      churnProbability: number;
      riskFactors: string[];
      recommendedActions: string[];
    }>;
    summary: {
      averageLifetime: number;
      totalCustomers: number;
      averageServicesPerCustomer: number;
      customerLifetimeValue: number;
      churnRate: number;
      retentionRate: number;
    };
    cohortAnalysis: Array<{
      cohort: string;
      month0: number;
      month1: number;
      month2: number;
      month3: number;
      month6: number;
      month12: number;
    }>;
  };
  satisfaction?: {
    surveys: Array<{
      period: string;
      responseRate: number;
      averageSatisfaction: number;
      npsScore: number;
      promoters: number;
      passives: number;
      detractors: number;
    }>;
    feedback: Array<{
      category: string;
      sentiment: 'positive' | 'neutral' | 'negative';
      count: number;
      trend: number;
      keywords: string[];
    }>;
    summary: {
      totalSurveys: number;
      averageResponseRate: number;
      overallSatisfaction: number;
      npsScore: number;
    };
  };
  predictions?: {
    nextMonth: {
      expectedNewCustomers: number;
      expectedChurn: number;
      expectedRevenue: number;
      topSegments: Array<{
        segment: string;
        growth: number;
      }>;
    };
    recommendations: Array<{
      type: 'retention' | 'upsell' | 'engagement' | 'recovery';
      priority: 'high' | 'medium' | 'low';
      targetSegment: string;
      action: string;
      expectedImpact: string;
      timeline: string;
    }>;
  };
}

const COLORS = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
  champions: '#0088FE',
  loyal: '#00C49F',
  potential: '#FFBB28',
  new: '#FF8042',
  risk: '#FF6B6B',
  lost: '#8B8B8B',
  hibernating: '#DDA0DD',
  priceSensitive: '#98D8C8',
  needsAttention: '#F7DC6F'
};

const SEGMENT_COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
  '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
];

export default function CustomerAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);
  const [analysisType, setAnalysisType] = useState('comprehensive');
  const [timeRange, setTimeRange] = useState('6months');
  const [activeTab, setActiveTab] = useState('overview');
  const [isRealTime, setIsRealTime] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchAnalyticsData();
    
    if (isRealTime) {
      const interval = setInterval(() => {
        fetchAnalyticsData();
        setLastUpdate(new Date());
      }, 45000); // Update every 45 seconds
      
      return () => clearInterval(interval);
    }
  }, [analysisType, timeRange, isRealTime]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: analysisType,
        timeRange: timeRange,
      });

      const response = await fetch(`/api/customer-analytics?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getLoyaltyChartData = () => {
    if (!analyticsData.loyalty?.summary) return [];
    
    return [
      { name: 'Bronze', value: analyticsData.loyalty.summary.bronzeCount, color: COLORS.bronze },
      { name: 'Silver', value: analyticsData.loyalty.summary.silverCount, color: COLORS.silver },
      { name: 'Gold', value: analyticsData.loyalty.summary.goldCount, color: COLORS.gold },
      { name: 'Platinum', value: analyticsData.loyalty.summary.platinumCount, color: COLORS.platinum },
      { name: 'Diamond', value: analyticsData.loyalty.summary.diamondCount || 0, color: COLORS.diamond },
    ].filter(item => item.value > 0);
  };

  const getSegmentationChartData = () => {
    if (!analyticsData.segmentation?.summary) return [];
    
    return [
      { name: 'Şampiyonlar', value: analyticsData.segmentation.summary.championsCount, color: COLORS.champions },
      { name: 'Sadık Müşteriler', value: analyticsData.segmentation.summary.loyalCustomersCount, color: COLORS.loyal },
      { name: 'Potansiyel Sadıklar', value: analyticsData.segmentation.summary.potentialLoyalistsCount, color: COLORS.potential },
      { name: 'Yeni Müşteriler', value: analyticsData.segmentation.summary.newCustomersCount, color: COLORS.new },
      { name: 'Risk Altında', value: analyticsData.segmentation.summary.atRiskCount, color: COLORS.risk },
      { name: 'Kayıp Müşteriler', value: analyticsData.segmentation.summary.lostCount, color: COLORS.lost },
      { name: 'Uykuda', value: analyticsData.segmentation.summary.hibernatingCount || 0, color: COLORS.hibernating },
      { name: 'Fiyat Duyarlı', value: analyticsData.segmentation.summary.priceSensitiveCount || 0, color: COLORS.priceSensitive },
      { name: 'İlgi Gerektiren', value: analyticsData.segmentation.summary.needsAttentionCount || 0, color: COLORS.needsAttention },
    ].filter(item => item.value > 0);
  };

  const getCustomerHealthData = () => {
    if (!analyticsData.segmentation?.summary) return [];
    
    const total = analyticsData.segmentation.summary.totalCustomers;
    return [
      { name: 'Sağlıklı', value: ((analyticsData.segmentation.summary.championsCount + analyticsData.segmentation.summary.loyalCustomersCount) / total * 100).toFixed(1) },
      { name: 'Orta', value: ((analyticsData.segmentation.summary.potentialLoyalistsCount + analyticsData.segmentation.summary.newCustomersCount) / total * 100).toFixed(1) },
      { name: 'Riskli', value: ((analyticsData.segmentation.summary.atRiskCount + analyticsData.segmentation.summary.needsAttentionCount) / total * 100).toFixed(1) },
      { name: 'Kritik', value: ((analyticsData.segmentation.summary.lostCount + analyticsData.segmentation.summary.hibernatingCount) / total * 100).toFixed(1) },
    ];
  };

  const getRFMHeatmapData = () => {
    if (!analyticsData.segmentation?.rfmMatrix) return [];
    
    return analyticsData.segmentation.rfmMatrix.map(item => ({
      ...item,
      size: Math.sqrt(item.count) * 10,
      color: item.segment === 'champions' ? COLORS.champions :
             item.segment === 'loyalCustomers' ? COLORS.loyal :
             item.segment === 'potentialLoyalists' ? COLORS.potential :
             item.segment === 'newCustomers' ? COLORS.new :
             item.segment === 'atRisk' ? COLORS.risk : COLORS.lost
    }));
  };

  const getLoyaltyProgressionData = () => {
    if (!analyticsData.loyalty?.progression) return [];
    
    return analyticsData.loyalty.progression.map(item => ({
      ...item,
      fill: item.level === 'Bronze' ? COLORS.bronze :
             item.level === 'Silver' ? COLORS.silver :
             item.level === 'Gold' ? COLORS.gold :
             item.level === 'Platinum' ? COLORS.platinum : COLORS.diamond
    }));
  };

  const getRetentionTrendData = () => {
    if (!analyticsData.retention?.monthlyData) return [];
    
    return analyticsData.retention.monthlyData.map(item => ({
      ...item,
      retentionRate: item.retentionRate * 100,
      churnRate: item.churnRate * 100
    }));
  };

  const getCohortData = () => {
    if (!analyticsData.retention?.cohortAnalysis) return [];
    
    return analyticsData.retention.cohortAnalysis.map(cohort => ({
      cohort: cohort.cohort,
      month0: typeof cohort.month0 === 'number' ? cohort.month0 * 100 : 0,
      month1: typeof cohort.month1 === 'number' ? cohort.month1 * 100 : 0,
      month2: typeof cohort.month2 === 'number' ? cohort.month2 * 100 : 0,
      month3: typeof cohort.month3 === 'number' ? cohort.month3 * 100 : 0,
      month6: typeof cohort.month6 === 'number' ? cohort.month6 * 100 : 0,
      month12: typeof cohort.month12 === 'number' ? cohort.month12 * 100 : 0,
    }));
  };

  const getSatisfactionTrendData = () => {
    if (!analyticsData.satisfaction?.surveys) return [];
    
    return analyticsData.satisfaction.surveys.map(item => ({
      ...item,
      satisfaction: item.averageSatisfaction * 100,
      nps: item.npsScore
    }));
  };

  const getBehaviorPatternsData = () => {
    if (!analyticsData.segmentation?.behaviorPatterns) return [];
    
    return analyticsData.segmentation.behaviorPatterns.map(item => ({
      ...item,
      trendColor: item.trend === 'up' ? '#10B981' : item.trend === 'down' ? '#EF4444' : '#F59E0B'
    }));
  };

  const getRiskLevel = (probability: number) => {
    if (probability >= 0.8) return { level: 'Yüksek', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    if (probability >= 0.6) return { level: 'Orta', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    return { level: 'Düşük', color: 'bg-green-100 text-green-800', icon: Shield };
  };

  const getSegmentIcon = (segment: string) => {
    switch (segment) {
      case 'champions': return Trophy;
      case 'loyalCustomers': return Heart;
      case 'potentialLoyalists': return TrendingUp;
      case 'newCustomers': return UserPlus;
      case 'atRisk': return AlertTriangle;
      case 'lost': return UserX;
      case 'hibernating': return MinusCircle;
      case 'priceSensitive': return DollarSign;
      case 'needsAttention': return Eye;
      default: return Users;
    }
  };

  const getLoyaltyIcon = (level: string) => {
    switch (level) {
      case 'Bronze': return Medal;
      case 'Silver': return Shield;
      case 'Gold': return Trophy;
      case 'Platinum': return Crown;
      case 'Diamond': return Gem;
      default: return Star;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ana Sayfa
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Müşteri Analitiği</h1>
              <p className="text-muted-foreground">
                Modern müşteri analitiği ve dinamik segmentasyon
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ana Sayfa
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Müşteri Analitiği</h1>
            <p className="text-muted-foreground">
              Modern müşteri analitiği ve dinamik segmentasyon
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}</span>
          </div>
          <Button 
            onClick={() => setIsRealTime(!isRealTime)} 
            variant={isRealTime ? "default" : "outline"}
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            Real-time
          </Button>
          <Button onClick={fetchAnalyticsData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Advanced Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Gelişmiş Analiz Kontrolleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger>
                <SelectValue placeholder="Analiz tipi seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comprehensive">Kapsamlı Analiz</SelectItem>
                <SelectItem value="loyalty">Sadakat Analizi</SelectItem>
                <SelectItem value="segmentation">Müşteri Segmentasyonu</SelectItem>
                <SelectItem value="retention">Tutundurma Analizi</SelectItem>
                <SelectItem value="satisfaction">Memnuniyet Analizi</SelectItem>
                <SelectItem value="predictions">Tahminler</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Zaman aralığı seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Son 1 Ay</SelectItem>
                <SelectItem value="3months">Son 3 Ay</SelectItem>
                <SelectItem value="6months">Son 6 Ay</SelectItem>
                <SelectItem value="1year">Son 1 Yıl</SelectItem>
                <SelectItem value="all">Tüm Zamanlar</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Müşteri ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center justify-between p-2 border rounded-md">
              <span className="text-sm font-medium">Real-time Güncelleme</span>
              <Switch
                checked={isRealTime}
                onCheckedChange={setIsRealTime}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Genel Bakış
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Sadakat Programı
          </TabsTrigger>
          <TabsTrigger value="segmentation" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Segmentasyon
          </TabsTrigger>
          <TabsTrigger value="retention" className="flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Tutundurma
          </TabsTrigger>
          <TabsTrigger value="satisfaction" className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4" />
            Memnuniyet
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Tahminler
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          {analyticsData.loyalty?.summary && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Toplam Müşteri"
                value={analyticsData.loyalty.summary.totalCustomers}
                description="Toplam müşteri sayısı"
                icon={Users}
                trend={{ value: 8.5, isPositive: true }}
              />
              <StatsCard
                title="Sadakat Skoru"
                value={analyticsData.loyalty.summary.averageLoyaltyScore.toFixed(1)}
                description="Ortalama sadakat skoru"
                icon={Star}
                trend={{ value: 3.2, isPositive: true }}
              />
              <StatsCard
                title="Tutundurma Oranı"
                value={`${(analyticsData.loyalty.summary.retentionRate * 100).toFixed(1)}%`}
                description="Müşteri tutundurma oranı"
                icon={UserCheck}
                trend={{ value: 2.1, isPositive: true }}
              />
              <StatsCard
                title="Müşteri Değeri"
                value={formatCurrency(analyticsData.retention?.summary.customerLifetimeValue || 0)}
                description="Ortalama müşteri değeri"
                icon={DollarSign}
                trend={{ value: 12.8, isPositive: true }}
              />
            </div>
          )}

          {/* Customer Health Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Müşteri Sağlığı
                </CardTitle>
                <CardDescription>
                  Müşteri tabanının genel durumu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getCustomerHealthData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getCustomerHealthData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.name === 'Sağlıklı' ? '#10B981' :
                          entry.name === 'Orta' ? '#F59E0B' :
                          entry.name === 'Riskli' ? '#EF4444' : '#8B8B8B'
                        } />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingIcon className="h-5 w-5" />
                  Sadakat Seviyeleri
                </CardTitle>
                <CardDescription>
                  Müşteri sadakat dağılımı
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getLoyaltyChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getLoyaltyChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Segment Dağılımı
                </CardTitle>
                <CardDescription>
                  RFM segmentasyon sonuçları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getSegmentationChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getSegmentationChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Behavior Patterns */}
          {analyticsData.segmentation?.behaviorPatterns && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Davranış Kalıpları
                </CardTitle>
                <CardDescription>
                  Müşteri davranış trendleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {getBehaviorPatternsData().map((pattern, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{pattern.pattern}</h3>
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: pattern.trendColor }} />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{pattern.customers} müşteri</span>
                        <span className="font-medium">{formatCurrency(pattern.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Loyalty Tab */}
        <TabsContent value="loyalty" className="space-y-6">
          {analyticsData.loyalty && (
            <>
              {/* Loyalty Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <StatsCard
                  title="Bronze"
                  value={analyticsData.loyalty.summary.bronzeCount}
                  description="1-2 servis"
                  icon={Medal}
                />
                <StatsCard
                  title="Silver"
                  value={analyticsData.loyalty.summary.silverCount}
                  description="3-5 servis"
                  icon={Shield}
                />
                <StatsCard
                  title="Gold"
                  value={analyticsData.loyalty.summary.goldCount}
                  description="6-9 servis"
                  icon={Trophy}
                />
                <StatsCard
                  title="Platinum"
                  value={analyticsData.loyalty.summary.platinumCount}
                  description="10-14 servis"
                  icon={Crown}
                />
                <StatsCard
                  title="Diamond"
                  value={analyticsData.loyalty.summary.diamondCount || 0}
                  description="15+ servis"
                  icon={Gem}
                />
              </div>

              {/* Loyalty Progression */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingIcon className="h-5 w-5" />
                      Sadakat İlerlemesi
                    </CardTitle>
                    <CardDescription>
                      Seviye bazında müşteri dağılımı
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={getLoyaltyProgressionData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="level" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            name === 'customers' ? `${value} müşteri` : formatCurrency(value),
                            name === 'customers' ? 'Müşteri Sayısı' : 'Gelir'
                          ]} 
                        />
                        <Legend />
                        <Bar dataKey="customers" fill="#0088FE" name="Müşteri Sayısı" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="revenue" fill="#00C49F" name="Gelir" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5" />
                      Sadakat Ödülleri
                    </CardTitle>
                    <CardDescription>
                      Seviyelere özel avantajlar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {analyticsData.loyalty.rewards.map((reward, index) => {
                        const Icon = getLoyaltyIcon(reward.level);
                        return (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Icon className="h-5 w-5" />
                                <span className="font-semibold">{reward.level}</span>
                              </div>
                              <Badge variant="outline">{reward.reward}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                            <div className="text-xs text-gray-500">
                              Min. {reward.minServices} servis • Min. {formatCurrency(reward.minSpent)}
                            </div>
                            <div className="mt-2">
                              <div className="text-sm font-medium mb-1">Avantajlar:</div>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {reward.benefits.map((benefit, idx) => (
                                  <li key={idx} className="flex items-center gap-1">
                                    <PlusCircle className="h-3 w-3 text-green-500" />
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Customers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    En Sadık Müşteriler
                  </CardTitle>
                  <CardDescription>
                    En yüksek sadakat seviyesindeki müşteriler
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Müşteri</TableHead>
                        <TableHead>Servis Sayısı</TableHead>
                        <TableHead>Toplam Harcama</TableHead>
                        <TableHead>Son Servis</TableHead>
                        <TableHead>Sadakat Seviyesi</TableHead>
                        <TableHead>NPS Skoru</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...analyticsData.loyalty.loyaltyLevels.diamond || [], ...analyticsData.loyalty.loyaltyLevels.platinum, ...analyticsData.loyalty.loyaltyLevels.gold]
                        .slice(0, 15)
                        .map((customer, index) => {
                          const level = customer.serviceCount >= 15 ? 'Diamond' :
                                       customer.serviceCount >= 10 ? 'Platinum' : 'Gold';
                          const Icon = getLoyaltyIcon(level);
                          return (
                            <TableRow key={customer.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{customer.name}</div>
                                  <div className="text-sm text-gray-500">{customer.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>{customer.serviceCount}</TableCell>
                              <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                              <TableCell>{formatDate(customer.lastService)}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={level === 'Diamond' ? 'default' : 
                                          level === 'Platinum' ? 'secondary' : 'outline'}
                                  className="flex items-center gap-1"
                                >
                                  <Icon className="h-3 w-3" />
                                  {level}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={customer.npsScore && customer.npsScore >= 9 ? 'default' : 
                                          customer.npsScore && customer.npsScore >= 7 ? 'secondary' : 'destructive'}
                                >
                                  {customer.npsScore || 'N/A'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Segmentation Tab */}
        <TabsContent value="segmentation" className="space-y-6">
          {analyticsData.segmentation && (
            <>
              {/* Segment Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Şampiyonlar"
                  value={analyticsData.segmentation.summary.championsCount}
                  description="En değerli müşteriler"
                  icon={Trophy}
                  trend={{ value: 15.2, isPositive: true }}
                />
                <StatsCard
                  title="Sadık Müşteriler"
                  value={analyticsData.segmentation.summary.loyalCustomersCount}
                  description="Düzenli hizmet alanlar"
                  icon={Heart}
                  trend={{ value: 8.7, isPositive: true }}
                />
                <StatsCard
                  title="Yeni Müşteriler"
                  value={analyticsData.segmentation.summary.newCustomersCount}
                  description="Son 3 ayda gelenler"
                  icon={UserPlus}
                  trend={{ value: 22.1, isPositive: true }}
                />
                <StatsCard
                  title="Risk Altında"
                  value={analyticsData.segmentation.summary.atRiskCount}
                  description="Kaybedilme riski olanlar"
                  icon={AlertTriangle}
                  trend={{ value: -5.3, isPositive: false }}
                />
              </div>

              {/* RFM Matrix Visualization */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      RFM Matrisi
                    </CardTitle>
                    <CardDescription>
                      Recency, Frequency, Monetary analizi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <ScatterChart data={getRFMHeatmapData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="recency" name="Recency" />
                        <YAxis dataKey="frequency" name="Frequency" />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          formatter={(value: number, name: string) => [
                            name === 'recency' ? `${value} gün` :
                            name === 'frequency' ? `${value} kez` :
                            name === 'monetary' ? formatCurrency(value) : value,
                            name === 'recency' ? 'Son Hizmet' :
                            name === 'frequency' ? 'Hizmet Sıklığı' :
                            name === 'monetary' ? 'Harcama' : name
                          ]}
                        />
                        <Scatter dataKey="monetary" fill="#8884d8" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                  Segment Detayları
                    </CardTitle>
                    <CardDescription>
                      Müşteri segment analizleri
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {getSegmentationChartData().map((segment, index) => {
                        const Icon = getSegmentIcon(segment.name.toLowerCase().replace('ş', 's').replace('ı', 'i').replace('ç', 'c').replace('ğ', 'g').replace('ö', 'o').replace('ü', 'u'));
                        return (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span className="font-medium">{segment.name}</span>
                              </div>
                              <Badge variant="outline">{segment.value} müşteri</Badge>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full" 
                                style={{ 
                                  width: `${(segment.value / analyticsData.segmentation!.summary.totalCustomers * 100)}%`,
                                  backgroundColor: segment.color 
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Segment Customers Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Segment Müşterileri
                  </CardTitle>
                  <CardDescription>
                    Tüm segmentlerdeki müşteriler
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Müşteri</TableHead>
                        <TableHead>Segment</TableHead>
                        <TableHead>Servis Sayısı</TableHead>
                        <TableHead>Toplam Harcama</TableHead>
                        <TableHead>Son Hizmet</TableHead>
                        <TableHead>Risk Skoru</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(analyticsData.segmentation.segments)
                        .flatMap(([segment, customers]) => 
                          customers.slice(0, 3).map(customer => ({ ...customer, segment }))
                        )
                        .slice(0, 20)
                        .map((customer, index) => {
                          const Icon = getSegmentIcon(customer.segment);
                          return (
                            <TableRow key={customer.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{customer.name}</div>
                                  <div className="text-sm text-gray-500">{customer.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Icon className="h-3 w-3" />
                                  {customer.segment === 'champions' ? 'Şampiyonlar' :
                                   customer.segment === 'loyalCustomers' ? 'Sadık Müşteriler' :
                                   customer.segment === 'potentialLoyalists' ? 'Potansiyel Sadıklar' :
                                   customer.segment === 'newCustomers' ? 'Yeni Müşteriler' :
                                   customer.segment === 'atRisk' ? 'Risk Altında' :
                                   customer.segment === 'lost' ? 'Kayıp Müşteriler' :
                                   customer.segment === 'hibernating' ? 'Uykuda' :
                                   customer.segment === 'priceSensitive' ? 'Fiyat Duyarlı' : 'İlgi Gerektiren'}
                                </Badge>
                              </TableCell>
                              <TableCell>{customer.serviceCount}</TableCell>
                              <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                              <TableCell>{formatDate(customer.lastService)}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={customer.riskScore && customer.riskScore >= 0.7 ? 'destructive' :
                                          customer.riskScore && customer.riskScore >= 0.4 ? 'secondary' : 'default'}
                                >
                                  {customer.riskScore ? `${(customer.riskScore * 100).toFixed(0)}%` : 'Düşük'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Retention Tab */}
        <TabsContent value="retention" className="space-y-6">
          {analyticsData.retention && (
            <>
              {/* Retention Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Tutundurma Oranı"
                  value={`${(analyticsData.retention.summary.retentionRate * 100).toFixed(1)}%`}
                  description="Müşteri tutundurma oranı"
                  icon={UserCheck}
                  trend={{ value: 2.8, isPositive: true }}
                />
                <StatsCard
                  title="Kayıp Oranı"
                  value={`${(analyticsData.retention.summary.churnRate * 100).toFixed(1)}%`}
                  description="Müşteri kayıp oranı"
                  icon={UserX}
                  trend={{ value: -1.5, isPositive: true }}
                />
                <StatsCard
                  title="Müşteri Ömrü"
                  value={`${analyticsData.retention.summary.averageLifetime.toFixed(1)} ay`}
                  description="Ortalama müşteri ömrü"
                  icon={Clock}
                  trend={{ value: 5.2, isPositive: true }}
                />
                <StatsCard
                  title="CLV"
                  value={formatCurrency(analyticsData.retention.summary.customerLifetimeValue)}
                  description="Müşteri yaşam boyu değer"
                  icon={DollarSign}
                  trend={{ value: 12.3, isPositive: true }}
                />
              </div>

              {/* Retention Trends */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingIcon className="h-5 w-5" />
                      Tutundurma Trendleri
                    </CardTitle>
                    <CardDescription>
                      Aylık tutundurma ve kayıp oranları
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <ComposedChart data={getRetentionTrendData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            name === 'retentionRate' ? `${value.toFixed(1)}%` :
                            name === 'churnRate' ? `${value.toFixed(1)}%` :
                            name === 'totalRevenue' ? formatCurrency(value) : value,
                            name === 'retentionRate' ? 'Tutundurma Oranı' :
                            name === 'churnRate' ? 'Kayıp Oranı' :
                            name === 'totalRevenue' ? 'Toplam Gelir' : name
                          ]}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="retentionRate" stroke="#10B981" strokeWidth={3} name="Tutundurma Oranı" />
                        <Line type="monotone" dataKey="churnRate" stroke="#EF4444" strokeWidth={3} name="Kayıp Oranı" />
                        <Bar dataKey="totalRevenue" fill="#0088FE" name="Toplam Gelir" radius={[4, 4, 0, 0]} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Kayıp Riski Tahminleri
                    </CardTitle>
                    <CardDescription>
                      Yüksek kayıp riski olan müşteriler
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {analyticsData.retention.churnPredictions.slice(0, 10).map((prediction, index) => {
                        const riskLevel = getRiskLevel(prediction.churnProbability);
                        const Icon = riskLevel.icon;
                        return (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">{prediction.customerName}</div>
                              <Badge className={riskLevel.color}>
                                <Icon className="h-3 w-3 mr-1" />
                                {riskLevel.level} Risk
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              Kayıp Olasılığı: {(prediction.churnProbability * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              <div className="font-medium mb-1">Risk Faktörleri:</div>
                              <ul className="space-y-1">
                                {prediction.riskFactors.slice(0, 2).map((factor, idx) => (
                                  <li key={idx}>• {factor}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cohort Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Kohort Analizi
                  </CardTitle>
                  <CardDescription>
                    Müşteri gruplarının zaman içindeki tutundurma oranları
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kohort</TableHead>
                          <TableHead>Ay 0</TableHead>
                          <TableHead>Ay 1</TableHead>
                          <TableHead>Ay 2</TableHead>
                          <TableHead>Ay 3</TableHead>
                          <TableHead>Ay 6</TableHead>
                          <TableHead>Ay 12</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getCohortData().map((cohortData, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{cohortData.cohort}</TableCell>
                            <TableCell>{cohortData.month0?.toFixed(1)}%</TableCell>
                            <TableCell>{cohortData.month1?.toFixed(1)}%</TableCell>
                            <TableCell>{cohortData.month2?.toFixed(1)}%</TableCell>
                            <TableCell>{cohortData.month3?.toFixed(1)}%</TableCell>
                            <TableCell>{cohortData.month6?.toFixed(1)}%</TableCell>
                            <TableCell>{cohortData.month12?.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Satisfaction Tab */}
        <TabsContent value="satisfaction" className="space-y-6">
          {analyticsData.satisfaction && (
            <>
              {/* Satisfaction Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Memnuniyet Oranı"
                  value={`${(analyticsData.satisfaction.summary.overallSatisfaction * 100).toFixed(1)}%`}
                  description="Genel memnuniyet oranı"
                  icon={ThumbsUp}
                  trend={{ value: 3.5, isPositive: true }}
                />
                <StatsCard
                  title="NPS Skoru"
                  value={analyticsData.satisfaction.summary.npsScore}
                  description="Net Promoter Score"
                  icon={Star}
                  trend={{ value: 8.2, isPositive: true }}
                />
                <StatsCard
                  title="Yanıt Oranı"
                  value={`${(analyticsData.satisfaction.summary.averageResponseRate * 100).toFixed(1)}%`}
                  description="Anket yanıtlama oranı"
                  icon={MessageSquare}
                  trend={{ value: 5.1, isPositive: true }}
                />
                <StatsCard
                  title="Toplam Anket"
                  value={analyticsData.satisfaction.summary.totalSurveys}
                  description="Toplam anket sayısı"
                  icon={BarChart3}
                  trend={{ value: 12.8, isPositive: true }}
                />
              </div>

              {/* Satisfaction Trends */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingIcon className="h-5 w-5" />
                      Memnuniyet Trendleri
                    </CardTitle>
                    <CardDescription>
                      Zaman içindeki memnuniyet ve NPS skorları
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <ComposedChart data={getSatisfactionTrendData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            name === 'satisfaction' ? `${value.toFixed(1)}%` :
                            name === 'nps' ? `${value}` :
                            name === 'responseRate' ? `${value.toFixed(1)}%` : value,
                            name === 'satisfaction' ? 'Memnuniyet Oranı' :
                            name === 'nps' ? 'NPS Skoru' :
                            name === 'responseRate' ? 'Yanıt Oranı' : name
                          ]}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="satisfaction" stroke="#10B981" strokeWidth={3} name="Memnuniyet Oranı" />
                        <Line type="monotone" dataKey="nps" stroke="#0088FE" strokeWidth={3} name="NPS Skoru" />
                        <Bar dataKey="responseRate" fill="#F59E0B" name="Yanıt Oranı" radius={[4, 4, 0, 0]} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Geri Bildirim Analizi
                    </CardTitle>
                    <CardDescription>
                      Müşteri geri bildirim kategorileri
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.satisfaction.feedback.map((feedback, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{feedback.category}</h3>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={feedback.sentiment === 'positive' ? 'default' : 
                                        feedback.sentiment === 'negative' ? 'destructive' : 'secondary'}
                              >
                                {feedback.sentiment === 'positive' ? 'Pozitif' :
                                 feedback.sentiment === 'negative' ? 'Negatif' : 'Nötr'}
                              </Badge>
                              <Badge variant="outline">{feedback.count} geri bildirim</Badge>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {feedback.keywords.slice(0, 5).map((keyword, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          {analyticsData.predictions && (
            <>
              {/* Next Month Predictions */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Beklenen Yeni Müşteri"
                  value={analyticsData.predictions.nextMonth.expectedNewCustomers}
                  description="Gelecek ay tahmini"
                  icon={UserPlus}
                />
                <StatsCard
                  title="Beklenen Kayıp"
                  value={analyticsData.predictions.nextMonth.expectedChurn}
                  description="Gelecek ay tahmini"
                  icon={UserX}
                />
                <StatsCard
                  title="Beklenen Gelir"
                  value={formatCurrency(analyticsData.predictions.nextMonth.expectedRevenue)}
                  description="Gelecek ay tahmini"
                  icon={DollarSign}
                />
                <StatsCard
                  title="Tahmin Doğruluğu"
                  value="87.3%"
                  description="Model doğruluk oranı"
                  icon={Activity}
                />
              </div>

              {/* Growth Segments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingIcon className="h-5 w-5" />
                    Büyüme Potansiyeli
                  </CardTitle>
                  <CardDescription>
                    Gelecek ay en yüksek büyümeye sahip segmentler
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {analyticsData.predictions.nextMonth.topSegments.map((segment, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{segment.segment}</h3>
                          <Badge variant={segment.growth > 0 ? 'default' : 'destructive'}>
                            {formatPercentage(segment.growth)}
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${segment.growth > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.abs(segment.growth)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    AI Tabanlı Öneriler
                  </CardTitle>
                  <CardDescription>
                    Veriye dayalı eylem önerileri
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.predictions.recommendations.map((recommendation, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={recommendation.priority === 'high' ? 'destructive' : 
                                      recommendation.priority === 'medium' ? 'secondary' : 'outline'}
                            >
                              {recommendation.priority === 'high' ? 'Yüksek Öncelikli' :
                               recommendation.priority === 'medium' ? 'Orta Öncelikli' : 'Düşük Öncelikli'}
                            </Badge>
                            <Badge variant="outline">{recommendation.type}</Badge>
                          </div>
                          <span className="text-sm text-gray-500">{recommendation.timeline}</span>
                        </div>
                        <h3 className="font-medium mb-1">{recommendation.action}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Hedef: {recommendation.targetSegment}
                        </p>
                        <p className="text-sm text-blue-600">
                          Beklenen Etki: {recommendation.expectedImpact}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}