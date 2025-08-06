import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Active services (in progress)
    const activeServices = await db.service.count({
      where: {
        status: {
          in: ['RECEIVED', 'DIAGNOSIS_PENDING', 'CUSTOMER_APPROVAL_PENDING', 'PARTS_PENDING', 'REPAIRING']
        }
      }
    });

    // Last month's active services for comparison
    const lastMonthActiveServices = await db.service.count({
      where: {
        status: {
          in: ['RECEIVED', 'DIAGNOSIS_PENDING', 'CUSTOMER_APPROVAL_PENDING', 'PARTS_PENDING', 'REPAIRING']
        },
        createdAt: {
          gte: startOfLastMonth,
          lt: endOfLastMonth
        }
      }
    });

    // Completed services (ready for delivery or delivered)
    const completedServices = await db.service.count({
      where: {
        status: {
          in: ['COMPLETED_READY_FOR_DELIVERY', 'DELIVERED']
        }
      }
    });

    // Last month's completed services
    const lastMonthCompletedServices = await db.service.count({
      where: {
        status: {
          in: ['COMPLETED_READY_FOR_DELIVERY', 'DELIVERED']
        },
        createdAt: {
          gte: startOfLastMonth,
          lt: endOfLastMonth
        }
      }
    });

    // Pending services (waiting for customer approval or parts)
    const pendingServices = await db.service.count({
      where: {
        status: {
          in: ['CUSTOMER_APPROVAL_PENDING', 'PARTS_PENDING']
        }
      }
    });

    // Last month's pending services
    const lastMonthPendingServices = await db.service.count({
      where: {
        status: {
          in: ['CUSTOMER_APPROVAL_PENDING', 'PARTS_PENDING']
        },
        createdAt: {
          gte: startOfLastMonth,
          lt: endOfLastMonth
        }
      }
    });

    // This month's revenue
    const monthlyRevenue = await db.service.aggregate({
      where: {
        status: 'DELIVERED',
        deliveredAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        actualFee: true
      }
    });

    // Last month's revenue
    const lastMonthRevenue = await db.service.aggregate({
      where: {
        status: 'DELIVERED',
        deliveredAt: {
          gte: startOfLastMonth,
          lt: endOfLastMonth
        }
      },
      _sum: {
        actualFee: true
      }
    });

    // Calculate percentage changes
    const activeChange = lastMonthActiveServices > 0 
      ? ((activeServices - lastMonthActiveServices) / lastMonthActiveServices) * 100 
      : 0;

    const completedChange = lastMonthCompletedServices > 0 
      ? ((completedServices - lastMonthCompletedServices) / lastMonthCompletedServices) * 100 
      : 0;

    const pendingChange = lastMonthPendingServices > 0 
      ? ((pendingServices - lastMonthPendingServices) / lastMonthPendingServices) * 100 
      : 0;

    const currentRevenue = monthlyRevenue._sum.actualFee || 0;
    const previousRevenue = lastMonthRevenue._sum.actualFee || 0;
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    return NextResponse.json({
      activeServices,
      completedServices,
      pendingServices,
      monthlyRevenue: currentRevenue,
      activeChange,
      completedChange,
      pendingChange,
      revenueChange
    });

  } catch (error) {
    console.error('Error fetching service stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
