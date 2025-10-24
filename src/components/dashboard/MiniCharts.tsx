'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart3, TrendingUp } from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface MiniChartsProps {
  trendData: ChartData[];
  distributionData: ChartData[];
}

export function MiniCharts({ trendData, distributionData }: MiniChartsProps) {
  const maxTrendValue = Math.max(...trendData.map((d) => d.value), 1);
  const maxDistValue = Math.max(...distributionData.map((d) => d.value), 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            Weekly Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trendData.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${(item.value / maxTrendValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
            Distribution by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {distributionData.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground truncate">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      item.color || 'bg-purple-500'
                    }`}
                    style={{ width: `${(item.value / maxDistValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
