import { NextRequest } from 'next/server';
import { prisma } from '@/db/client';
import { updateInventorySchema } from '@/lib/validation';
import {
  errorResponse,
  successResponse,
  requireAuth,
  requireRole,
  ErrorCodes,
  isValidUUID,
} from '@/lib/api-utils';
import { logInventoryChange } from '@/services/audit';
import { AuditAction } from '@prisma/client';

// PATCH /api/inventory/[id] - Update inventory item
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(req, 'DATA_ENTRY');
    const { id } = params;

    // Validate UUID
    if (!isValidUUID(id)) {
      return errorResponse(ErrorCodes.BAD_REQUEST, 'Invalid item ID', 400);
    }

    const body = await req.json();
    
    // Validate input
    const validation = updateInventorySchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid input',
        400,
        validation.error.errors
      );
    }

    // Get old values
    const oldItem = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!oldItem) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Item not found', 404);
    }

    // Update item
    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: validation.data,
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

    // Log update
    await logInventoryChange(
      user.id,
      AuditAction.UPDATE,
      id,
      oldItem,
      updatedItem,
      req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      req.headers.get('user-agent') || 'unknown'
    );

    return successResponse(updatedItem);
  } catch (error) {
    console.error('Update inventory error:', error);
    
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
      'Failed to update inventory item',
      500,
      error
    );
  }
}

// DELETE /api/inventory/[id] - Delete inventory item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(req, 'SUPERVISOR');
    const { id } = params;

    // Validate UUID
    if (!isValidUUID(id)) {
      return errorResponse(ErrorCodes.BAD_REQUEST, 'Invalid item ID', 400);
    }

    // Get item before deletion
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!item) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Item not found', 404);
    }

    // Delete item
    await prisma.inventoryItem.delete({
      where: { id },
    });

    // Log deletion
    await logInventoryChange(
      user.id,
      AuditAction.DELETE,
      id,
      item,
      undefined,
      req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      req.headers.get('user-agent') || 'unknown'
    );

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Delete inventory error:', error);
    
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
      'Failed to delete inventory item',
      500,
      error
    );
  }
}
