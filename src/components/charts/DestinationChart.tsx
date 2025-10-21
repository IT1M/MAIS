'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DestinationData } from '@/types/analytics';

interface DestinationChartProps {
  data: Record<string, DestinationData>;
}

const COLORS = {
  MAIS: '#3B82F6',
  FOZAN: '#8B5CF6',
};

export default function DestinationChart({ data }: DestinationChartProps) {
  const chartData = Object.entries(data).map(([name, values]) => ({
    name,
    value: values.quantity,
    count: values.count,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Distribution by Destination
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#F9FAFB',
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value.toLocaleString()} (${props.payload.count} items)`,
              name
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {chartData.map((item) => (
          <div key={item.name} className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {item.value.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {item.name} ({((item.value / total) * 100).toFixed(1)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
