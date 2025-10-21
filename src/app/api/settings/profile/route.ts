import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/services/auth';
import { prisma } from '@/services/prisma';

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, employeeId, department, phone, workLocation, avatar } = data;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        preferences: {
          ...(typeof session.user === 'object' && 'preferences' in session.user 
            ? (session.user.preferences as object) 
            : {}),
          employeeId,
          department,
          phone,
          workLocation,
          avatar,
        },
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
