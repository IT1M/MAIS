import { NextRequest } from 'next/server';
import { prisma } from '@/db/client';
import { generateReportSchema } from '@/lib/validation';
import { errorResponse, successResponse, requireRole, ErrorCodes } from '@/lib/api-utils';
import { generateMonthlyInsights } from '@/services/gemini';

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, 'SUPERVISOR');
    const body = await req.json();

    const validation = generateReportSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid input',
        400,
        validation.error.errors
      );
    }

    const { type, periodStart, periodEnd, includeCharts, includeAiInsights, title } = validation.data;

    // Create report record with GENERATING status
    const report = await prisma.report.create({
      data: {
        title: title || `${type} Report - ${periodStart.toISOString().split('T')[0]}`,
        type,
        periodStart,
        periodEnd,
        generatedBy: user.id,
        status: 'GENERATING',
        dataSnapshot: {},
      },
    });

    // Fetch inventory data for period
    const items = await prisma.inventoryItem.findMany({
      where: {
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Calculate analytics
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalRejects = items.reduce((sum, item) => sum + item.reject, 0);
    const rejectRate = totalQuantity > 0 ? (totalRejects / totalQuantity) * 100 : 0;

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

    const topCategories = Object.entries(byCategory)
      .map(([category, data]: [string, any]) => ({ category, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const dataSnapshot = {
      totalItems: items.length,
      totalQuantity,
      totalRejects,
      rejectRate,
      byCategory,
      topCategories,
    };

    // Generate AI insights if requested
    let aiInsights = null;
    if (includeAiInsights) {
      try {
        aiInsights = await generateMonthlyInsights({
          month: periodStart.toISOString().split('T')[0],
          totalItems: items.length,
          totalQuantity,
          rejectRate,
          topCategories,
          comparisonToPrevious: { quantityChange: 0, rejectChange: 0 },
        });
      } catch (error) {
        console.error('Failed to generate AI insights:', error);
      }
    }

    // Update report with data
    const updatedReport = await prisma.report.update({
      where: { id: report.id },
      data: {
        status: 'COMPLETED',
        dataSnapshot,
        aiInsights,
        fileUrl: `/api/reports/${report.id}/download`,
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

    return successResponse(updatedReport, 201);
  } catch (error) {
    console.error('Generate report error:', error);
    
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
      'Failed to generate report',
      500,
      error
    );
  }
}
