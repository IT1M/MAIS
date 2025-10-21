import { NextRequest } from 'next/server';
import { prisma } from '@/db/client';
import { aiInsightsSchema } from '@/lib/validation';
import { errorResponse, successResponse, requireAuth, ErrorCodes } from '@/lib/api-utils';
import { analyzeInventory, generateTrendPredictions } from '@/services/gemini';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    const validation = aiInsightsSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid input',
        400,
        validation.error.errors
      );
    }

    const { dataType, period } = validation.data;

    if (dataType === 'inventory') {
      // Fetch inventory data for the period
      const items = await prisma.inventoryItem.findMany({
        where: {
          createdAt: {
            gte: period.start,
            lte: period.end,
          },
        },
      });

      // Calculate statistics
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalRejects = items.reduce((sum, item) => sum + item.reject, 0);
      const rejectRate = totalQuantity > 0 ? (totalRejects / totalQuantity) * 100 : 0;

      // Group by destination
      const byDestination = items.reduce((acc, item) => {
        if (!acc[item.destination]) {
          acc[item.destination] = { count: 0, quantity: 0, rejects: 0 };
        }
        acc[item.destination].count++;
        acc[item.destination].quantity += item.quantity;
        acc[item.destination].rejects += item.reject;
        return acc;
      }, {} as Record<string, any>);

      // Group by category
      const byCategory = items.reduce((acc, item) => {
        const cat = item.category || 'Uncategorized';
        if (!acc[cat]) {
          acc[cat] = { count: 0, quantity: 0 };
        }
        acc[cat].count++;
        acc[cat].quantity += item.quantity;
        return acc;
      }, {} as Record<string, any>);

      // Get AI insights
      const insights = await analyzeInventory({
        items,
        totalQuantity,
        rejectRate,
        byDestination,
        byCategory,
      });

      return successResponse(insights);
    }

    if (dataType === 'trends') {
      // Fetch historical data
      const items = await prisma.inventoryItem.findMany({
        where: {
          createdAt: {
            gte: period.start,
            lte: period.end,
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Group by date
      const dailyData = items.reduce((acc, item) => {
        const date = item.createdAt.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { quantity: 0, rejects: 0 };
        }
        acc[date].quantity += item.quantity;
        acc[date].rejects += item.reject;
        return acc;
      }, {} as Record<string, any>);

      const dates = Object.keys(dailyData).sort();
      const quantities = dates.map(d => dailyData[d].quantity);
      const rejects = dates.map(d => dailyData[d].rejects);

      // Get trend predictions
      const predictions = await generateTrendPredictions({
        dates,
        quantities,
        rejects,
      });

      return successResponse(predictions);
    }

    return errorResponse(
      ErrorCodes.BAD_REQUEST,
      'Unsupported data type',
      400
    );
  } catch (error) {
    console.error('AI insights error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return errorResponse(ErrorCodes.UNAUTHORIZED, error.message, 401);
    }
    
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to generate AI insights',
      500,
      error
    );
  }
}
