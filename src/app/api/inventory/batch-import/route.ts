import { NextRequest } from 'next/server';
import { prisma } from '@/db/client';
import { batchImportRowSchema } from '@/lib/validation';
import {
  errorResponse,
  successResponse,
  requireRole,
  ErrorCodes,
} from '@/lib/api-utils';
import { createAuditLog } from '@/services/audit';
import { AuditAction } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'DATA_ENTRY');

    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Items array is required',
        400
      );
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string }>,
    };

    // Validate all rows first
    const validatedItems = [];
    for (let i = 0; i < items.length; i++) {
      const validation = batchImportRowSchema.safeParse(items[i]);
      if (!validation.success) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: validation.error.errors.map(e => e.message).join(', '),
        });
      } else {
        validatedItems.push(validation.data);
      }
    }

    // Create items in transaction
    if (validatedItems.length > 0) {
      try {
        await prisma.$transaction(
          validatedItems.map(item =>
            prisma.inventoryItem.create({
              data: {
                ...item,
                enteredBy: user.id,
              },
            })
          )
        );
        results.success = validatedItems.length;
      } catch (error) {
        console.error('Batch import transaction error:', error);
        return errorResponse(
          ErrorCodes.INTERNAL_ERROR,
          'Failed to import items',
          500,
          error
        );
      }
    }

    // Log bulk import
    await createAuditLog({
      userId: user.id,
      action: AuditAction.CREATE,
      entityType: 'InventoryItem',
      newValue: { count: results.success },
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
    });

    return successResponse(results);
  } catch (error) {
    console.error('Batch import error:', error);
    
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
      'Failed to import items',
      500,
      error
    );
  }
}
