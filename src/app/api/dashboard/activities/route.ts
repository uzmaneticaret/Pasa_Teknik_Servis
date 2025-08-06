import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: Date;
  icon: string;
  color: string;
}

export async function GET() {
  try {
    // Get recent activities from different sources
    const [recentServices, recentCustomers] = await Promise.all([
      // Recent services
      db.service.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          customer: {
            select: { name: true }
          }
        }
      }),
      
      // Recent customers
      db.customer.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          name: true,
          createdAt: true
        }
      })
    ]);

    // Combine and format activities
    const activities: Activity[] = [];

    // Add service activities
    recentServices.forEach(service => {
      // Service creation activity
      activities.push({
        id: `service-${service.id}`,
        type: 'SERVICE_CREATED',
        title: 'Yeni servis kaydı oluşturuldu',
        description: `${service.serviceNumber} - ${service.deviceModel}`,
        time: service.createdAt,
        icon: 'Package',
        color: 'blue'
      });

      // Service completion activity (if completed)
      if (service.status === 'COMPLETED' && service.completedAt) {
        activities.push({
          id: `service-completed-${service.id}`,
          type: 'SERVICE_COMPLETED',
          title: 'Servis tamamlandı',
          description: `${service.serviceNumber} - ${service.deviceModel}`,
          time: service.completedAt,
          icon: 'CheckCircle',
          color: 'green'
        });
      }
    });

    // Add customer activities
    recentCustomers.forEach(customer => {
      activities.push({
        id: `customer-${customer.id}`,
        type: 'CUSTOMER_ADDED',
        title: 'Yeni müşteri eklendi',
        description: customer.name,
        time: customer.createdAt,
        icon: 'Users',
        color: 'purple'
      });
    });

    // Sort all activities by time (newest first) and take top 6
    const sortedActivities = activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 6)
      .map(activity => ({
        ...activity,
        timeAgo: getTimeAgo(activity.time)
      }));

    return NextResponse.json(sortedActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Şimdi';
  if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} saat önce`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} gün önce`;
  
  return new Date(date).toLocaleDateString('tr-TR');
}
