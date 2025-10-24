import { Metadata } from 'next';
import { auth } from '@/services/auth';
import { prisma } from '@/db/client';
import { redirect } from 'next/navigation';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { QuickActionsGrid } from '@/components/dashboard/QuickActionsGrid';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivityTimeline } from '@/components/dashboard/RecentActivityTimeline';
import { MiniCharts } from '@/components/dashboard/MiniCharts';
import { RoleBasedContent } from '@/components/dashboard/RoleBasedContent';
import { UserRole } from '@/types';
import { Package, Users, AlertCircle } from 'lucide-react';
import { startOfMonth, endOfDay, subDays } from 'date-fns';

export const metadata: Metadata = {
  title: 'Dashboard | Saudi Mais Co.',
  description: 'Inventory management dashboard',
};

async function getDashboardData(userId: string, userRole: UserRole) {
  const now = new Date();
  const startOfThisMonth = startOfMonth(now);
  const last7Days = subDays(now, 7);

  // Role-based filtering for stats
  const statsWhere: any = {
    createdAt: {
      gte: startOfThisMonth,
      lte: endOfDay(now),
    },
  };

  // DATA_ENTRY users only see their own stats
  if (userRole === 'DATA_ENTRY') {
    statsWhere.enteredBy = userId;
  }

  // Get items for current month
  const itemsThisMonth = await prisma.inventoryItem.findMany({
    where: statsWhere,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Get recent activity (filtered by role)
  const recentActivityWhere: any = {};
  
  // DATA_ENTRY users only see their own entries
  if (userRole === 'DATA_ENTRY') {
    recentActivityWhere.enteredBy = userId;
  }

  const recentActivity = await prisma.inventoryItem.findMany({
    where: recentActivityWhere,
    take: 10,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  // Calculate stats
  const totalItems = itemsThisMonth.length;
  const totalQuantity = itemsThisMonth.reduce((sum, item) => sum + item.quantity, 0);
  const totalRejects = itemsThisMonth.reduce((sum, item) => sum + item.reject, 0);
  const rejectRate = totalQuantity > 0 ? (totalRejects / totalQuantity) * 100 : 0;

  // Active users today
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  
  const activeUsersToday = await prisma.inventoryItem.findMany({
    where: {
      createdAt: {
        gte: startOfToday,
      },
    },
    select: {
      enteredBy: true,
    },
    distinct: ['enteredBy'],
  });

  // Weekly trend data (last 7 days)
  const weeklyData: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const date = subDays(now, i);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    weeklyData[dayName] = 0;
  }

  itemsThisMonth.forEach((item) => {
    const itemDate = new Date(item.createdAt);
    if (itemDate >= last7Days) {
      const dayName = itemDate.toLocaleDateString('en-US', { weekday: 'short' });
      if (weeklyData[dayName] !== undefined) {
        weeklyData[dayName]++;
      }
    }
  });

  const trendData = Object.entries(weeklyData).map(([label, value]) => ({
    label,
    value,
  }));

  // Distribution by category
  const categoryCount: Record<string, number> = {};
  itemsThisMonth.forEach((item) => {
    const category = item.category || 'Uncategorized';
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });

  const distributionData = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({
      label,
      value,
    }));

  return {
    stats: {
      totalItems,
      rejectRate: rejectRate.toFixed(1),
      activeUsers: activeUsersToday.length,
    },
    recentActivity: recentActivity.map((item) => ({
      id: item.id,
      itemName: item.itemName,
      batch: item.batch,
      quantity: item.quantity,
      userName: item.user.name,
      createdAt: item.createdAt,
      destination: item.destination,
    })),
    trendData,
    distributionData,
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const user = session.user;
  const dashboardData = await getDashboardData(user.id, user.role as UserRole);

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Card */}
      <WelcomeCard userName={user.name || 'User'} userRole={user.role as UserRole} />

      {/* Quick Actions Grid */}
      <QuickActionsGrid userRole={user.role as UserRole} locale={locale} />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Items This Month"
          value={dashboardData.stats.totalItems}
          icon={Package}
          trend="up"
          change={12.5}
        />
        <StatCard
          title="Reject Rate This Month"
          value={`${dashboardData.stats.rejectRate}%`}
          icon={AlertCircle}
          trend={parseFloat(dashboardData.stats.rejectRate) > 5 ? 'down' : 'up'}
          change={-2.3}
        />
        <StatCard
          title="Active Users Today"
          value={dashboardData.stats.activeUsers}
          icon={Users}
          trend="neutral"
        />
      </div>

      {/* Recent Activity and Mini Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivityTimeline items={dashboardData.recentActivity} />
        </div>
        <div className="space-y-6">
          <RoleBasedContent userRole={user.role as UserRole} locale={locale} />
        </div>
      </div>

      {/* Mini Charts */}
      <MiniCharts
        trendData={dashboardData.trendData}
        distributionData={dashboardData.distributionData}
      />
    </div>
  );
}
