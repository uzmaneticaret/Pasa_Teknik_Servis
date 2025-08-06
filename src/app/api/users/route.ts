import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    
    let whereClause = {};
    
    if (role) {
      whereClause = { role };
    }

    const users = await db.user.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    return NextResponse.json(users);

  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { error: 'Kullanıcılar yüklenemedi' },
      { status: 500 }
    );
  }
}