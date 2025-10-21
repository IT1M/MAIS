import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/services/auth';
import { prisma } from '@/services/prisma';

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is ADMIN or MANAGER
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const systemSettings = await request.json();

    // Save each category of settings
    const settingsToSave = [
      { key: 'company', value: systemSettings.company, category: 'company' },
      { key: 'inventory', value: systemSettings.inventory, category: 'inventory' },
      { key: 'backup', value: systemSettings.backup, category: 'backup' },
      { key: 'dataRetention', value: systemSettings.dataRetention, category: 'data' },
      { key: 'limits', value: systemSettings.limits, category: 'limits' },
      { key: 'developer', value: systemSettings.developer, category: 'developer' },
    ];

    for (const setting of settingsToSave) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: {
          value: setting.value,
          category: setting.category,
          updatedBy: session.user.id,
        },
        create: {
          key: setting.key,
          value: setting.value,
          category: setting.category,
          updatedBy: session.user.id,
        },
      });
    }

    // Log the system settings change
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'SYSTEM_SETTINGS',
        newValue: systemSettings,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('System settings error:', error);
    return NextResponse.json({ error: 'Failed to save system settings' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.systemSettings.findMany();

    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json(settingsObject);
  } catch (error) {
    console.error('Get system settings error:', error);
    return NextResponse.json({ error: 'Failed to get system settings' }, { status: 500 });
  }
}
