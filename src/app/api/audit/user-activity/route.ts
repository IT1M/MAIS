import { NextRequest } from 'next/server';
import { prisma } from '@/db/client';
import { errorResponse, successResponse, requireAuth, ErrorCodes } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    // Get user activity summary
    const activityByUser = await prisma.auditLog.groupBy({
      by: ['userId', 'action'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Get user details
    const userIds = [...new Set(activityByUser.map(a => a.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    // Format activity data
    const activitySummary = activityByUser.reduce((acc, activity) => {
      const userId = activity.userId;
      if (!acc[userId]) {
        acc[userId] = {
          user: userMap.get(userId),
          actions: {},
          totalActions: 0,
        };
      }
      acc[userId].actions[activity.action] = activity._count.id;
      acc[userId].totalActions += activity._count.id;
      return acc;
    }, {} as Record<string, any>);

    // Get recent login history
    const recentLogins = await prisma.auditLog.findMany({
      where: {
        action: 'LOGIN',
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 20,
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

    return successResponse({
      activitySummary: Object.values(activitySummary),
      recentLogins,
    });
  } catch (error) {
    console.error('User activity error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return errorResponse(ErrorCodes.UNAUTHORIZED, error.message, 401);
    }
    
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch user activity',
      500,
      error
    );
  }
}
