import { NextRequest, NextResponse } from 'next/server';
import { restoreBackup } from '@/services/backup';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { backupId, userId, mode, adminPassword } = body;

    if (!backupId || !userId) {
      return NextResponse.json(
        { error: 'Backup ID and User ID are required' },
        { status: 400 }
      );
    }

    // In production, verify admin password here
    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Admin password is required for restore operations' },
        { status: 401 }
      );
    }

    const result = await restoreBackup(backupId, userId, mode || 'full');

    return NextResponse.json({
      success: result.success,
      result,
    });
  } catch (error: any) {
    console.error('Failed to restore backup:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to restore backup' },
      { status: 500 }
    );
  }
}
