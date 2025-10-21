import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/db/client';
import { createBackup, getBackupHealth } from '@/services/backup';
import { BackupFileType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'health') {
      const health = await getBackupHealth();
      return NextResponse.json(health);
    }

    // Fetch backup history
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    const [backups, total] = await Promise.all([
      prisma.backup.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.backup.count(),
    ]);

    return NextResponse.json({
      backups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch backups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, options } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate formats
    const validFormats = Object.values(BackupFileType);
    if (!options.formats.every((f: string) => validFormats.includes(f as BackupFileType))) {
      return NextResponse.json(
        { error: 'Invalid backup format' },
        { status: 400 }
      );
    }

    const backupId = await createBackup(userId, options);

    return NextResponse.json({
      success: true,
      backupId,
      message: 'Backup created successfully',
    });
  } catch (error: any) {
    console.error('Failed to create backup:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create backup' },
      { status: 500 }
    );
  }
}
