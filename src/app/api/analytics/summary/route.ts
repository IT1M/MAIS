import { NextRequest } from 'next/server';
import { prisma } from '@/db/client';
import { errorResponse, successResponse, requireAuth, ErrorCodes } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    // Get total counts
    const [totalItems, inventoryStats] = await Promise.all([
      prisma.inventoryItem.count(),
      prisma.inventoryItem.aggregate({
        _sum: {
          quantity: true,
          reject: true,
        },
      }),
    ]);

    const totalQuantity = inventoryStats._sum.quantity || 0;
    const totalRejects = inventoryStats._sum.reject || 0;
    const rejectRate = totalQuantity > 0 ? (totalRejects / totalQuantity) * 100 : 0;

    // Group by destination
    const byDestination = await prisma.inventoryItem.groupBy({
      by: ['destination'],
      _sum: {
        quantity: true,
        reject: true,
      },
      _count: {
        id: true,
      },
    });

    // Group by category
    const byCategory = await prisma.inventoryItem.groupBy({
      by: ['category'],
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await prisma.$queryRaw<
      Array<{ month: string; count: number; quantity: number }>
    >`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
        COUNT(*)::int as count,
        SUM(quantity)::int as quantity
      FROM inventory_items
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    `;

    return successResponse({
      summary: {
        totalItems,
        totalQuantity,
        totalRejects,
        rejectRate: parseFloat(rejectRate.toFixed(2)),
      },
      byDestination: byDestination.map(d => ({
        destination: d.destination,
        count: d._count.id,
        quantity: d._sum.quantity || 0,
        rejects: d._sum.reject || 0,
      })),
      byCategory: byCategory.map(c => ({
        category: c.category || 'Uncategorized',
        count: c._count.id,
        quantity: c._sum.quantity || 0,
      })),
      monthlyTrend: monthlyData,
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return errorResponse(ErrorCodes.UNAUTHORIZED, error.message, 401);
    }
    
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch analytics summary',
      500,
      error
    );
  }
}
