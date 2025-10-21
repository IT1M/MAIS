import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/db/client';
import { AuditAction } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    const where: any = {};
    if (fromDate || toDate) {
      where.timestamp = {};
      if (fromDate) where.timestamp.gte = new Date(fromDate);
      if (toDate) where.timestamp.lte = new Date(toDate);
    }

    // Total actions
    const totalActions = await prisma.auditLog.count({ where });

    // Most active user
    const userActivity = await prisma.auditLog.groupBy({
      by: ['userId'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1,
    });

    let mostActiveUser = null;
    if (userActivity.length > 0) {
      const user = await prisma.user.findUnique({
        where: { id: userActivity[0].userId },
        select: { id: true, name: true },
      });
      mostActiveUser = {
        ...user,
        actionCount: userActivity[0]._count.id,
      };
    }

    // Most common action
    const actionCounts = await prisma.auditLog.groupBy({
      by: ['action'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1,
    });

    const mostCommonAction = actionCounts[0]?.action || AuditAction.CREATE;

    // Critical actions (DELETE, role changes)
    const criticalActionsCount = await prisma.auditLog.count({
      where: {
        ...where,
        action: AuditAction.DELETE,
      },
    });

    // Activity by day
    const logs = await prisma.auditLog.findMany({
      where,
      select: {
        timestamp: true,
        action: true,
      },
    });

    const activityByDay = new Map<string, Record<AuditAction, number>>();
    logs.forEach(log => {
      const date = log.timestamp.toISOString().split('T')[0];
      if (!activityByDay.has(date)) {
        activityByDay.set(date, {
          CREATE: 0,
          UPDATE: 0,
          DELETE: 0,
          LOGIN: 0,
          LOGOUT: 0,
          EXPORT: 0,
        });
      }
      const dayData = activityByDay.get(date)!;
      dayData[log.action]++;
    });

    const activityData = Array.from(activityByDay.entries()).map(([date, byAction]) => ({
      date,
      count: Object.values(byAction).reduce((sum, count) => sum + count, 0),
      byAction,
    }));

    return NextResponse.json({
      totalActions,
      mostActiveUser,
      mostCommonAction,
      criticalActionsCount,
      activityByDay: activityData,
    });
  } catch (error: any) {
    console.error('Failed to fetch audit statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit statistics' },
      { status: 500 }
    );
  }
}
