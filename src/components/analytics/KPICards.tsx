'use client';

import { KPIData } from '@/types/analytics';

interface KPICardsProps {
  data: KPIData;
}

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
}

function KPICard({ title, value, subtitle, change, icon, trend, color = 'blue' }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600 dark:text-green-400';
    if (trend === 'down') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${getTrendColor()}`}>
              <span>{getTrendIcon()}</span>
              <span>{Math.abs(change).toFixed(1)}%</span>
              <span className="text-gray-500 dark:text-gray-400 text-xs">vs previous period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}

export default function KPICards({ data }: KPICardsProps) {
  const getRejectRateColor = (rate: number): 'green' | 'yellow' | 'red' => {
    if (rate < 5) return 'green';
    if (rate < 10) return 'yellow';
    return 'red';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <KPICard
        title="Total Items Entered"
        value={data.totalItems.value.toLocaleString()}
        change={data.totalItems.change}
        trend={data.totalItems.change > 0 ? 'up' : data.totalItems.change < 0 ? 'down' : 'neutral'}
        icon="📦"
        color="blue"
      />

      <KPICard
        title="Total Quantity"
        value={data.totalQuantity.value.toLocaleString()}
        subtitle={`Mais: ${data.totalQuantity.mais.toLocaleString()} | Fozan: ${data.totalQuantity.fozan.toLocaleString()}`}
        change={data.totalQuantity.change}
        trend={data.totalQuantity.change > 0 ? 'up' : data.totalQuantity.change < 0 ? 'down' : 'neutral'}
        icon="📊"
        color="indigo"
      />

      <KPICard
        title="Overall Reject Rate"
        value={`${data.rejectRate.value.toFixed(2)}%`}
        subtitle={`${data.rejectRate.totalRejects.toLocaleString()} rejects`}
        change={data.rejectRate.change}
        trend={data.rejectRate.change < 0 ? 'up' : data.rejectRate.change > 0 ? 'down' : 'neutral'}
        icon="⚠️"
        color={getRejectRateColor(data.rejectRate.value)}
      />

      <KPICard
        title="Active Users"
        value={data.activeUsers.value}
        subtitle={data.activeUsers.topContributor 
          ? `Top: ${data.activeUsers.topContributor} (${data.activeUsers.topContributorCount} entries)`
          : 'No data'}
        icon="👥"
        color="purple"
      />

      <KPICard
        title="Categories in Stock"
        value={data.categories.value}
        subtitle={data.categories.mostActive 
          ? `Most active: ${data.categories.mostActive}`
          : 'No data'}
        icon="🏷️"
        color="green"
      />

      <KPICard
        title="Average Daily Entries"
        value={data.avgDailyEntries.value.toFixed(1)}
        icon="📈"
        color="yellow"
      />
    </div>
  );
}
