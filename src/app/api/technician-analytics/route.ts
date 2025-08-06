import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const analysisType = searchParams.get('type'); // performance, efficiency, comparison, analytics
    const technicianId = searchParams.get('technicianId');
    const period = searchParams.get('period') || 'monthly'; // daily, weekly, monthly, yearly

    let analysisData = {};

    switch (analysisType) {
      case 'performance':
        analysisData = await getTechnicianPerformance(technicianId, period);
        break;
      case 'efficiency':
        analysisData = await getEfficiencyMetrics(technicianId, period);
        break;
      case 'comparison':
        analysisData = await getTechnicianComparison(period);
        break;
      default:
        analysisData = await getGeneralTechnicianAnalytics(period);
    }

    return NextResponse.json(analysisData);
  } catch (error) {
    console.error('Technician analytics error:', error);
    return NextResponse.json(
      { error: 'Teknisyen analizi yapılırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

async function getTechnicianPerformance(technicianId: string | null, period: string) {
  const where: any = {};
  if (technicianId) {
    where.technicianId = technicianId;
  }

  // Tarih aralığını belirle
  const now = new Date();
  let startDate = new Date();
  
  switch (period) {
    case 'daily':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'yearly':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  where.createdAt = {
    gte: startDate,
  };

  // Teknisyen bazlı servis verileri
  const services = await db.service.findMany({
    where,
    include: {
      technician: true,
      customer: true,
      financialRecords: {
        where: {
          type: 'INCOME',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Teknisyen performans metrikleri
  const technicianStats = new Map();
  
  services.forEach(service => {
    const techId = service.technicianId;
    if (!techId) return; // Teknisyen atanmamış servisleri atla
    
    if (!technicianStats.has(techId)) {
      technicianStats.set(techId, {
        technician: service.technician,
        serviceCount: 0,
        completedServices: 0,
        totalRevenue: 0,
        averageServiceTime: 0,
        customerSatisfaction: 0,
        services: [],
        serviceTimes: [],
      });
    }
    
    const stats = technicianStats.get(techId);
    stats.serviceCount += 1;
    stats.totalRevenue += service.financialRecords.reduce((sum, record) => sum + record.amount, 0);
    stats.services.push(service);
    
    if (service.status === 'COMPLETED') {
      stats.completedServices += 1;
    }
    
    // Servis süresi hesapla (basit bir yaklaşım)
    if (service.completedAt && service.createdAt) {
      const serviceTime = new Date(service.completedAt).getTime() - new Date(service.createdAt).getTime();
      stats.serviceTimes.push(serviceTime);
    }
  });

  // İstatistikleri hesapla
  technicianStats.forEach((stats, techId) => {
    const avgServiceTime = stats.serviceTimes.length > 0 
      ? stats.serviceTimes.reduce((sum, time) => sum + time, 0) / stats.serviceTimes.length 
      : 0;
    
    stats.averageServiceTime = avgServiceTime;
    stats.completionRate = stats.serviceCount > 0 ? (stats.completedServices / stats.serviceCount) * 100 : 0;
    stats.averageRevenue = stats.serviceCount > 0 ? stats.totalRevenue / stats.serviceCount : 0;
  });

  // Performans sıralaması
  const rankedTechnicians = Array.from(technicianStats.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue || b.completedServices - a.completedServices)
    .map((tech, index) => ({
      ...tech,
      rank: index + 1,
      efficiency: calculateEfficiency(tech),
    }));

  return {
    technicians: rankedTechnicians,
    period,
    summary: {
      totalTechnicians: technicianStats.size,
      totalServices: services.length,
      totalRevenue: services.reduce((sum, service) => 
        sum + service.financialRecords.reduce((recordSum, record) => recordSum + record.amount, 0), 0),
      averageCompletionRate: rankedTechnicians.length > 0 
        ? rankedTechnicians.reduce((sum, tech) => sum + tech.completionRate, 0) / rankedTechnicians.length 
        : 0,
    },
  };
}

async function getEfficiencyMetrics(technicianId: string | null, period: string) {
  const where: any = {};
  if (technicianId) {
    where.technicianId = technicianId;
  }

  // Tarih aralığını belirle
  const now = new Date();
  let startDate = new Date();
  
  switch (period) {
    case 'daily':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'yearly':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  where.createdAt = {
    gte: startDate,
  };

  const services = await db.service.findMany({
    where,
    include: {
      technician: true,
      financialRecords: {
        where: {
          type: 'INCOME',
        },
      },
    },
  });

  // Verimlilik metrikleri
  const efficiencyData = new Map();
  
  services.forEach(service => {
    const techId = service.technicianId;
    if (!techId) return;
    
    if (!efficiencyData.has(techId)) {
      efficiencyData.set(techId, {
        technician: service.technician,
        services: [],
        revenuePerHour: 0,
        servicesPerDay: 0,
        utilizationRate: 0,
      });
    }
    
    efficiencyData.get(techId).services.push(service);
  });

  // Verimlilik hesaplamaları
  efficiencyData.forEach((data, techId) => {
    const totalRevenue = data.services.reduce((sum, service) => 
      sum + service.financialRecords.reduce((recordSum, record) => recordSum + record.amount, 0), 0);
    
    // Toplam çalışma süresi (tahmini)
    const totalWorkHours = data.services.length * 2; // Her servis ortalama 2 saat
    
    data.revenuePerHour = totalWorkHours > 0 ? totalRevenue / totalWorkHours : 0;
    data.servicesPerDay = calculateServicesPerDay(data.services);
    data.utilizationRate = calculateUtilizationRate(data.services);
  });

  return {
    efficiency: Array.from(efficiencyData.values()),
    period,
    summary: {
      averageRevenuePerHour: Array.from(efficiencyData.values()).length > 0
        ? Array.from(efficiencyData.values()).reduce((sum, data) => sum + data.revenuePerHour, 0) / efficiencyData.size
        : 0,
      averageServicesPerDay: Array.from(efficiencyData.values()).length > 0
        ? Array.from(efficiencyData.values()).reduce((sum, data) => sum + data.servicesPerDay, 0) / efficiencyData.size
        : 0,
      averageUtilizationRate: Array.from(efficiencyData.values()).length > 0
        ? Array.from(efficiencyData.values()).reduce((sum, data) => sum + data.utilizationRate, 0) / efficiencyData.size
        : 0,
    },
  };
}

async function getTechnicianComparison(period: string) {
  const performance = await getTechnicianPerformance(null, period);
  const efficiency = await getEfficiencyMetrics(null, period);

  // Teknisyen karşılaştırma verileri
  const comparison = performance.technicians.map(tech => {
    const efficiencyData = efficiency.efficiency.find(e => e.technician.id === tech.technician.id);
    
    return {
      id: tech.technician.id,
      name: tech.technician.name,
      email: tech.technician.email,
      performance: {
        rank: tech.rank,
        serviceCount: tech.serviceCount,
        completionRate: tech.completionRate,
        totalRevenue: tech.totalRevenue,
        averageRevenue: tech.averageRevenue,
      },
      efficiency: {
        revenuePerHour: efficiencyData?.revenuePerHour || 0,
        servicesPerDay: efficiencyData?.servicesPerDay || 0,
        utilizationRate: efficiencyData?.utilizationRate || 0,
      },
      overallScore: calculateOverallScore(tech, efficiencyData),
    };
  });

  return {
    comparison: comparison.sort((a, b) => b.overallScore - a.overallScore),
    period,
    metrics: {
      topPerformer: comparison[0],
      mostEfficient: comparison.reduce((max, tech) => 
        tech.efficiency.revenuePerHour > max.efficiency.revenuePerHour ? tech : max, comparison[0]),
      highestCompletion: comparison.reduce((max, tech) => 
        tech.performance.completionRate > max.performance.completionRate ? tech : max, comparison[0]),
    },
  };
}

async function getGeneralTechnicianAnalytics(period: string) {
  const [performance, efficiency, comparison] = await Promise.all([
    getTechnicianPerformance(null, period),
    getEfficiencyMetrics(null, period),
    getTechnicianComparison(period),
  ]);

  return {
    performance,
    efficiency,
    comparison,
    period,
  };
}

// Yardımcı fonksiyonlar
function calculateEfficiency(tech: any) {
  const completionWeight = 0.3;
  const revenueWeight = 0.4;
  const speedWeight = 0.3;
  
  const completionScore = tech.completionRate || 0;
  const revenueScore = Math.min((tech.averageRevenue || 0) / 1000, 100); // Maksimum 100 puan
  const speedScore = tech.averageServiceTime > 0 
    ? Math.max(0, 100 - (tech.averageServiceTime / (1000 * 60 * 60 * 24))) // 1 günden az ise puan ver
    : 0;
  
  return (completionScore * completionWeight + revenueScore * revenueWeight + speedScore * speedWeight);
}

function calculateServicesPerDay(services: any[]) {
  if (services.length === 0) return 0;
  
  const serviceDates = services.map(s => s.createdAt.toDateString());
  const uniqueDays = new Set(serviceDates).size;
  
  return uniqueDays > 0 ? services.length / uniqueDays : 0;
}

function calculateUtilizationRate(services: any[]) {
  // Basit bir kullanım oranı hesaplaması
  const totalPossibleHours = 8 * 22; // Ayda 22 iş günü, günde 8 saat
  const estimatedWorkHours = services.length * 2; // Her servis ortalama 2 saat
  
  return totalPossibleHours > 0 ? (estimatedWorkHours / totalPossibleHours) * 100 : 0;
}

function calculateOverallScore(tech: any, efficiencyData: any) {
  const performanceScore = calculateEfficiency(tech);
  const efficiencyScore = efficiencyData ? 
    ((efficiencyData.revenuePerHour / 1000) * 50 + // Saatlik gelir puanı
     efficiencyData.utilizationRate * 0.5 + // Kullanım oranı puanı
     (efficiencyData.servicesPerDay * 10)) // Günlük servis sayısı puanı
    : 0;
  
  return (performanceScore + efficiencyScore) / 2;
}