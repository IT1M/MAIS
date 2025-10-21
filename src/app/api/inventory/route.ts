import { NextRequest } from 'next/server';
import { prisma } from '@/db/client';
import { createInventorySchema, inventoryQuerySchema } from '@/lib/validation';
import {
  errorResponse,
  successResponse,
  requireAuth,
  requireRole,
  ErrorCodes,
  parsePaginationParams,
  createPaginationResponse,
  checkRateLimit,
} from '@/lib/api-utils';
import { logInventoryChange } from '@/services/audit';
import { AuditAction } from '@prisma/client';

// GET /api/inventory - List inventory items with filters
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    
    // Rate limiting
    if (!checkRateLimit(user.id)) {
      return errorResponse(ErrorCodes.RATE_LIMIT, 'Rate limit exceeded', 429);
    }

    const { searchParams } = new URL(req.url);
    
    // Validate query parameters
    const queryValidation = inventoryQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    );
    
    if (!queryValidation.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid query parameters',
        400,
        queryValidation.error.errors
      );
    }

    const {
      page,
      limit,
      search,
      destination,
      category,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    } = queryValidation.data;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { itemName: { contains: search, mode: 'insensitive' } },
        { batch: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (destination) {
      where.destination = destination;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Execute query
    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    return successResponse(createPaginationResponse(items, total, page, limit));
  } catch (error) {
    console.error('Get inventory error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return errorResponse(ErrorCodes.UNAUTHORIZED, error.message, 401);
    }
    
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch inventory',
      500,
      error
    );
  }
}

// POST /api/inventory - Create new inventory item
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'DATA_ENTRY');
    
    // Rate limiting
    if (!checkRateLimit(user.id)) {
      return errorResponse(ErrorCodes.RATE_LIMIT, 'Rate limit exceeded', 429);
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

    // Create inventory item
    const item = await prisma.inventoryItem.create({
      data: {
        ...data,
        enteredBy: user.id,
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

    // Log creation
    await logInventoryChange(
      user.id,
      AuditAction.CREATE,
      item.id,
      undefined,
      item,
      req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      req.headers.get('user-agent') || 'unknown'
    );

    return successResponse(item, 201);
  } catch (error) {
    console.error('Create inventory error:', error);
    
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
      'Failed to create inventory item',
      500,
      error
    );
  }
}
