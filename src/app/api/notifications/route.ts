import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'all', 'SENT', 'FAILED'

    const whereClause = status && status !== 'all' ? { status: status } : {};

    const notifications = await db.notificationLog.findMany({
      where: whereClause,
      include: {
        service: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: 100, // Limit to last 100 notifications
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Bildirimler yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}