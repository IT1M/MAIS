'use client';

import { useState, useEffect } from 'react';
import { AuditAction } from '@prisma/client';

interface AuditStatistics {
  totalActions: number;
  mostActiveUser: {
    id: string;
    name: string;
    actionCount: number;
  } | null;
  mostCommonAction: AuditAction;
  criticalActionsCount: number;
  activityByDay: {
    date: string;
    count: number;
    byAction: Record<AuditAction, number>;
  }[];
}

interface AuditStatisticsProps {
  dateRange?: { from: Date; to: Date };
}

export default function AuditStatistics({ dateRange }: AuditStatisticsProps) {
  const [stats, setStats] = useState<AuditStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange?.from) {
        params.append('from', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        params.append('to', dateRange.to.toISOString());
      }

      const response = await fetch(`/api/audit/statistics?${params}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Actions</div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalActions.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {dateRange ? 'In selected period' : 'All time'}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Most Active User</div>
          <div className="text-lg font-bold text-gray-900">
            {stats.mostActiveUser?.name || 'N/A'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.mostActiveUser?.actionCount || 0} actions
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Most Common Action</div>
          <div className="text-lg font-bold text-blue-600">
            {stats.mostCommonAction}
          </div>
          <div className="text-xs text-gray-500 mt-1">Primary activity</div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Critical Actions</div>
          <div className="text-2xl font-bold text-red-600">
            {stats.criticalActionsCount}
          </div>
          <div className="text-xs text-gray-500 mt-1">Deletes & changes</div>
        </div>
      </div>

      {/* Activity Chart */}
      {stats.activityByDay.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Activity Over Time</h3>
          <div className="space-y-2">
            {stats.activityByDay.slice(-7).map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="text-sm text-gray-600 w-24">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    {Object.entries(day.byAction).map(([action, count]) => {
                      if (count === 0) return null;
                      const percentage = (count / day.count) * 100;
                      const colors: Record<string, string> = {
                        CREATE: 'bg-green-500',
                        UPDATE: 'bg-blue-500',
                        DELETE: 'bg-red-500',
                        LOGIN: 'bg-gray-400',
                        LOGOUT: 'bg-gray-400',
                        EXPORT: 'bg-purple-500',
                      };
                      return (
                        <div
                          key={action}
                          className={`h-6 ${colors[action]} rounded`}
                          style={{ width: `${percentage}%` }}
                          title={`${action}: ${count}`}
                        ></div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900 w-12 text-right">
                  {day.count}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>CREATE</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>UPDATE</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>DELETE</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>EXPORT</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span>LOGIN/LOGOUT</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
