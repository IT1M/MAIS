import { NextRequest } from 'next/server';
import { prisma } from '@/db/client';
import { errorResponse, requireAuth, ErrorCodes, isValidUUID } from '@/lib/api-utils';
import { createAuditLog } from '@/services/audit';
import { AuditAction } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(req);
    const { id } = params;

    if (!isValidUUID(id)) {
      return errorResponse(ErrorCodes.BAD_REQUEST, 'Invalid report ID', 400);
    }

    // Fetch report
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Report not found', 404);
    }

    if (report.status !== 'COMPLETED') {
      return errorResponse(
        ErrorCodes.BAD_REQUEST,
        'Report is not ready for download',
        400
      );
    }

    // Log download
    await createAuditLog({
      userId: user.id,
      action: AuditAction.EXPORT,
      entityType: 'Report',
      entityId: id,
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
    });

    // Generate report content
    const reportContent = {
      title: report.title,
      type: report.type,
      period: {
        start: report.periodStart,
        end: report.periodEnd,
      },
      generatedBy: report.user.name,
      generatedAt: report.createdAt,
      data: report.dataSnapshot,
      aiInsights: report.aiInsights,
    };

    // Return as JSON (in production, you might generate a PDF)
    return new Response(JSON.stringify(reportContent, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="report-${id}.json"`,
      },
    });
  } catch (error) {
    console.error('Download report error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return errorResponse(ErrorCodes.UNAUTHORIZED, error.message, 401);
    }
    
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to download report',
      500,
      error
    );
  }
}
