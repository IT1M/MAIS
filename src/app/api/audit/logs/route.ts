import { NextRequest } from 'next/server';
import { prisma } from '@/db/client';
import {
  errorResponse,
  successResponse,
  requireAuth,
  ErrorCodes,
  parsePaginationParams,
  createPaginationResponse,
} from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(searchParams);

    // Build where clause
    const where: any = {};
    
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    // Fetch logs
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
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
              role: true,
            },
          },
          inventoryItem: {
            select: {
              id: true,
              itemName: true,
              batch: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return successResponse(createPaginationResponse(logs, total, page, limit));
  } catch (error) {
    console.error('Audit logs error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return errorResponse(ErrorCodes.UNAUTHORIZED, error.message, 401);
    }
    
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch audit logs',
      500,
      error
    );
  }
}
