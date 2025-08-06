import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = await db.service.findUnique({
      where: { id },
      include: {
        customer: true,
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        financialRecord: true,
        statusHistory: {
          orderBy: { changedAt: 'desc' },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Servis bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Service fetch error:', error);
    return NextResponse.json(
      { error: 'Servis yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      actualFee,
      status,
      notes,
      technicianId,
    } = await request.json();

    const existingService = await db.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: 'Servis bulunamadı' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    
    // Update basic service information
    if (customerId !== undefined) updateData.customerId = customerId;
    if (deviceType !== undefined) updateData.deviceType = deviceType;
    if (brand !== undefined) updateData.brand = brand;
    if (model !== undefined) updateData.model = model;
    if (serialNumber !== undefined) updateData.serialNumber = serialNumber;
    if (imei !== undefined) updateData.imei = imei;
    if (problemDescription !== undefined) updateData.problemDescription = problemDescription;
    if (accessories !== undefined) updateData.accessories = accessories;
    if (physicalCondition !== undefined) updateData.physicalCondition = physicalCondition;
    if (estimatedFee !== undefined) updateData.estimatedFee = parseFloat(estimatedFee);
    if (actualFee !== undefined) updateData.actualFee = parseFloat(actualFee);
    
    // Handle status changes
    if (status && status !== existingService.status) {
      updateData.status = status;
      
      // Update timestamps based on status
      if (status === 'COMPLETED_READY_FOR_DELIVERY') {
        updateData.completedAt = new Date();
      } else if (status === 'DELIVERED') {
        updateData.deliveredAt = new Date();
      }
    }
    
    if (technicianId !== undefined) {
      updateData.technicianId = technicianId;
    }

    const updatedService = await db.service.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        financialRecord: true,
      },
    });

    // Add status history if status changed
    if (status && status !== existingService.status) {
      await db.serviceStatusHistory.create({
        data: {
          serviceId: id,
          status,
          notes,
          changedBy: 'user',
        },
      });

      // Send email notification for specific status changes
      if (existingService.customer?.email) {
        try {
          let notificationType = '';
          let shouldNotify = false;

          switch (status) {
            case 'RECEIVED':
              notificationType = 'SERVICE_RECEIVED';
              shouldNotify = true;
              break;
            case 'CUSTOMER_APPROVAL_PENDING':
              notificationType = 'CUSTOMER_APPROVAL_PENDING';
              shouldNotify = true;
              break;
            case 'COMPLETED_READY_FOR_DELIVERY':
              notificationType = 'SERVICE_COMPLETED';
              shouldNotify = true;
              break;
          }

          if (shouldNotify) {
            // Send notification asynchronously (don't wait for it)
            fetch('/api/notifications/email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: notificationType,
                serviceId: id,
                customerEmail: existingService.customer.email,
                serviceNumber: existingService.serviceNumber,
                estimatedFee: existingService.estimatedFee,
              }),
            }).catch(error => {
              console.error('Failed to send notification:', error);
            });
          }
        } catch (error) {
          console.error('Failed to send notification:', error);
        }
      }
    }

    // Create financial record if service is delivered and doesn't have one
    if (status === 'DELIVERED' && !existingService.financialRecord) {
      const fee = actualFee || existingService.estimatedFee || 0;
      if (fee > 0) {
        await db.financialRecord.create({
          data: {
            serviceId: id,
            amount: fee,
            type: 'INCOME',
            description: `Servis ücreti - ${existingService.serviceNumber}`,
          },
        });
      }
    }

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('Service update error:', error);
    return NextResponse.json(
      { error: 'Servis güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.service.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Servis başarıyla silindi' });
  } catch (error) {
    console.error('Service deletion error:', error);
    return NextResponse.json(
      { error: 'Servis silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}