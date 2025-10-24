import { prisma } from '@/db/client';
import { ReportType, ReportStatus } from '@prisma/client';
import { ReportConfig, ReportData, ReportProgress } from '@/types/report';
import { analyzeInventory } from './gemini';
import { createAuditLog } from './audit';

export async function generateReport(
  userId: string,
  config: ReportConfig,
  onProgress?: (progress: ReportProgress) => void
): Promise<string> {
  // Create report record
  const report = await prisma.report.create({
    data: {
      title: generateReportTitle(config),
      type: config.type,
      periodStart: config.period.start,
      periodEnd: config.period.end,
      generatedBy: userId,
      status: ReportStatus.GENERATING,
      dataSnapshot: {},
    },
  });

  try {
    // Fetch data
    onProgress?.({
      step: 'Fetching inventory data...',
      percentage: 10,
      message: 'Loading inventory items from database',
    });

    const items = await prisma.inventoryItem.findMany({
      where: {
        createdAt: {
          gte: config.period.start,
          lte: config.period.end,
        },
      },
      include: {
        user: {
          select: { name: true, role: true },
        },
      },
    });

    // Calculate statistics
    onProgress?.({
      step: 'Calculating statistics...',
      percentage: 25,
      message: 'Processing inventory data',
    });

    const reportData = await calculateReportData(items, config);

    // Generate charts
    if (config.content.charts) {
      onProgress?.({
        step: 'Generating charts...',
        percentage: 40,
        message: 'Creating visualizations',
      });
      // Chart generation would happen here
    }

    // Request AI insights
    let aiInsights: string | undefined;
    if (config.content.aiInsights) {
      onProgress?.({
        step: 'Requesting AI insights from Gemini...',
        percentage: 60,
        message: 'Analyzing data with AI',
      });

      try {
        const byDestination: Record<string, any> = {};
        reportData.destinationData.forEach(d => {
          byDestination[d.destination] = { count: d.count, percentage: d.percentage };
        });
        
        const byCategory: Record<string, any> = {};
        reportData.categoryBreakdown.forEach(c => {
          byCategory[c.category] = { count: c.count, quantity: c.quantity, rejectRate: c.rejectRate };
        });
        
        const analysis = await analyzeInventory({
          items,
          totalQuantity: reportData.summary.totalQuantity,
          rejectRate: reportData.summary.overallRejectRate,
          byDestination,
          byCategory,
        });
        aiInsights = JSON.stringify(analysis, null, 2);
      } catch (error) {
        console.error('Failed to generate AI insights:', error);
      }
    }

    // Create document
    onProgress?.({
      step: `Creating ${config.format.toUpperCase()} document...`,
      percentage: 80,
      message: 'Formatting report',
    });

    const fileUrl = await createReportDocument(reportData, config, aiInsights);

    // Update report
    await prisma.report.update({
      where: { id: report.id },
      data: {
        status: ReportStatus.COMPLETED,
        dataSnapshot: reportData as any,
        aiInsights,
        fileUrl,
      },
    });

    // Send email if configured
    if (config.email?.enabled) {
      onProgress?.({
        step: 'Sending email...',
        percentage: 95,
        message: 'Delivering report',
      });
      // Email sending would happen here
    }

    // Create audit log
    await createAuditLog({
      userId,
      action: 'EXPORT',
      entityType: 'Report',
      entityId: report.id,
      newValue: {
        type: config.type,
        period: config.period,
      },
    });

    onProgress?.({
      step: 'Report ready!',
      percentage: 100,
      message: 'Report generated successfully',
    });

    return report.id;
  } catch (error) {
    await prisma.report.update({
      where: { id: report.id },
      data: { status: ReportStatus.FAILED },
    });
    throw error;
  }
}

function generateReportTitle(config: ReportConfig): string {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  switch (config.type) {
    case ReportType.MONTHLY:
      return `Monthly Report - ${monthNames[config.period.start.getMonth()]} ${config.period.start.getFullYear()}`;
    case ReportType.YEARLY:
      return `Yearly Report - ${config.period.start.getFullYear()}`;
    case ReportType.AUDIT:
      return `Audit Report - ${config.period.start.toLocaleDateString()}`;
    default:
      return `Custom Report - ${config.period.start.toLocaleDateString()} to ${config.period.end.toLocaleDateString()}`;
  }
}

async function calculateReportData(items: any[], config: ReportConfig): Promise<ReportData> {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalRejects = items.reduce((sum, item) => sum + item.reject, 0);
  const overallRejectRate = totalQuantity > 0 ? (totalRejects / totalQuantity) * 100 : 0;

  // Category breakdown
  const categoryMap = new Map<string, { count: number; quantity: number; rejects: number }>();
  items.forEach(item => {
    const category = item.category || 'Uncategorized';
    const existing = categoryMap.get(category) || { count: 0, quantity: 0, rejects: 0 };
    categoryMap.set(category, {
      count: existing.count + 1,
      quantity: existing.quantity + item.quantity,
      rejects: existing.rejects + item.reject,
    });
  });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    count: data.count,
    quantity: data.quantity,
    rejectRate: data.quantity > 0 ? (data.rejects / data.quantity) * 100 : 0,
  }));

  // Destination data
  const maisCount = items.filter(i => i.destination === 'MAIS').length;
  const fozanCount = items.filter(i => i.destination === 'FOZAN').length;
  const total = maisCount + fozanCount;

  const destinationData = [
    {
      destination: 'MAIS',
      count: maisCount,
      percentage: total > 0 ? (maisCount / total) * 100 : 0,
    },
    {
      destination: 'FOZAN',
      count: fozanCount,
      percentage: total > 0 ? (fozanCount / total) * 100 : 0,
    },
  ];

  // Trends by day
  const trendMap = new Map<string, { quantity: number; rejects: number }>();
  items.forEach(item => {
    const date = item.createdAt.toISOString().split('T')[0];
    const existing = trendMap.get(date) || { quantity: 0, rejects: 0 };
    trendMap.set(date, {
      quantity: existing.quantity + item.quantity,
      rejects: existing.rejects + item.reject,
    });
  });

  const trends = Array.from(trendMap.entries())
    .map(([date, data]) => ({
      date,
      quantity: data.quantity,
      rejects: data.rejects,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    summary: {
      totalItems: items.length,
      totalQuantity,
      overallRejectRate,
      topCategories: categoryBreakdown
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(c => c.category),
      maisVsFozan: {
        mais: maisCount,
        fozan: fozanCount,
      },
    },
    trends,
    categoryBreakdown,
    destinationData,
    detailedItems: config.content.detailedTable ? items : [],
  };
}

async function createReportDocument(
  data: ReportData,
  config: ReportConfig,
  aiInsights?: string
): Promise<string> {
  // This would integrate with jsPDF or similar library
  // For now, return a placeholder URL
  const fileName = `report-${Date.now()}.${config.format}`;
  return `/reports/${fileName}`;
}
