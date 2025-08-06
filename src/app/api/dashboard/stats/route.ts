import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    // Yesterday for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
    const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

    // Get today's services
    const todayServices = await db.service.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    // Get yesterday's services for comparison
    const yesterdayServices = await db.service.count({
      where: {
        createdAt: {
          gte: startOfYesterday,
          lte: endOfYesterday
        }
      }
    });

    // Get pending services (not completed or delivered)
    const pendingServices = await db.service.count({
      where: {
        status: {
          in: ['RECEIVED', 'DIAGNOSIS_PENDING', 'CUSTOMER_APPROVAL_PENDING', 'PARTS_PENDING', 'REPAIRING']
        }
      }
    });

    // Get completed services (ready for delivery or delivered)
    const completedServices = await db.service.count({
      where: {
        status: {
          in: ['COMPLETED_READY_FOR_DELIVERY', 'DELIVERED']
        }
      }
    });

    // Get today's revenue (from delivered services today)
    const todayRevenue = await db.service.aggregate({
      where: {
        status: 'DELIVERED',
        deliveredAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      _sum: {
        actualFee: true
      }
    });

    // Get yesterday's revenue for comparison
    const yesterdayRevenue = await db.service.aggregate({
      where: {
        status: 'DELIVERED',
        deliveredAt: {
          gte: startOfYesterday,
          lte: endOfYesterday
        }
      },
      _sum: {
        actualFee: true
      }
    });

    // Calculate percentage changes
    const todayServiceChange = yesterdayServices > 0 
      ? ((todayServices - yesterdayServices) / yesterdayServices) * 100 
      : 0;

    const todayRevenueAmount = todayRevenue._sum.actualFee || 0;
    const yesterdayRevenueAmount = yesterdayRevenue._sum.actualFee || 0;
    const revenueChange = yesterdayRevenueAmount > 0 
      ? ((todayRevenueAmount - yesterdayRevenueAmount) / yesterdayRevenueAmount) * 100 
      : 0;

    // Get services by status for chart
    const servicesByStatus = await db.service.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    // Get monthly revenue for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenueData = await db.service.groupBy({
      by: ['deliveredAt'],
      where: {
        status: 'DELIVERED',
        deliveredAt: {
          gte: sixMonthsAgo
        }
      },
      _sum: {
        actualFee: true
      }
    });

    // Group monthly revenue by month
    const monthlyRevenue = {};
    for (let i = 0; i < 6; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthKey = month.toISOString().slice(0, 7); // YYYY-MM format
      monthlyRevenue[monthKey] = 0;
    }

    // Fill with actual data
    monthlyRevenueData.forEach(item => {
      if (item.deliveredAt) {
        const monthKey = item.deliveredAt.toISOString().slice(0, 7);
        if (monthlyRevenue[monthKey] !== undefined) {
          monthlyRevenue[monthKey] += item._sum.actualFee || 0;
        }
      }
    });

    return NextResponse.json({
      todayServices,
      pendingServices,
      completedServices,
      todayRevenue: todayRevenueAmount,
      servicesByStatus,
      monthlyRevenue,
      changes: {
        todayServiceChange,
        revenueChange
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
