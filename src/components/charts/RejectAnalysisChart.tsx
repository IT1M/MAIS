'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimeSeriesData } from '@/types/analytics';
import { format } from 'date-fns';

interface RejectAnalysisChartProps {
  data: TimeSeriesData[];
}

export default function RejectAnalysisChart({ data }: RejectAnalysisChartProps) {
  const [viewMode, setViewMode] = useState<'absolute' | 'percentage'>('absolute');

  const chartData = data.map(d => {
    const accepted = d.total - d.rejects;
    const rejectRate = d.total > 0 ? (d.rejects / d.total) * 100 : 0;
    
    return {
      date: d.date,
      accepted: viewMode === 'absolute' ? accepted : ((accepted / d.total) * 100) || 0,
      rejected: viewMode === 'absolute' ? d.rejects : rejectRate,
      rejectRate,
    };
  });

  const getZoneColor = (rate: number) => {
    if (rate < 5) return '#10B981'; // green
    if (rate < 10) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Reject Analysis
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('absolute')}
            className={`px-3 py-1 text-sm rounded-md ${
              viewMode === 'absolute'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}
          >
            Absolute
          </button>
          <button
            onClick={() => setViewMode('percentage')}
            className={`px-3 py-1 text-sm rounded-md ${
              viewMode === 'percentage'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}
          >
            Percentage
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis
            dataKey="date"
            stroke="#6B7280"
            tick={{ fill: '#6B7280' }}
            tickFormatter={(value) => format(new Date(value), 'MMM dd')}
          />
          <YAxis
            stroke="#6B7280"
            tick={{ fill: '#6B7280' }}
            label={{
              value: viewMode === 'percentage' ? 'Percentage (%)' : 'Quantity',
              angle: -90,
              position: 'insideLeft',
              fill: '#6B7280',
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB',
            }}
            labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
            formatter={(value: number) =>
              viewMode === 'percentage' ? `${value.toFixed(2)}%` : value.toLocaleString()
            }
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="accepted"
            stackId="1"
            stroke="#10B981"
            fill="url(#colorAccepted)"
            name="Accepted"
          />
          <Area
            type="monotone"
            dataKey="rejected"
            stackId="1"
            stroke="#EF4444"
            fill="url(#colorRejected)"
            name="Rejected"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Color-coded zones legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Safe (&lt;5%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Warning (5-10%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Danger (&gt;10%)</span>
        </div>
      </div>
    </div>
  );
}
