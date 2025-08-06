import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const analysisType = searchParams.get('type'); // loyalty, segmentation, retention, analytics

    let analysisData = {};

    switch (analysisType) {
      case 'loyalty':
        analysisData = await getLoyaltyAnalysis();
        break;
      case 'segmentation':
        analysisData = await getCustomerSegmentation();
        break;
      case 'retention':
        analysisData = await getRetentionAnalysis();
        break;
      default:
        analysisData = await getGeneralCustomerAnalytics();
    }

    return NextResponse.json(analysisData);
  } catch (error) {
    console.error('Customer analytics error:', error);
    return NextResponse.json(
      { error: 'Müşteri analizi yapılırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

async function getLoyaltyAnalysis() {
  // Müşteri sadakat analizi - tekrarlayan müşteriler
  const allServices = await db.service.findMany({
    include: {
      customer: true,
      financialRecord: {
        where: {
          type: 'INCOME',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Müşteri bazlı gruplama
  const customerStats = new Map();
  
  allServices.forEach(service => {
    const customerId = service.customerId;
    if (!customerStats.has(customerId)) {
      customerStats.set(customerId, {
        customer: service.customer,
        serviceCount: 0,
        totalSpent: 0,
        firstService: service.createdAt,
        lastService: service.createdAt,
        services: [],
      });
    }
    
    const stats = customerStats.get(customerId);
    stats.serviceCount += 1;
    stats.totalSpent += service.financialRecord.reduce((sum, record) => sum + record.amount, 0);
    stats.lastService = service.createdAt;
    stats.services.push(service);
  });

  // Sadakat seviyeleri
  const loyaltyLevels = {
    bronze: [],    // 1-2 servis
    silver: [],    // 3-5 servis
    gold: [],      // 6-10 servis
    platinum: [],  // 10+ servis
  };

  customerStats.forEach((stats, customerId) => {
    const customer = stats.customer;
    const loyaltyData = {
      ...customer,
      serviceCount: stats.serviceCount,
      totalSpent: stats.totalSpent,
      firstService: stats.firstService,
      lastService: stats.lastService,
      averageSpent: stats.totalSpent / stats.serviceCount,
      daysSinceLastService: Math.floor((new Date().getTime() - new Date(stats.lastService).getTime()) / (1000 * 60 * 60 * 24)),
    };

    if (stats.serviceCount <= 2) {
      loyaltyLevels.bronze.push(loyaltyData);
    } else if (stats.serviceCount <= 5) {
      loyaltyLevels.silver.push(loyaltyData);
    } else if (stats.serviceCount <= 10) {
      loyaltyLevels.gold.push(loyaltyData);
    } else {
      loyaltyLevels.platinum.push(loyaltyData);
    }
  });

  // Sadakat ödülleri
  const rewards = [
    { level: 'Bronze', minServices: 1, reward: '5% indirim', description: 'İlk servis sonrası' },
    { level: 'Silver', minServices: 3, reward: '10% indirim', description: '3. servis sonrası' },
    { level: 'Gold', minServices: 6, reward: '15% indirim + Ücretsiz kontrol', description: '6. servis sonrası' },
    { level: 'Platinum', minServices: 10, reward: '20% indirim + Öncelikli hizmet', description: '10. servis sonrası' },
  ];

  return {
    loyaltyLevels,
    rewards,
    summary: {
      totalCustomers: customerStats.size,
      bronzeCount: loyaltyLevels.bronze.length,
      silverCount: loyaltyLevels.silver.length,
      goldCount: loyaltyLevels.gold.length,
      platinumCount: loyaltyLevels.platinum.length,
    },
  };
}

async function getCustomerSegmentation() {
  // Müşteri segmentasyonu
  const allServices = await db.service.findMany({
    include: {
      customer: true,
      financialRecord: {
        where: {
          type: 'INCOME',
        },
      },
    },
  });

  const customerStats = new Map();
  
  allServices.forEach(service => {
    const customerId = service.customerId;
    if (!customerStats.has(customerId)) {
      customerStats.set(customerId, {
        customer: service.customer,
        serviceCount: 0,
        totalSpent: 0,
        lastService: service.createdAt,
        deviceTypes: new Set(),
        brands: new Set(),
      });
    }
    
    const stats = customerStats.get(customerId);
    stats.serviceCount += 1;
    stats.totalSpent += service.financialRecord.reduce((sum, record) => sum + record.amount, 0);
    stats.lastService = service.createdAt;
    stats.deviceTypes.add(service.deviceType);
    stats.brands.add(service.brand);
  });

  // RFM Analizi (Recency, Frequency, Monetary)
  const segments = {
    champions: [],      // Yüksek harcama, sık ziyaret, yeni
    loyalCustomers: [],  // Yüksek harcama, sık ziyaret
    potentialLoyalists: [], // Orta harcama, sık ziyaret
    newCustomers: [],    // Düşük harcama, yeni
    atRisk: [],          // Yüksek harcama, eski
    lost: [],            // Düşük harcama, eski
  };

  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  customerStats.forEach((stats, customerId) => {
    const customer = stats.customer;
    const recency = new Date(stats.lastService).getTime();
    const frequency = stats.serviceCount;
    const monetary = stats.totalSpent;
    
    const segmentData = {
      ...customer,
      serviceCount: frequency,
      totalSpent: monetary,
      lastService: stats.lastService,
      averageSpent: monetary / frequency,
      deviceTypes: Array.from(stats.deviceTypes),
      brands: Array.from(stats.brands),
    };

    // Segmentasyon kuralları
    if (frequency >= 5 && monetary >= 5000 && recency > ninetyDaysAgo.getTime()) {
      segments.champions.push(segmentData);
    } else if (frequency >= 3 && monetary >= 3000 && recency > ninetyDaysAgo.getTime()) {
      segments.loyalCustomers.push(segmentData);
    } else if (frequency >= 2 && monetary >= 1000 && recency > ninetyDaysAgo.getTime()) {
      segments.potentialLoyalists.push(segmentData);
    } else if (frequency === 1 && recency > ninetyDaysAgo.getTime()) {
      segments.newCustomers.push(segmentData);
    } else if (monetary >= 2000 && recency < ninetyDaysAgo.getTime() && recency > oneYearAgo.getTime()) {
      segments.atRisk.push(segmentData);
    } else if (recency < oneYearAgo.getTime()) {
      segments.lost.push(segmentData);
    }
  });

  return {
    segments,
    summary: {
      totalCustomers: customerStats.size,
      championsCount: segments.champions.length,
      loyalCustomersCount: segments.loyalCustomers.length,
      potentialLoyalistsCount: segments.potentialLoyalists.length,
      newCustomersCount: segments.newCustomers.length,
      atRiskCount: segments.atRisk.length,
      lostCount: segments.lost.length,
    },
  };
}

async function getRetentionAnalysis() {
  // Müşteri tutundurma analizi
  const allServices = await db.service.findMany({
    include: {
      customer: true,
      financialRecord: {
        where: {
          type: 'INCOME',
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Aylık bazda yeni ve tekrarlayan müşteriler
  const monthlyData = new Map();
  const customerFirstService = new Map();
  
  // İlk servis tarihlerini kaydet
  allServices.forEach(service => {
    if (!customerFirstService.has(service.customerId)) {
      customerFirstService.set(service.customerId, service.createdAt);
    }
  });

  // Aylık verileri topla
  allServices.forEach(service => {
    const monthKey = service.createdAt.toISOString().substring(0, 7); // YYYY-MM format
    const isFirstService = customerFirstService.get(service.customerId) === service.createdAt;
    
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, {
        newCustomers: 0,
        returningCustomers: 0,
        totalCustomers: new Set(),
        totalRevenue: 0,
      });
    }
    
    const monthData = monthlyData.get(monthKey);
    monthData.totalCustomers.add(service.customerId);
    monthData.totalRevenue += service.financialRecords.reduce((sum, record) => sum + record.amount, 0);
    
    if (isFirstService) {
      monthData.newCustomers += 1;
    } else {
      monthData.returningCustomers += 1;
    }
  });

  // Verileri formatla
  const retentionData = [];
  monthlyData.forEach((data, month) => {
    retentionData.push({
      month,
      newCustomers: data.newCustomers,
      returningCustomers: data.returningCustomers,
      totalCustomers: data.totalCustomers.size,
      totalRevenue: data.totalRevenue,
      retentionRate: data.totalCustomers.size > 0 ? (data.returningCustomers / data.totalCustomers.size) * 100 : 0,
    });
  });

  // Müşteri yaşam süresi analizi
  const customerLifetimes = new Map();
  customerFirstService.forEach((firstService, customerId) => {
    const customerServices = allServices.filter(s => s.customerId === customerId);
    const lastService = customerServices[customerServices.length - 1]?.createdAt || firstService;
    const lifetime = Math.floor((new Date(lastService).getTime() - new Date(firstService).getTime()) / (1000 * 60 * 60 * 24));
    
    customerLifetimes.set(customerId, {
      customerId,
      lifetime,
      serviceCount: customerServices.length,
      firstService,
      lastService,
    });
  });

  // Ortalama yaşam süresi
  const lifetimes = Array.from(customerLifetimes.values()).map(c => c.lifetime);
  const averageLifetime = lifetimes.reduce((sum, lifetime) => sum + lifetime, 0) / lifetimes.length;

  return {
    monthlyData: retentionData.sort((a, b) => a.month.localeCompare(b.month)),
    customerLifetimes: Array.from(customerLifetimes.values()),
    summary: {
      averageLifetime: Math.round(averageLifetime),
      totalCustomers: customerFirstService.size,
      averageServicesPerCustomer: allServices.length / customerFirstService.size,
    },
  };
}

async function getGeneralCustomerAnalytics() {
  const [loyalty, segmentation, retention] = await Promise.all([
    getLoyaltyAnalysis(),
    getCustomerSegmentation(),
    getRetentionAnalysis(),
  ]);

  return {
    loyalty,
    segmentation,
    retention,
  };
}