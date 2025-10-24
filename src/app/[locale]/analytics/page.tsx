'use client';

import { useState, useEffect } from 'react';
import { subDays, startOfMonth, endOfMonth, format } from 'date-fns';
import KPICards from '@/components/analytics/KPICards';
import InventoryTrendChart from '@/components/charts/InventoryTrendChart';
import DestinationChart from '@/components/charts/DestinationChart';
import CategoryChart from '@/components/charts/CategoryChart';
import RejectAnalysisChart from '@/components/charts/RejectAnalysisChart';
import UserActivityHeatmap from '@/components/charts/UserActivityHeatmap';
import AIInsightsPanel from '@/components/analytics/AIInsightsPanel';
import DashboardFilters from '@/components/analytics/DashboardFilters';
import { EmptyState } from '@/components/ui/EmptyState';
import { DashboardData, DashboardFilters as Filters } from '@/types/analytics';
import { BarChart3, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    dateRange: {
      start: subDays(new Date(), 30),
      end: new Date(),
    },
    destination: 'all',
    category: 'all',
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: filters.dateRange.start.toISOString(),
        endDate: filters.dateRange.end.toISOString(),
        destination: filters.destination,
        category: filters.category,
      });

      const response = await fetch(`/api/analytics/dashboard?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 60000); // 60 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, filters]);

  const handleExportPDF = async () => {
    toast.promise(
      import('@/lib/export-pdf').then(({ exportDashboardToPDF }) =>
        exportDashboardToPDF(data, filters)
      ),
      {
        loading: 'Generating PDF...',
        success: 'Dashboard exported successfully',
        error: 'Failed to export dashboard',
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📊 Analytics Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {format(lastUpdated, 'HH:mm:ss')}
            </span>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh
            </label>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleExportPDF}
              disabled={!data}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              📄 Export PDF
            </button>
          </div>
        </div>

        <DashboardFilters filters={filters} onChange={setFilters} />
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : data && data.kpis.totalItems.value > 0 ? (
        <>
          {/* KPI Cards */}
          <KPICards data={data.kpis} />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="lg:col-span-2">
              <InventoryTrendChart data={data.charts.timeSeries} />
            </div>
            
            <DestinationChart data={data.charts.byDestination} />
            <CategoryChart data={data.charts.byCategory} />
            
            <RejectAnalysisChart data={data.charts.timeSeries} />
            <UserActivityHeatmap data={data.charts.userActivity} />
          </div>

          {/* AI Insights Panel */}
          <AIInsightsPanel dashboardData={data} />
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <EmptyState
            icon={BarChart3}
            title="Not enough data to show analytics"
            description="Start adding inventory items to see comprehensive analytics, trends, and insights. You need at least a few entries to generate meaningful charts and statistics."
            action={{
              label: 'Add Inventory Items',
              onClick: () => window.location.href = '/data-entry',
            }}
          />
        </div>
      )}
    </div>
  );
}
