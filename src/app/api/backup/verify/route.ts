import { NextRequest, NextResponse } from 'next/server';
import { verifyBackup } from '@/services/backup';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { backupId } = body;

    if (!backupId) {
      return NextResponse.json(
        { error: 'Backup ID is required' },
        { status: 400 }
      );
    }

    const isValid = await verifyBackup(backupId);

    return NextResponse.json({
      valid: isValid,
      message: isValid ? 'Backup is valid' : 'Backup is corrupted or invalid',
    });
  } catch (error: any) {
    console.error('Failed to verify backup:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify backup' },
      { status: 500 }
    );
  }
}
