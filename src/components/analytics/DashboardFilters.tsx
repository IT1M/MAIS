'use client';

import { useState } from 'react';
import { subDays, startOfMonth, endOfMonth, startOfYear, format } from 'date-fns';
import { DashboardFilters as Filters } from '@/types/analytics';

interface DashboardFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function DashboardFilters({ filters, onChange }: DashboardFiltersProps) {
  const [showCustom, setShowCustom] = useState(false);

  const presets = [
    { label: 'Last 7 Days', getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
    { label: 'Last 30 Days', getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
    { label: 'This Month', getValue: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
    { label: 'Last 90 Days', getValue: () => ({ start: subDays(new Date(), 90), end: new Date() }) },
    { label: 'This Year', getValue: () => ({ start: startOfYear(new Date()), end: new Date() }) },
  ];

  const handlePreset = (preset: typeof presets[0]) => {
    onChange({
      ...filters,
      dateRange: preset.getValue(),
    });
    setShowCustom(false);
  };

  const handleCustomDate = (type: 'start' | 'end', value: string) => {
    onChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: new Date(value),
      },
    });
  };

  const handleReset = () => {
    onChange({
      dateRange: {
        start: subDays(new Date(), 30),
        end: new Date(),
      },
      destination: 'all',
      category: 'all',
    });
    setShowCustom(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Date Presets */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Date Range:
          </span>
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePreset(preset)}
              className="px-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="px-3 py-1 text-sm rounded-md bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300"
          >
            Custom
          </button>
        </div>

        {/* Destination Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Destination:
          </span>
          <select
            value={filters.destination}
            onChange={(e) => onChange({ ...filters, destination: e.target.value })}
            className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <option value="all">All</option>
            <option value="MAIS">Mais</option>
            <option value="FOZAN">Fozan</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="ml-auto px-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
        >
          Reset Filters
        </button>
      </div>

      {/* Custom Date Range */}
      {showCustom && (
        <div className="mt-4 flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              From:
            </label>
            <input
              type="date"
              value={format(filters.dateRange.start, 'yyyy-MM-dd')}
              onChange={(e) => handleCustomDate('start', e.target.value)}
              className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              To:
            </label>
            <input
              type="date"
              value={format(filters.dateRange.end, 'yyyy-MM-dd')}
              onChange={(e) => handleCustomDate('end', e.target.value)}
              className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            />
          </div>
        </div>
      )}
    </div>
  );
}
