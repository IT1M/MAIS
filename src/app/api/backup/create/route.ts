import { NextRequest } from 'next/server';
import { prisma } from '@/db/client';
import { createBackupSchema } from '@/lib/validation';
import { errorResponse, successResponse, requireRole, ErrorCodes } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'ADMIN');
    const body = await req.json();

    const validation = createBackupSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid input',
        400,
        validation.error.errors
      );
    }

    const { fileType, includeAudit } = validation.data;

    // Create backup record
    const backup = await prisma.backup.create({
      data: {
        fileName: `backup-${Date.now()}.${fileType.toLowerCase()}`,
        fileSize: 0,
        fileType,
        recordCount: 0,
        storagePath: '/backups',
        status: 'IN_PROGRESS',
        createdBy: user.id,
      },
    });

    // Fetch all inventory items
    const items = await prisma.inventoryItem.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    let auditLogs: any[] = [];
    if (includeAudit) {
      auditLogs = await prisma.auditLog.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
    }

    // Generate backup data
    const backupData = {
      metadata: {
        backupId: backup.id,
        createdAt: backup.createdAt,
        createdBy: user.name,
        recordCount: items.length,
        includesAudit: includeAudit,
      },
      inventory: items,
      ...(includeAudit && { auditLogs }),
    };

    const backupContent = fileType === 'JSON'
      ? JSON.stringify(backupData, null, 2)
      : generateCSV(items);

    const fileSize = Buffer.byteLength(backupContent, 'utf8');

    // Update backup record
    const updatedBackup = await prisma.backup.update({
      where: { id: backup.id },
      data: {
        fileSize,
        recordCount: items.length,
        status: 'COMPLETED',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return successResponse(updatedBackup, 201);
  } catch (error) {
    console.error('Create backup error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return errorResponse(ErrorCodes.UNAUTHORIZED, error.message, 401);
      }
      if (error.message === 'Insufficient permissions') {
        return errorResponse(ErrorCodes.FORBIDDEN, error.message, 403);
      }
    }
    
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to create backup',
      500,
      error
    );
  }
}

function generateCSV(items: any[]): string {
  const headers = ['ID', 'Item Name', 'Batch', 'Quantity', 'Reject', 'Destination', 'Category', 'Created At'];
  const rows = items.map(item => [
    item.id,
    `"${item.itemName}"`,
    `"${item.batch}"`,
    item.quantity,
    item.reject,
    item.destination,
    `"${item.category || ''}"`,
    item.createdAt.toISOString(),
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
