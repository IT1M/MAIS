import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/services/auth';
import { prisma } from '@/services/prisma';

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appearanceSettings = await request.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    const currentPreferences = (user?.preferences as any) || {};

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        preferences: {
          ...currentPreferences,
          appearance: appearanceSettings,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Appearance settings error:', error);
    return NextResponse.json({ error: 'Failed to save appearance settings' }, { status: 500 });
  }
}
