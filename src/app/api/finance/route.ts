import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // income, expense, or all
    const period = searchParams.get('period'); // daily, weekly, monthly, or all
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (type && type !== 'all') {
      where.type = type.toUpperCase();
    }

    // Date filtering based on period
    if (period && period !== 'all') {
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
          startDate.setDate(now.getDate() - 30);
          break;
      }

      where.recordedAt = {
        gte: startDate,
      };
    }

    const [records, total] = await Promise.all([
      db.financialRecord.findMany({
        where,
        select: {
          id: true,
          amount: true,
          type: true,
          description: true,
          recordedAt: true,
          serviceId: true,
          service: {
            include: {
              customer: true,
            },
          },
        },
        orderBy: { recordedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.financialRecord.count({ where }),
    ]);

    // Calculate totals
    const totals = await db.financialRecord.groupBy({
      by: ['type'],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    });

    const incomeTotal = totals.find(t => t.type === 'INCOME')?._sum.amount || 0;
    const expenseTotal = totals.find(t => t.type === 'EXPENSE')?._sum.amount || 0;
    const netTotal = incomeTotal - expenseTotal;

    return NextResponse.json({
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: {
        income: incomeTotal,
        expense: expenseTotal,
        net: netTotal,
        transactionCount: total,
      },
    });
  } catch (error) {
    console.error('Finance records fetch error:', error);
    return NextResponse.json(
      { error: 'Finansal kayıtlar yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { amount, type, description, serviceId } = await request.json();

    if (!amount || !type) {
      return NextResponse.json(
        { error: 'Tutar ve tür alanları zorunludur' },
        { status: 400 }
      );
    }

    const financialRecord = await db.financialRecord.create({
      data: {
        amount: parseFloat(amount),
        type: type.toUpperCase(),
        description,
        serviceId,
      },
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        recordedAt: true,
        serviceId: true,
        service: {
          include: {
            customer: true,
          },
        },
      },
    });

    return NextResponse.json(financialRecord, { status: 201 });
  } catch (error) {
    console.error('Financial record creation error:', error);
    return NextResponse.json(
      { error: 'Finansal kayıt oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}