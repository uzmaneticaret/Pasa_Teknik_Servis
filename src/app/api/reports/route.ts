import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type'); // monthly, yearly, comparison, trends
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || new Date().getMonth().toString());

    let reportData = {};

    switch (reportType) {
      case 'monthly':
        reportData = await getMonthlyReport(year, month);
        break;
      case 'yearly':
        reportData = await getYearlyReport(year);
        break;
      case 'comparison':
        reportData = await getComparisonReport(year);
        break;
      case 'trends':
        reportData = await getTrendsReport();
        break;
      default:
        reportData = await getGeneralReport();
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Rapor oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

async function getMonthlyReport(year: number, month: number) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  // Aylık gelir/gider detayları
  const [incomeRecords, expenseRecords] = await Promise.all([
    db.financialRecord.findMany({
      where: {
        type: 'INCOME',
        recordedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    db.financialRecord.findMany({
      where: {
        type: 'EXPENSE',
        recordedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
  ]);

  // Servis bazlı gelir analizi
  const serviceIncome = await db.financialRecord.groupBy({
    by: ['serviceId'],
    where: {
      type: 'INCOME',
      recordedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amount: true,
    },
    _count: {
      _all: true,
    },
  });

  // Günlük trend
  const dailyTrends = await db.financialRecord.groupBy({
    by: ['type'],
    where: {
      recordedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amount: true,
    },
    _count: {
      _all: true,
    },
  });

  const totalIncome = incomeRecords.reduce((sum, record) => sum + record.amount, 0);
  const totalExpense = expenseRecords.reduce((sum, record) => sum + record.amount, 0);
  const netProfit = totalIncome - totalExpense;

  return {
    period: `${year}-${(month + 1).toString().padStart(2, '0')}`,
    summary: {
      totalIncome,
      totalExpense,
      netProfit,
      transactionCount: incomeRecords.length + expenseRecords.length,
    },
    serviceAnalysis: serviceIncome,
    dailyTrends,
    records: {
      income: incomeRecords,
      expense: expenseRecords,
    },
  };
}

async function getYearlyReport(year: number) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  // Aylık breakdown
  const monthlyData = [];
  for (let month = 0; month < 12; month++) {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    const [monthIncome, monthExpense] = await Promise.all([
      db.financialRecord.aggregate({
        where: {
          type: 'INCOME',
          recordedAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
        _count: {
          _all: true,
        },
      }),
      db.financialRecord.aggregate({
        where: {
          type: 'EXPENSE',
          recordedAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
        _count: {
          _all: true,
        },
      }),
    ]);

    monthlyData.push({
      month: month + 1,
      income: monthIncome._sum.amount || 0,
      expense: monthExpense._sum.amount || 0,
      net: (monthIncome._sum.amount || 0) - (monthExpense._sum.amount || 0),
      transactionCount: (monthIncome._count._all || 0) + (monthExpense._count._all || 0),
    });
  }

  // Yıllık toplamlar
  const [yearIncome, yearExpense] = await Promise.all([
    db.financialRecord.aggregate({
      where: {
        type: 'INCOME',
        recordedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    }),
    db.financialRecord.aggregate({
      where: {
        type: 'EXPENSE',
        recordedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  return {
    year,
    summary: {
      totalIncome: yearIncome._sum.amount || 0,
      totalExpense: yearExpense._sum.amount || 0,
      netProfit: (yearIncome._sum.amount || 0) - (yearExpense._sum.amount || 0),
      transactionCount: (yearIncome._count._all || 0) + (yearExpense._count._all || 0),
    },
    monthlyBreakdown: monthlyData,
  };
}

async function getComparisonReport(year: number) {
  const currentYear = year;
  const previousYear = year - 1;

  const [currentYearData, previousYearData] = await Promise.all([
    getYearlyReport(currentYear),
    getYearlyReport(previousYear),
  ]);

  const comparison = {
    currentYear: currentYearData.summary,
    previousYear: previousYearData.summary,
    changes: {
      incomeChange: ((currentYearData.summary.totalIncome - previousYearData.summary.totalIncome) / previousYearData.summary.totalIncome) * 100,
      expenseChange: ((currentYearData.summary.totalExpense - previousYearData.summary.totalExpense) / previousYearData.summary.totalExpense) * 100,
      profitChange: ((currentYearData.summary.netProfit - previousYearData.summary.netProfit) / Math.abs(previousYearData.summary.netProfit)) * 100,
    },
  };

  return comparison;
}

async function getTrendsReport() {
  // Son 6 ayın trend analizi
  const trends = [];
  const currentDate = new Date();

  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    const [monthIncome, monthExpense] = await Promise.all([
      db.financialRecord.aggregate({
        where: {
          type: 'INCOME',
          recordedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      db.financialRecord.aggregate({
        where: {
          type: 'EXPENSE',
          recordedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    trends.push({
      period: `${targetDate.getFullYear()}-${(targetDate.getMonth() + 1).toString().padStart(2, '0')}`,
      income: monthIncome._sum.amount || 0,
      expense: monthExpense._sum.amount || 0,
      net: (monthIncome._sum.amount || 0) - (monthExpense._sum.amount || 0),
    });
  }

  return { trends };
}

async function getGeneralReport() {
  const currentDate = new Date();
  const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const currentYearStart = new Date(currentDate.getFullYear(), 0, 1);

  const [currentMonth, currentYear, allTime] = await Promise.all([
    getMonthlyReport(currentDate.getFullYear(), currentDate.getMonth()),
    getYearlyReport(currentDate.getFullYear()),
    getTrendsReport(),
  ]);

  return {
    currentMonth,
    currentYear,
    trends: allTime.trends,
  };
}