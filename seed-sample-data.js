const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedSampleData() {
  try {
    console.log('🌱 Creating sample data...');

    // Create customers
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          name: 'Ahmet Kaya',
          email: 'ahmet@example.com',
          phone: '0533 123 4567',
          address: 'İstanbul, Kadıköy'
        }
      }),
      prisma.customer.create({
        data: {
          name: 'Fatma Yılmaz',
          email: 'fatma@example.com',
          phone: '0534 123 4567',
          address: 'Ankara, Çankaya'
        }
      }),
      prisma.customer.create({
        data: {
          name: 'Mehmet Özkan',
          email: 'mehmet@example.com',
          phone: '0535 123 4567',
          address: 'İzmir, Konak'
        }
      })
    ]);

    console.log(`✅ Created ${customers.length} customers`);

    // Get admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      console.log('❌ Admin user not found. Please create admin first.');
      return;
    }

    // Create services
    const services = await Promise.all([
      prisma.service.create({
        data: {
          serviceNumber: 'SRV-2025-001',
          customerId: customers[0].id,
          technicianId: admin.id,
          deviceType: 'PHONE',
          brand: 'Samsung',
          model: 'Galaxy S23',
          serialNumber: 'SM123456789',
          imei: '356938035643809',
          problemDescription: 'Ekran çatladı, dokunma sorunu var',
          accessories: 'Kılıf, Şarj Kablosu',
          physicalCondition: 'Genel durumu iyi, sadece ekran hasarlı',
          estimatedFee: 1500.00,
          status: 'RECEIVED'
        }
      }),
      prisma.service.create({
        data: {
          serviceNumber: 'SRV-2025-002',
          customerId: customers[1].id,
          technicianId: admin.id,
          deviceType: 'LAPTOP',
          brand: 'HP',
          model: 'Pavilion Gaming',
          serialNumber: 'HP987654321',
          problemDescription: 'Açılmıyor, güç sorunu',
          accessories: 'Şarj Adaptörü, Mouse',
          physicalCondition: 'Dış görünüm temiz',
          estimatedFee: 800.00,
          status: 'DIAGNOSIS_PENDING'
        }
      }),
      prisma.service.create({
        data: {
          serviceNumber: 'SRV-2025-003',
          customerId: customers[2].id,
          technicianId: admin.id,
          deviceType: 'TABLET',
          brand: 'Apple',
          model: 'iPad Air',
          serialNumber: 'AP456789123',
          problemDescription: 'Batarya şişmiş, şarj olmuyor',
          accessories: 'Şarj Kablosu, Kutu',
          physicalCondition: 'Arka kapak hafif çıkık',
          estimatedFee: 1200.00,
          status: 'CUSTOMER_APPROVAL_PENDING'
        }
      })
    ]);

    console.log(`✅ Created ${services.length} services`);

    // Create financial records
    const financialRecords = await Promise.all([
      prisma.financialRecord.create({
        data: {
          serviceId: services[0].id,
          amount: 1500.00,
          type: 'INCOME',
          description: 'Samsung Galaxy S23 ekran değişimi'
        }
      }),
      prisma.financialRecord.create({
        data: {
          amount: 50.00,
          type: 'EXPENSE',
          description: 'Malzeme tedarik'
        }
      })
    ]);

    console.log(`✅ Created ${financialRecords.length} financial records`);

    console.log('🎉 Sample data created successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${customers.length} customers`);
    console.log(`   - ${services.length} services`);
    console.log(`   - ${financialRecords.length} financial records`);
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSampleData();
