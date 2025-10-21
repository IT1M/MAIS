'use client';

import { useState, useEffect } from 'react';
import AuditLogTable from '@/components/audit/AuditLogTable';
import AuditFilters from '@/components/audit/AuditFilters';

export default function AuditPage() {
  const [filters, setFilters] = useState<any>({});
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
    fetchStatistics();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.dateRange?.from) {
        params.append('from', filters.dateRange.from.toISOString());
      }
      if (filters.dateRange?.to) {
        params.append('to', filters.dateRange.to.toISOString());
      }

      const response = await fetch(`/api/audit/statistics?${params}`);
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
          <p className="text-gray-600 mt-1">
            Track all system activities and changes
          </p>
        </div>

        {/* Statistics Dashboard */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Total Actions</div>
              <div className="text-2xl font-bold text-gray-900">
                {statistics.totalActions.toLocaleString()}
              </div>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Most Active User</div>
              <div className="text-lg font-bold text-gray-900">
                {statistics.mostActiveUser?.name || 'N/A'}
              </div>
              <div className="text-xs text-gray-500">
                {statistics.mostActiveUser?.actionCount || 0} actions
              </div>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Most Common Action</div>
              <div className="text-lg font-bold text-gray-900">
                {statistics.mostCommonAction}
              </div>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Critical Actions</div>
              <div className="text-2xl font-bold text-red-600">
                {statistics.criticalActionsCount}
              </div>
              <div className="text-xs text-gray-500">Deletes & changes</div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <AuditFilters onFilterChange={setFilters} users={users} />
          </div>

          {/* Audit Log Table */}
          <div className="lg:col-span-3">
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Audit Logs</h2>
                <button
                  onClick={() => {
                    // Export functionality
                    alert('Export functionality coming soon');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  📥 Export Logs
                </button>
              </div>
              <AuditLogTable filters={filters} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
