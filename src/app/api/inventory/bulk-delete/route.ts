import { NextRequest } from 'next/server';
import { prisma } from '@/db/client';
import {
  errorResponse,
  successResponse,
  requireRole,
  ErrorCodes,
} from '@/lib/api-utils';
import { logInventoryChange } from '@/services/audit';
import { AuditAction } from '@prisma/client';

// POST /api/inventory/bulk-delete - Delete multiple inventory items
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'SUPERVISOR');
    const body = await req.json();
    
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid or empty ids array',
        400
      );
    }

    // Get existing items for audit log
    const existingItems = await prisma.inventoryItem.findMany({
      where: { id: { in: ids } },
    });

    // Delete items
    const result = await prisma.inventoryItem.deleteMany({
      where: { id: { in: ids } },
    });

    // Log deletions
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    await Promise.all(
      existingItems.map(item =>
        logInventoryChange(
          user.id,
          AuditAction.DELETE,
          item.id,
          item,
          undefined,
          ipAddress,
          userAgent
        )
      )
    );

    return successResponse({
      message: `${result.count} items deleted successfully`,
      count: result.count,
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    
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
      'Failed to delete items',
      500,
      error
    );
  }
}
