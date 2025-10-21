'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import toast from 'react-hot-toast';

interface Stats {
  todayCount: number;
  recentItems: Array<{
    id: string;
    itemName: string;
    batch: string;
    createdAt: string;
  }>;
  destinationSummary: {
    MAIS: number;
    FOZAN: number;
  };
}

export function QuickStatsWidget() {
  const [stats, setStats] = useState<Stats>({
    todayCount: 0,
    recentItems: [],
    destinationSummary: { MAIS: 0, FOZAN: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const response = await fetch(
        `/api/inventory?limit=5&sortBy=createdAt&sortOrder=desc&startDate=${today.toISOString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Calculate stats
        const todayCount = data.data.total;
        const recentItems = data.data.items.slice(0, 5);
        
        // Fetch destination summary for today
        const maisResponse = await fetch(
          `/api/inventory?destination=MAIS&startDate=${today.toISOString()}`
        );
        const fozanResponse = await fetch(
          `/api/inventory?destination=FOZAN&startDate=${today.toISOString()}`
        );
        
        const maisData = maisResponse.ok ? await maisResponse.json() : { data: { total: 0 } };
        const fozanData = fozanResponse.ok ? await fozanResponse.json() : { data: { total: 0 } };
        
        setStats({
          todayCount,
          recentItems,
          destinationSummary: {
            MAIS: maisData.data.total,
            FOZAN: fozanData.data.total,
          },
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  const copyBatchNumber = (batch: string) => {
    navigator.clipboard.writeText(batch);
    toast.success(`Copied: ${batch}`, { duration: 2000 });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Count */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            {stats.todayCount}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Items entered today
          </p>
        </CardContent>
      </Card>

      {/* Destination Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today by Destination</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Mais</span>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                {stats.destinationSummary.MAIS}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Fozan</span>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                {stats.destinationSummary.FOZAN}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Items</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentItems.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No items entered today
            </p>
          ) : (
            <div className="space-y-3">
              {stats.recentItems.map((item) => (
                <div
                  key={item.id}
                  className="border-l-2 border-blue-500 pl-3 py-1"
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.itemName}
                  </div>
                  <button
                    onClick={() => copyBatchNumber(item.batch)}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Click to copy batch number"
                  >
                    📋 {item.batch}
                  </button>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            💡 Quick Tips
          </h4>
          <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
            <li>• Use Tab to navigate fields</li>
            <li>• Ctrl/Cmd + S to save</li>
            <li>• Form auto-saves every 2 seconds</li>
            <li>• Click batch numbers to copy</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
