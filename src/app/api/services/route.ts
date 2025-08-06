import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    let whereClause = {};
    
    if (search) {
      whereClause = {
        OR: [
          { serviceNumber: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { customer: { phone: { contains: search, mode: 'insensitive' } } },
          { brand: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { serialNumber: { contains: search, mode: 'insensitive' } },
          { imei: { contains: search, mode: 'insensitive' } }
        ]
      };
    }
    
    if (status) {
      whereClause = {
        ...whereClause,
        status: status
      };
    }

    // Get total count for pagination
    const total = await db.service.count({ where: whereClause });
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const services = await db.service.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      services,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      }
    });

  } catch (error) {
    console.error('Services fetch error:', error);
    return NextResponse.json(
      { error: 'Servisler yüklenemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      customerId,
      deviceType,
      brand,
      model,
      serialNumber,
      imei,
      problemDescription,
      accessories,
      physicalCondition,
      estimatedFee,
      technicianId
    } = await request.json();

    if (!customerId || !deviceType || !brand || !model || !problemDescription) {
      return NextResponse.json(
        { error: 'Zorunlu alanlar: Müşteri, Cihaz Tipi, Marka, Model, Sorun Açıklaması' },
        { status: 400 }
      );
    }

    // Generate unique service number
    const serviceNumber = `SRV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const service = await db.service.create({
      data: {
        serviceNumber,
        customerId,
        deviceType,
        brand,
        model,
        serialNumber,
        imei,
        problemDescription,
        accessories,
        physicalCondition,
        estimatedFee: estimatedFee ? parseFloat(estimatedFee) : null,
        technicianId
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create initial status history
    await db.serviceStatusHistory.create({
      data: {
        serviceId: service.id,
        status: 'RECEIVED',
        notes: 'Servis kaydı oluşturuldu',
        changedBy: 'system'
      }
    });

    return NextResponse.json(service, { status: 201 });

  } catch (error) {
    console.error('Service creation error:', error);
    return NextResponse.json(
      { error: 'Servis oluşturulamadı' },
      { status: 500 }
    );
  }
}