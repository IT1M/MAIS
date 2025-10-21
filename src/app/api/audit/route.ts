import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/db/client';
import { AuditAction } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const userIds = searchParams.get('userIds')?.split(',').filter(Boolean);
    const actions = searchParams.get('actions')?.split(',').filter(Boolean) as AuditAction[];
    const entityTypes = searchParams.get('entityTypes')?.split(',').filter(Boolean);
    const searchQuery = searchParams.get('search');
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    // Build where clause
    const where: any = {};

    if (userIds && userIds.length > 0) {
      where.userId = { in: userIds };
    }

    if (actions && actions.length > 0) {
      where.action = { in: actions };
    }

    if (entityTypes && entityTypes.length > 0) {
      where.entityType = { in: entityTypes };
    }

    if (fromDate || toDate) {
      where.timestamp = {};
      if (fromDate) where.timestamp.gte = new Date(fromDate);
      if (toDate) where.timestamp.lte = new Date(toDate);
    }

    if (searchQuery) {
      where.OR = [
        { entityId: { contains: searchQuery, mode: 'insensitive' } },
        { ipAddress: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    // Fetch logs
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
