'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CategoryData } from '@/types/analytics';

interface CategoryChartProps {
  data: Record<string, CategoryData>;
}

export default function CategoryChart({ data }: CategoryChartProps) {
  const [sortBy, setSortBy] = useState<'quantity' | 'name'>('quantity');
  const [viewType, setViewType] = useState<'stacked' | 'grouped'>('stacked');

  const chartData = Object.entries(data)
    .map(([name, values]) => ({
      name,
      quantity: values.quantity,
      mais: values.mais,
      fozan: values.fozan,
      count: values.count,
    }))
    .sort((a, b) => {
      if (sortBy === 'quantity') return b.quantity - a.quantity;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Inventory by Category
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'quantity' | 'name')}
            className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <option value="quantity">Sort by Quantity</option>
            <option value="name">Sort by Name</option>
          </select>
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value as 'stacked' | 'grouped')}
            className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <option value="stacked">Stacked</option>
            <option value="grouped">Grouped</option>
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout={chartData.length > 8 ? 'horizontal' : 'vertical'}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          {chartData.length > 8 ? (
            <>
              <XAxis type="number" stroke="#6B7280" tick={{ fill: '#6B7280' }} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#6B7280"
                tick={{ fill: '#6B7280' }}
                width={100}
              />
            </>
          ) : (
            <>
              <XAxis
                type="category"
                dataKey="name"
                stroke="#6B7280"
                tick={{ fill: '#6B7280' }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis type="number" stroke="#6B7280" tick={{ fill: '#6B7280' }} />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB',
            }}
          />
          <Legend />
          <Bar
            dataKey="mais"
            fill="#3B82F6"
            stackId={viewType === 'stacked' ? 'a' : undefined}
            name="Mais"
          />
          <Bar
            dataKey="fozan"
            fill="#8B5CF6"
            stackId={viewType === 'stacked' ? 'a' : undefined}
            name="Fozan"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
