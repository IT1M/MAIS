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
    
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (type) where.type = type;
    if (status) where.status = status;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Fetch reports
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
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
      prisma.report.count({ where }),
    ]);

    return successResponse(createPaginationResponse(reports, total, page, limit));
  } catch (error) {
    console.error('Get reports error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return errorResponse(ErrorCodes.UNAUTHORIZED, error.message, 401);
    }
    
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch reports',
      500,
      error
    );
  }
}
