'use client';

import { useState, useEffect, useCallback } from 'react';
import { FilterState } from '@/types/data-log';
import { datePresets, formatDateForInput } from '@/lib/date-presets';

interface InventoryFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  availableCategories: string[];
  availableUsers: Array<{ id: string; name: string }>;
  userRole: string;
}

export function InventoryFilters({
  filters,
  onFiltersChange,
  onReset,
  availableCategories,
  availableUsers,
  userRole,
}: InventoryFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({ search: searchInput });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, filters.search, onFiltersChange]);

  const handleDatePreset = useCallback((preset: typeof datePresets[0]) => {
    const { start, end } = preset.getValue();
    onFiltersChange({
      startDate: formatDateForInput(start),
      endDate: formatDateForInput(end),
    });
  }, [onFiltersChange]);

  const toggleDestination = useCallback((dest: string) => {
    const newDestinations = filters.destinations.includes(dest)
      ? filters.destinations.filter(d => d !== dest)
      : [...filters.destinations, dest];
    onFiltersChange({ destinations: newDestinations });
  }, [filters.destinations, onFiltersChange]);

  const toggleCategory = useCallback((category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ categories: newCategories });
  }, [filters.categories, onFiltersChange]);

  const toggleUser = useCallback((userId: string) => {
    const newUsers = filters.enteredBy.includes(userId)
      ? filters.enteredBy.filter(u => u !== userId)
      : [...filters.enteredBy, userId];
    onFiltersChange({ enteredBy: newUsers });
  }, [filters.enteredBy, onFiltersChange]);

  const activeFilterCount = [
    filters.search,
    filters.startDate,
    filters.endDate,
    filters.destinations.length > 0,
    filters.categories.length > 0,
    filters.rejectFilter !== 'all',
    filters.enteredBy.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          aria-label={isCollapsed ? 'Expand filters' : 'Collapse filters'}
        >
          <svg
            className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Filter Content */}
      <div className={`p-4 space-y-4 ${isCollapsed ? 'hidden lg:block' : ''}`}>
        {/* Search Bar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search item name or batch..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date Range
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {datePresets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleDatePreset(preset)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => onFiltersChange({ startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
            <div>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => onFiltersChange({ endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
          </div>
          {(filters.startDate || filters.endDate) && (
            <button
              onClick={() => onFiltersChange({ startDate: '', endDate: '' })}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Clear dates
            </button>
          )}
        </div>

        {/* Destination Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Destination
          </label>
          <div className="space-y-2">
            {['MAIS', 'FOZAN'].map((dest) => (
              <label key={dest} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.destinations.includes(dest)}
                  onChange={() => toggleDestination(dest)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{dest}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        {availableCategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableCategories.map((category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{category}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Reject Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reject Status
          </label>
          <select
            value={filters.rejectFilter}
            onChange={(e) => onFiltersChange({ rejectFilter: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Items</option>
            <option value="no-rejects">No Rejects</option>
            <option value="has-rejects">Has Rejects</option>
            <option value="high-rejects">High Rejects (&gt;10%)</option>
          </select>
        </div>

        {/* Entered By Filter (Admin/Supervisor only) */}
        {(userRole === 'ADMIN' || userRole === 'SUPERVISOR') && availableUsers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Entered By
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableUsers.map((user) => (
                <label key={user.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.enteredBy.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{user.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ sortBy: e.target.value as any })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="createdAt">Date</option>
              <option value="itemName">Item Name</option>
              <option value="quantity">Quantity</option>
              <option value="batch">Batch</option>
            </select>
            <select
              value={filters.sortOrder}
              onChange={(e) => onFiltersChange({ sortOrder: e.target.value as any })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onReset}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
}
