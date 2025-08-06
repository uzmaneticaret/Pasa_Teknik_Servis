const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Name: ${existingAdmin.name}`);
      console.log(`Role: ${existingAdmin.role}`);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@pasa.com',
        name: 'PAŞA Admin',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('Admin user created successfully:');
    console.log(`Email: ${admin.email}`);
    console.log(`Name: ${admin.name}`);
    console.log(`Password: admin123`);
    console.log(`Role: ${admin.role}`);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();