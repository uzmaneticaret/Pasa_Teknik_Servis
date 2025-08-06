import { db } from './src/lib/db';

interface NotificationData {
  type: string;
  serviceId: string;
  customerEmail: string;
  status: string;
  subject: string;
  sentAt: Date;
}

async function seedNotifications() {
  try {
    // Get some services to create notifications for
    const services = await db.service.findMany({
      include: {
        customer: true,
      },
      take: 5,
    });

    console.log('Found services:', services.length);

    if (services.length === 0) {
      console.log('No services found. Please create some services first.');
      return;
    }

    // Clear existing notifications
    await db.notificationLog.deleteMany();
    console.log('Cleared existing notifications');

    // Create sample notifications based on available services
    const notifications: NotificationData[] = [];
    
    if (services.length >= 1) {
      notifications.push({
        type: 'SERVICE_RECEIVED',
        serviceId: services[0].id,
        customerEmail: services[0].customer?.email || 'customer1@example.com',
        status: 'SENT',
        subject: 'Cihazınız Servisimize Alındı',
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      });
    }
    
    if (services.length >= 2) {
      notifications.push({
        type: 'CUSTOMER_APPROVAL_PENDING',
        serviceId: services[1].id,
        customerEmail: services[1].customer?.email || 'customer2@example.com',
        status: 'SENT',
        subject: 'Servis Onayı Bekleniyor',
        sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      });
    }
    
    if (services.length >= 3) {
      notifications.push({
        type: 'SERVICE_COMPLETED',
        serviceId: services[2].id,
        customerEmail: services[2].customer?.email || 'customer3@example.com',
        status: 'SENT',
        subject: 'Cihazınızın Tamiri Tamamlandı',
        sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      });
    }
    
    if (services.length >= 1) {
      notifications.push({
        type: 'SERVICE_RECEIVED',
        serviceId: services[0].id,
        customerEmail: services[0].customer?.email || 'customer1@example.com',
        status: 'FAILED',
        subject: 'Cihazınız Servisimize Alındı',
        sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      });
    }
    
    if (services.length >= 2) {
      notifications.push({
        type: 'CUSTOMER_APPROVAL_PENDING',
        serviceId: services[1].id,
        customerEmail: services[1].customer?.email || 'customer2@example.com',
        status: 'SENT',
        subject: 'Servis Onayı Bekleniyor',
        sentAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      });
    }

    console.log('Creating notifications...');

    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i];
      if (!notification.serviceId) {
        console.log(`Skipping notification ${i + 1}: no serviceId`);
        continue;
      }
      
      await db.notificationLog.create({
        data: notification,
      });
      console.log(`Created notification ${i + 1}`);
    }

    console.log('Sample notifications created successfully!');
    console.log(`Created ${notifications.length} notification logs`);
  } catch (error) {
    console.error('Error seeding notifications:', error);
    console.error('Stack:', error.stack);
  } finally {
    await db.$disconnect();
  }
}

seedNotifications();