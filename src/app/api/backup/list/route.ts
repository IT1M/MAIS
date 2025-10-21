import { NextRequest } from 'next/server';
import { prisma } from '@/db/client';
import {
  errorResponse,
  successResponse,
  requireRole,
  ErrorCodes,
  parsePaginationParams,
  createPaginationResponse,
} from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, 'ADMIN');
    const { searchParams } = new URL(req.url);

    const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(searchParams);

    // Fetch backups
    const [backups, total] = await Promise.all([
      prisma.backup.findMany({
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
      prisma.backup.count(),
    ]);

    return successResponse(createPaginationResponse(backups, total, page, limit));
  } catch (error) {
    console.error('List backups error:', error);
    
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
      'Failed to list backups',
      500,
      error
    );
  }
}
