'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimeSeriesData } from '@/types/analytics';
import { format } from 'date-fns';

interface InventoryTrendChartProps {
  data: TimeSeriesData[];
}

export default function InventoryTrendChart({ data }: InventoryTrendChartProps) {
  const [visibleLines, setVisibleLines] = useState({
    total: true,
    mais: true,
    fozan: true,
    rejects: true,
  });

  const toggleLine = (key: keyof typeof visibleLines) => {
    setVisibleLines(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const exportChart = () => {
    const csv = [
      ['Date', 'Total', 'Mais', 'Fozan', 'Rejects'].join(','),
      ...data.map(d => [d.date, d.total, d.mais, d.fozan, d.rejects].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-trend-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Inventory Trend Over Time
        </h3>
        <button
          onClick={exportChart}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300"
        >
          📥 Export CSV
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        {Object.entries(visibleLines).map(([key, visible]) => (
          <button
            key={key}
            onClick={() => toggleLine(key as keyof typeof visibleLines)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              visible
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis
            dataKey="date"
            stroke="#6B7280"
            tick={{ fill: '#6B7280' }}
            tickFormatter={(value) => format(new Date(value), 'MMM dd')}
          />
          <YAxis stroke="#6B7280" tick={{ fill: '#6B7280' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB',
            }}
            labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
          />
          <Legend />
          {visibleLines.total && (
            <Line
              type="monotone"
              dataKey="total"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
          {visibleLines.mais && (
            <Line
              type="monotone"
              dataKey="mais"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', r: 4 }}
            />
          )}
          {visibleLines.fozan && (
            <Line
              type="monotone"
              dataKey="fozan"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={{ fill: '#8B5CF6', r: 4 }}
            />
          )}
          {visibleLines.rejects && (
            <Line
              type="monotone"
              dataKey="rejects"
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#EF4444', r: 4 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
