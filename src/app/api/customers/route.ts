import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let whereClause = {};
    
    if (search) {
      whereClause = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const customers = await db.customer.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        services: {
          select: {
            id: true,
            serviceNumber: true,
            status: true,
            createdAt: true,
            deviceType: true,
            brand: true,
            model: true
          }
        }
      }
    });

    return NextResponse.json(customers);

  } catch (error) {
    console.error('Customers fetch error:', error);
    return NextResponse.json(
      { error: 'Müşteriler yüklenemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, address } = await request.json();

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'İsim ve telefon alanları zorunludur' },
        { status: 400 }
      );
    }

    const customer = await db.customer.create({
      data: {
        name,
        email,
        phone,
        address
      }
    });

    return NextResponse.json(customer, { status: 201 });

  } catch (error) {
    console.error('Customer creation error:', error);
    return NextResponse.json(
      { error: 'Müşteri oluşturulamadı' },
      { status: 500 }
    );
  }
}