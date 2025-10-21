'use client';

import { useState } from 'react';
import { AuditAction } from '@prisma/client';

interface AuditFiltersProps {
  onFilterChange: (filters: any) => void;
  users: { id: string; name: string }[];
}

const DATE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: 'last7days' },
  { label: 'Last 30 days', value: 'last30days' },
  { label: 'Custom', value: 'custom' },
];

const ACTIONS = Object.values(AuditAction);

const ENTITY_TYPES = [
  'InventoryItem',
  'User',
  'Report',
  'Backup',
  'Settings',
  'System',
];

export default function AuditFilters({ onFilterChange, users }: AuditFiltersProps) {
  const [datePreset, setDatePreset] = useState('last7days');
  const [customDateRange, setCustomDateRange] = useState({ from: '', to: '' });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedActions, setSelectedActions] = useState<AuditAction[]>([]);
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (datePreset) {
      case 'today':
        return { from: today, to: now };
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return { from: yesterday, to: today };
      case 'last7days':
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        return { from: last7, to: now };
      case 'last30days':
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        return { from: last30, to: now };
      case 'custom':
        return {
          from: customDateRange.from ? new Date(customDateRange.from) : undefined,
          to: customDateRange.to ? new Date(customDateRange.to) : undefined,
        };
      default:
        return undefined;
    }
  };

  const handleApplyFilters = () => {
    const filters: any = {};

    const dateRange = getDateRange();
    if (dateRange) {
      filters.dateRange = dateRange;
    }

    if (selectedUsers.length > 0) {
      filters.userIds = selectedUsers;
    }

    if (selectedActions.length > 0) {
      filters.actions = selectedActions;
    }

    if (selectedEntityTypes.length > 0) {
      filters.entityTypes = selectedEntityTypes;
    }

    if (searchQuery.trim()) {
      filters.search = searchQuery.trim();
    }

    onFilterChange(filters);
  };

  const handleResetFilters = () => {
    setDatePreset('last7days');
    setCustomDateRange({ from: '', to: '' });
    setSelectedUsers([]);
    setSelectedActions([]);
    setSelectedEntityTypes([]);
    setSearchQuery('');
    onFilterChange({});
  };

  const toggleAction = (action: AuditAction) => {
    setSelectedActions(prev =>
      prev.includes(action)
        ? prev.filter(a => a !== action)
        : [...prev, action]
    );
  };

  const toggleEntityType = (type: string) => {
    setSelectedEntityTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const selectAllActions = () => {
    setSelectedActions(ACTIONS);
  };

  const deselectAllActions = () => {
    setSelectedActions([]);
  };

  return (
    <div className="bg-white border rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold">Filters</h3>

      {/* Date Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date Range
        </label>
        <div className="space-y-2">
          {DATE_PRESETS.map(preset => (
            <label key={preset.value} className="flex items-center gap-2">
              <input
                type="radio"
                name="datePreset"
                value={preset.value}
                checked={datePreset === preset.value}
                onChange={(e) => setDatePreset(e.target.value)}
                className="rounded"
              />
              <span className="text-sm">{preset.label}</span>
            </label>
          ))}
        </div>

        {datePreset === 'custom' && (
          <div className="mt-3 space-y-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">From</label>
              <input
                type="date"
                value={customDateRange.from}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">To</label>
              <input
                type="date"
                value={customDateRange.to}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* User Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Users
        </label>
        <select
          multiple
          value={selectedUsers}
          onChange={(e) => setSelectedUsers(Array.from(e.target.selectedOptions, option => option.value))}
          className="w-full px-3 py-2 border rounded-md text-sm"
          size={5}
        >
          <option value="">All Users</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {/* Action Type Filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Action Types
          </label>
          <div className="flex gap-2 text-xs">
            <button
              onClick={selectAllActions}
              className="text-blue-600 hover:text-blue-800"
            >
              Select All
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={deselectAllActions}
              className="text-blue-600 hover:text-blue-800"
            >
              Deselect All
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {ACTIONS.map(action => (
            <label key={action} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedActions.includes(action)}
                onChange={() => toggleAction(action)}
                className="rounded"
              />
              <span className="text-sm">{action}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Entity Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Entity Types
        </label>
        <div className="space-y-2">
          {ENTITY_TYPES.map(type => (
            <label key={type} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedEntityTypes.includes(type)}
                onChange={() => toggleEntityType(type)}
                className="rounded"
              />
              <span className="text-sm">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search entity IDs, IPs..."
          className="w-full px-3 py-2 border rounded-md text-sm"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={handleApplyFilters}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          Apply Filters
        </button>
        <button
          onClick={handleResetFilters}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
