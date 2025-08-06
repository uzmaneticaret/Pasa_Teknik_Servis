import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        services: {
          orderBy: { createdAt: 'desc' },
          include: {
            technician: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Müşteri bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);

  } catch (error) {
    console.error('Customer fetch error:', error);
    return NextResponse.json(
      { error: 'Müşteri yüklenemedi' },
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
    const { name, email, phone, address } = await request.json();

    const customer = await db.customer.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address
      }
    });

    return NextResponse.json(customer);

  } catch (error) {
    console.error('Customer update error:', error);
    return NextResponse.json(
      { error: 'Müşteri güncellenemedi' },
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
    await db.customer.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Müşteri silindi' });

  } catch (error) {
    console.error('Customer deletion error:', error);
    return NextResponse.json(
      { error: 'Müşteri silinemedi' },
      { status: 500 }
    );
  }
}