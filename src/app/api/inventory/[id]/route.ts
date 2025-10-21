import { NextRequest } from 'next/server';
import { prisma } from '@/db/client';
import { createInventorySchema } from '@/lib/validation';
import {
  errorResponse,
  successResponse,
  requireAuth,
  requireRole,
  ErrorCodes,
} from '@/lib/api-utils';
import { logInventoryChange } from '@/services/audit';
import { AuditAction } from '@prisma/client';

// GET /api/inventory/[id] - Get single inventory item
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(req);
    const { id } = params;

    const item = await prisma.inventoryItem.findUnique({
      where: { id },
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

    if (!item) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Item not found', 404);
    }

    return successResponse(item);
  } catch (error) {
    console.error('Get inventory item error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return errorResponse(ErrorCodes.UNAUTHORIZED, error.message, 401);
    }
    
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch inventory item',
      500,
      error
    );
  }
}

// PUT /api/inventory/[id] - Update inventory item
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(req, 'DATA_ENTRY');
    const { id } = params;

    // Get existing item
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Item not found', 404);
    }

    // Check permissions - only creator, supervisor, or admin can edit
    if (
      existingItem.enteredBy !== user.id &&
      user.role !== 'ADMIN' &&
      user.role !== 'SUPERVISOR'
    ) {
      return errorResponse(
        ErrorCodes.FORBIDDEN,
        'You can only edit your own entries',
        403
      );
    }

    const body = await req.json();
    
    // Validate input
    const validation = createInventorySchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid input',
        400,
        validation.error.errors
      );
    }

    const data = validation.data;

    // Update inventory item
    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data,
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
      existingItem,
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

    // Get existing item
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Item not found', 404);
    }

    // Delete inventory item
    await prisma.inventoryItem.delete({
      where: { id },
    });

    // Log deletion
    await logInventoryChange(
      user.id,
      AuditAction.DELETE,
      id,
      existingItem,
      undefined,
      req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      req.headers.get('user-agent') || 'unknown'
    );

    return successResponse({ message: 'Item deleted successfully' });
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
