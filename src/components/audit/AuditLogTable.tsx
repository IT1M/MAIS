'use client';

import { useState, useEffect } from 'react';
import { AuditAction } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { EmptyState } from '@/components/ui/EmptyState';
import { FileSearch, RotateCcw } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

interface AuditLogTableProps {
  filters?: {
    userIds?: string[];
    actions?: AuditAction[];
    entityTypes?: string[];
    dateRange?: { from: Date; to: Date };
    search?: string;
  };
}

const ACTION_COLORS = {
  CREATE: 'bg-green-100 text-green-800 border-green-200',
  UPDATE: 'bg-blue-100 text-blue-800 border-blue-200',
  DELETE: 'bg-red-100 text-red-800 border-red-200',
  LOGIN: 'bg-gray-100 text-gray-800 border-gray-200',
  LOGOUT: 'bg-gray-100 text-gray-800 border-gray-200',
  EXPORT: 'bg-purple-100 text-purple-800 border-purple-200',
  VIEW: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

const ACTION_ICONS = {
  CREATE: '➕',
  UPDATE: '✏️',
  DELETE: '🗑️',
  LOGIN: '🔓',
  LOGOUT: '🔒',
  EXPORT: '📥',
  VIEW: '👁️',
};

export default function AuditLogTable({ filters }: AuditLogTableProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showOptionalColumns, setShowOptionalColumns] = useState({
    ipAddress: false,
    userAgent: false,
  });

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });

      if (filters?.userIds?.length) {
        params.append('userIds', filters.userIds.join(','));
      }
      if (filters?.actions?.length) {
        params.append('actions', filters.actions.join(','));
      }
      if (filters?.entityTypes?.length) {
        params.append('entityTypes', filters.entityTypes.join(','));
      }
      if (filters?.dateRange?.from) {
        params.append('from', filters.dateRange.from.toISOString());
      }
      if (filters?.dateRange?.to) {
        params.append('to', filters.dateRange.to.toISOString());
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }

      const response = await fetch(`/api/audit?${params}`);
      const data = await response.json();

      setLogs(data.logs);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const renderChanges = (log: AuditLog) => {
    if (!log.oldValue && !log.newValue) return null;

    const changes: { field: string; oldValue: any; newValue: any }[] = [];

    if (log.oldValue && log.newValue) {
      const oldKeys = Object.keys(log.oldValue);
      const newKeys = Object.keys(log.newValue);
      const allKeys = new Set([...oldKeys, ...newKeys]);

      allKeys.forEach(key => {
        if (JSON.stringify(log.oldValue[key]) !== JSON.stringify(log.newValue[key])) {
          changes.push({
            field: key,
            oldValue: log.oldValue[key],
            newValue: log.newValue[key],
          });
        }
      });
    }

    return (
      <div className="mt-2 space-y-1">
        {changes.map((change, idx) => (
          <div key={idx} className="text-sm font-mono">
            <span className="font-semibold">{change.field}:</span>{' '}
            <span className="text-red-600 line-through">{JSON.stringify(change.oldValue)}</span>
            {' → '}
            <span className="text-green-600">{JSON.stringify(change.newValue)}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        icon={FileSearch}
        title="No audit logs found for this filter"
        description="Try adjusting your filters or date range to see more audit logs. All system activities are tracked and will appear here."
        action={{
          label: 'Reset Filters',
          onClick: () => window.location.reload(),
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Column Settings */}
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showOptionalColumns.ipAddress}
            onChange={(e) => setShowOptionalColumns(prev => ({ ...prev, ipAddress: e.target.checked }))}
            className="rounded"
          />
          Show IP Address
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showOptionalColumns.userAgent}
            onChange={(e) => setShowOptionalColumns(prev => ({ ...prev, userAgent: e.target.checked }))}
            className="rounded"
          />
          Show User Agent
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entity ID
              </th>
              {showOptionalColumns.ipAddress && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
              )}
              {showOptionalColumns.userAgent && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Agent
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <>
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="font-medium">{formatTimestamp(log.timestamp)}</div>
                    <div className="text-gray-500 text-xs" title={log.timestamp}>
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {log.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{log.user.name}</div>
                        <div className="text-xs text-gray-500">{log.user.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${ACTION_COLORS[log.action]}`}>
                      <span>{ACTION_ICONS[log.action]}</span>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {log.entityType}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {log.entityId && (
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {log.entityId.substring(0, 8)}...
                        </code>
                        <button
                          onClick={() => copyToClipboard(log.entityId!)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy full ID"
                        >
                          📋
                        </button>
                      </div>
                    )}
                  </td>
                  {showOptionalColumns.ipAddress && (
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress || '-'}
                    </td>
                  )}
                  {showOptionalColumns.userAgent && (
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {log.userAgent || '-'}
                    </td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button
                      onClick={() => toggleRowExpansion(log.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {expandedRows.has(log.id) ? '▼ Hide' : '▶ Details'}
                    </button>
                  </td>
                </tr>
                {expandedRows.has(log.id) && (
                  <tr>
                    <td colSpan={8} className="px-4 py-3 bg-gray-50">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Changes:</h4>
                        {renderChanges(log)}
                        {!log.oldValue && !log.newValue && (
                          <p className="text-sm text-gray-500">No detailed changes recorded</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
