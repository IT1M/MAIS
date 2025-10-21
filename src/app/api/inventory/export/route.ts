import { NextRequest } from 'next/server';
import { prisma } from '@/db/client';
import { errorResponse, requireAuth, ErrorCodes } from '@/lib/api-utils';
import { createAuditLog } from '@/services/audit';
import { AuditAction } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    
    const format = searchParams.get('format') || 'csv';
    const destination = searchParams.get('destination');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = {};
    if (destination) where.destination = destination;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Fetch data
    const items = await prisma.inventoryItem.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Log export
    await createAuditLog({
      userId: user.id,
      action: AuditAction.EXPORT,
      entityType: 'InventoryItem',
      newValue: { count: items.length, format },
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
    });

    // Generate export based on format
    if (format === 'json') {
      return new Response(JSON.stringify(items, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="inventory-export-${Date.now()}.json"`,
        },
      });
    }

    // CSV format
    const headers = [
      'ID',
      'Item Name',
      'Batch',
      'Quantity',
      'Reject',
      'Destination',
      'Category',
      'Notes',
      'Entered By',
      'Created At',
    ];

    const csvRows = [
      headers.join(','),
      ...items.map(item =>
        [
          item.id,
          `"${item.itemName}"`,
          `"${item.batch}"`,
          item.quantity,
          item.reject,
          item.destination,
          `"${item.category || ''}"`,
          `"${(item.notes || '').replace(/"/g, '""')}"`,
          `"${item.user.name}"`,
          item.createdAt.toISOString(),
        ].join(',')
      ),
    ];

    return new Response(csvRows.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="inventory-export-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return errorResponse(ErrorCodes.UNAUTHORIZED, error.message, 401);
    }
    
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to export inventory',
      500,
      error
    );
  }
}
