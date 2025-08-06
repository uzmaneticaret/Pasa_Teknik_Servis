import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, notes, technicianId, actualFee } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Durum alanı zorunludur' },
        { status: 400 }
      );
    }

    // Get current service
    const currentService = await db.service.findUnique({
      where: { id }
    });

    if (!currentService) {
      return NextResponse.json(
        { error: 'Servis bulunamadı' },
        { status: 404 }
      );
    }

    // Update service
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    // Set timestamps based on status
    if (status === 'COMPLETED_READY_FOR_DELIVERY') {
      updateData.completedAt = new Date();
    } else if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
      if (actualFee) {
        updateData.actualFee = parseFloat(actualFee);
      }
    }

    if (technicianId) {
      updateData.technicianId = technicianId;
    }

    const updatedService = await db.service.update({
      where: { id },
      data: updateData,
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

    // Create status history record
    await db.serviceStatusHistory.create({
      data: {
        serviceId: id,
        status,
        notes: notes || '',
        changedBy: 'user' // In a real app, this would be the logged-in user
      }
    });

    // Create financial record if service is delivered
    if (status === 'DELIVERED' && actualFee) {
      await db.financialRecord.upsert({
        where: { serviceId: id },
        update: {
          amount: parseFloat(actualFee),
          type: 'INCOME',
          description: `Servis geliri - ${updatedService.serviceNumber}`,
          recordedAt: new Date()
        },
        create: {
          serviceId: id,
          amount: parseFloat(actualFee),
          type: 'INCOME',
          description: `Servis geliri - ${updatedService.serviceNumber}`,
          recordedAt: new Date()
        }
      });
    }

    return NextResponse.json(updatedService);

  } catch (error) {
    console.error('Service status update error:', error);
    return NextResponse.json(
      { error: 'Servis durumu güncellenemedi' },
      { status: 500 }
    );
  }
}