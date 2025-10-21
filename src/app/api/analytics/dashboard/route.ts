import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/services/auth';
import { prisma } from '@/db/client';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check role - SUPERVISOR and above
        if (!['SUPERVISOR', 'MANAGER', 'ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const destination = searchParams.get('destination');
        const category = searchParams.get('category');

        // Default to last 30 days
        const start = startDate ? new Date(startDate) : subDays(new Date(), 30);
        const end = endDate ? new Date(endDate) : new Date();

        // Build filter
        const where: any = {
            createdAt: {
                gte: startOfDay(start),
                lte: endOfDay(end),
            },
        };

        if (destination && destination !== 'all') {
            where.destination = destination as 'MAIS' | 'FOZAN';
        }

        if (category && category !== 'all') {
            where.category = category;
        }

        // Fetch all data
        const [items, previousPeriodItems, users] = await Promise.all([
            prisma.inventoryItem.findMany({
                where,
                include: { user: true },
                orderBy: { createdAt: 'asc' },
            }),
            prisma.inventoryItem.findMany({
                where: {
                    ...where,
                    createdAt: {
                        gte: startOfDay(subDays(start, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))),
                        lt: startOfDay(start),
                    },
                },
            }),
            prisma.user.findMany({
                select: { id: true, name: true, email: true },
            }),
        ]);

        // Calculate KPIs
        const totalItems = items.length;
        const totalQuantity = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        const totalRejects = items.reduce((sum: number, item: any) => sum + item.reject, 0);
        const rejectRate = totalQuantity > 0 ? (totalRejects / totalQuantity) * 100 : 0;

        const previousTotalItems = previousPeriodItems.length;
        const previousTotalQuantity = previousPeriodItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
        const previousTotalRejects = previousPeriodItems.reduce((sum: number, item: any) => sum + item.reject, 0);
        const previousRejectRate = previousTotalQuantity > 0 ? (previousTotalRejects / previousTotalQuantity) * 100 : 0;

        // Calculate changes
        const itemsChange = previousTotalItems > 0 ? ((totalItems - previousTotalItems) / previousTotalItems) * 100 : 0;
        const quantityChange = previousTotalQuantity > 0 ? ((totalQuantity - previousTotalQuantity) / previousTotalQuantity) * 100 : 0;
        const rejectRateChange = rejectRate - previousRejectRate;

        // Active users (users who entered data in period)
        const activeUserIds = new Set(items.map((item: any) => item.enteredBy));
        const activeUsers = activeUserIds.size;

        // Top contributor
        const userCounts: Record<string, number> = {};
        items.forEach((item: any) => {
            userCounts[item.enteredBy] = (userCounts[item.enteredBy] || 0) + 1;
        });
        const topContributor = Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0];
        const topContributorName = topContributor ? users.find((u: any) => u.id === topContributor[0])?.name : null;

        // Categories
        const categories = new Set(items.map((item: any) => item.category).filter(Boolean));
        const uniqueCategories = categories.size;

        // Most active category
        const categoryCounts: Record<string, number> = {};
        items.forEach((item: any) => {
            if (item.category) {
                categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
            }
        });
        const mostActiveCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

        // Average daily entries
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
        const avgDailyEntries = totalItems / daysDiff;

        // By destination
        const byDestination: Record<string, { count: number; quantity: number; rejects: number }> = {};
        items.forEach((item: any) => {
            const dest = item.destination;
            if (!byDestination[dest]) {
                byDestination[dest] = { count: 0, quantity: 0, rejects: 0 };
            }
            byDestination[dest].count++;
            byDestination[dest].quantity += item.quantity;
            byDestination[dest].rejects += item.reject;
        });

        // By category
        const byCategory: Record<string, { count: number; quantity: number; rejects: number; mais: number; fozan: number }> = {};
        items.forEach((item: any) => {
            const cat = item.category || 'Uncategorized';
            if (!byCategory[cat]) {
                byCategory[cat] = { count: 0, quantity: 0, rejects: 0, mais: 0, fozan: 0 };
            }
            byCategory[cat].count++;
            byCategory[cat].quantity += item.quantity;
            byCategory[cat].rejects += item.reject;
            if (item.destination === 'MAIS') byCategory[cat].mais += item.quantity;
            if (item.destination === 'FOZAN') byCategory[cat].fozan += item.quantity;
        });

        // Time series data (daily aggregation)
        const timeSeriesMap: Record<string, { date: string; total: number; mais: number; fozan: number; rejects: number; count: number }> = {};
        items.forEach((item: any) => {
            const date = startOfDay(item.createdAt).toISOString().split('T')[0];
            if (!timeSeriesMap[date]) {
                timeSeriesMap[date] = { date, total: 0, mais: 0, fozan: 0, rejects: 0, count: 0 };
            }
            timeSeriesMap[date].total += item.quantity;
            timeSeriesMap[date].rejects += item.reject;
            timeSeriesMap[date].count++;
            if (item.destination === 'MAIS') timeSeriesMap[date].mais += item.quantity;
            if (item.destination === 'FOZAN') timeSeriesMap[date].fozan += item.quantity;
        });

        const timeSeries = Object.values(timeSeriesMap).sort((a, b) => a.date.localeCompare(b.date));

        // User activity (for heatmap)
        const userActivity: Record<string, number> = {};
        items.forEach((item: any) => {
            const hour = item.createdAt.getHours();
            const day = item.createdAt.getDay(); // 0 = Sunday
            const key = `${day}-${hour}`;
            userActivity[key] = (userActivity[key] || 0) + 1;
        });

        return NextResponse.json({
            kpis: {
                totalItems: {
                    value: totalItems,
                    change: itemsChange,
                    previous: previousTotalItems,
                },
                totalQuantity: {
                    value: totalQuantity,
                    change: quantityChange,
                    previous: previousTotalQuantity,
                    mais: byDestination.MAIS?.quantity || 0,
                    fozan: byDestination.FOZAN?.quantity || 0,
                },
                rejectRate: {
                    value: rejectRate,
                    change: rejectRateChange,
                    previous: previousRejectRate,
                    totalRejects,
                },
                activeUsers: {
                    value: activeUsers,
                    topContributor: topContributorName,
                    topContributorCount: topContributor?.[1] || 0,
                },
                categories: {
                    value: uniqueCategories,
                    mostActive: mostActiveCategory,
                },
                avgDailyEntries: {
                    value: avgDailyEntries,
                },
            },
            charts: {
                timeSeries,
                byDestination,
                byCategory,
                userActivity,
            },
            metadata: {
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                totalRecords: totalItems,
                filters: { destination, category },
            },
        });
    } catch (error) {
        console.error('Analytics dashboard error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics data' },
            { status: 500 }
        );
    }
}
