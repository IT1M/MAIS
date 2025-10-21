import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/db/client';
import { generateReport } from '@/services/report-generator';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.report.count(),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, config } = body;

    if (!userId || !config) {
      return NextResponse.json(
        { error: 'User ID and config are required' },
        { status: 400 }
      );
    }

    const reportId = await generateReport(userId, config);

    return NextResponse.json({
      success: true,
      reportId,
      message: 'Report generation started',
    });
  } catch (error: any) {
    console.error('Failed to generate report:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}
