import { NextRequest } from 'next/server';
import { prisma } from '@/db/client';
import { analyticsQuerySchema } from '@/lib/validation';
import { errorResponse, successResponse, requireAuth, ErrorCodes } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const validation = analyticsQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    );

    if (!validation.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid query parameters',
        400,
        validation.error.errors
      );
    }

    const { period, groupBy } = validation.data;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Determine SQL date truncation
    let dateTrunc = 'day';
    if (groupBy === 'week') dateTrunc = 'week';
    if (groupBy === 'month') dateTrunc = 'month';

    // Fetch trend data
    const trendData = await prisma.$queryRaw<
      Array<{
        period: string;
        count: number;
        quantity: number;
        rejects: number;
      }>
    >`
      SELECT 
        TO_CHAR(DATE_TRUNC(${dateTrunc}, "createdAt"), 'YYYY-MM-DD') as period,
        COUNT(*)::int as count,
        SUM(quantity)::int as quantity,
        SUM(reject)::int as rejects
      FROM inventory_items
      WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
      GROUP BY DATE_TRUNC(${dateTrunc}, "createdAt")
      ORDER BY period ASC
    `;

    // Calculate growth rates
    const growthRates = trendData.map((item, index) => {
      if (index === 0) return { ...item, growthRate: 0 };
      
      const prevQuantity = trendData[index - 1].quantity;
      const growthRate = prevQuantity > 0
        ? ((item.quantity - prevQuantity) / prevQuantity) * 100
        : 0;
      
      return {
        ...item,
        growthRate: parseFloat(growthRate.toFixed(2)),
      };
    });

    // Find peak period
    const peakPeriod = trendData.reduce((max, item) =>
      item.quantity > max.quantity ? item : max
    , trendData[0] || { period: '', quantity: 0 });

    return successResponse({
      trends: growthRates,
      peakPeriod,
      summary: {
        totalPeriods: trendData.length,
        averageQuantity: trendData.length > 0
          ? Math.round(trendData.reduce((sum, item) => sum + item.quantity, 0) / trendData.length)
          : 0,
        totalQuantity: trendData.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    console.error('Analytics trends error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return errorResponse(ErrorCodes.UNAUTHORIZED, error.message, 401);
    }
    
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch trends',
      500,
      error
    );
  }
}
