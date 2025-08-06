import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const record = await db.financialRecord.findUnique({
      where: { id },
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

    if (!record) {
      return NextResponse.json(
        { error: 'Finansal kayıt bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error('Finance record fetch error:', error);
    return NextResponse.json(
      { error: 'Finansal kayıt yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const { amount, type, description, serviceId } = await request.json();

    if (!amount || !type) {
      return NextResponse.json(
        { error: 'Tutar ve tür alanları zorunludur' },
        { status: 400 }
      );
    }

    const existingRecord = await db.financialRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Finansal kayıt bulunamadı' },
        { status: 404 }
      );
    }

    const financialRecord = await db.financialRecord.update({
      where: { id },
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

    return NextResponse.json(financialRecord);
  } catch (error) {
    console.error('Financial record update error:', error);
    return NextResponse.json(
      { error: 'Finansal kayıt güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const existingRecord = await db.financialRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Finansal kayıt bulunamadı' },
        { status: 404 }
      );
    }

    await db.financialRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Financial record deletion error:', error);
    return NextResponse.json(
      { error: 'Finansal kayıt silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}