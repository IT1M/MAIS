'use client';

import { useState } from 'react';
import { BackupFileType } from '@prisma/client';

interface CreateBackupModalProps {
  onClose: () => void;
}

export default function CreateBackupModal({ onClose }: CreateBackupModalProps) {
  const [config, setConfig] = useState<{
    name: string;
    includeData: {
      inventoryItems: boolean;
      auditLogs: boolean;
      userData: boolean;
      systemSettings: boolean;
    };
    formats: BackupFileType[];
    dateRange: {
      enabled: boolean;
      from: string;
      to: string;
    };
    notes: string;
  }>({
    name: `backup-${new Date().toISOString().split('T')[0]}`,
    includeData: {
      inventoryItems: true,
      auditLogs: false,
      userData: false,
      systemSettings: false,
    },
    formats: [BackupFileType.JSON],
    dateRange: {
      enabled: false,
      from: '',
      to: '',
    },
    notes: '',
  });

  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState<{ step: string; percentage: number } | null>(null);

  const estimateFileSize = () => {
    // Rough estimation based on selected data
    let size = 0;
    if (config.includeData.inventoryItems) size += 5; // 5MB
    if (config.includeData.auditLogs) size += 2; // 2MB
    if (config.includeData.userData) size += 0.5; // 500KB
    if (config.includeData.systemSettings) size += 0.1; // 100KB
    
    return `~${size.toFixed(1)} MB`;
  };

  const handleCreate = async () => {
    setCreating(true);
    setProgress({ step: 'Starting backup...', percentage: 0 });

    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user-id', // Replace with actual user ID
          options: {
            name: config.name,
            includeData: config.includeData,
            formats: config.formats,
            dateRange: config.dateRange.enabled ? {
              from: new Date(config.dateRange.from),
              to: new Date(config.dateRange.to),
            } : undefined,
            notes: config.notes,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProgress({ step: 'Backup completed!', percentage: 100 });
        setTimeout(() => {
          alert('Backup created successfully!');
          onClose();
          window.location.reload();
        }, 1000);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      alert('Failed to create backup: ' + error.message);
      setCreating(false);
      setProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Create Manual Backup</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={creating}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Backup Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Backup Name
            </label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
              disabled={creating}
            />
            <p className="text-xs text-gray-500 mt-1">Auto-generated, but you can customize it</p>
          </div>

          {/* Include Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Include Data
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.includeData.inventoryItems}
                  disabled={true}
                  className="rounded"
                />
                <span className="text-sm">☑ Inventory items (always included)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.includeData.auditLogs}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    includeData: { ...prev.includeData, auditLogs: e.target.checked }
                  }))}
                  disabled={creating}
                  className="rounded"
                />
                <span className="text-sm">Audit logs</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.includeData.userData}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    includeData: { ...prev.includeData, userData: e.target.checked }
                  }))}
                  disabled={creating}
                  className="rounded"
                />
                <span className="text-sm">User data</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.includeData.systemSettings}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    includeData: { ...prev.includeData, systemSettings: e.target.checked }
                  }))}
                  disabled={creating}
                  className="rounded"
                />
                <span className="text-sm">System settings</span>
              </label>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Format Selection
            </label>
            <div className="space-y-2">
              {Object.values(BackupFileType).map(format => (
                <label key={format} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.formats.includes(format)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConfig(prev => ({ ...prev, formats: [...prev.formats, format] }));
                      } else {
                        setConfig(prev => ({
                          ...prev,
                          formats: prev.formats.filter(f => f !== format)
                        }));
                      }
                    }}
                    disabled={creating}
                    className="rounded"
                  />
                  <span className="text-sm">{format}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={config.dateRange.enabled}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, enabled: e.target.checked }
                }))}
                disabled={creating}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Backup specific date range only
              </span>
            </label>

            {config.dateRange.enabled && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">From</label>
                  <input
                    type="date"
                    value={config.dateRange.from}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, from: e.target.value }
                    }))}
                    disabled={creating}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">To</label>
                  <input
                    type="date"
                    value={config.dateRange.to}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, to: e.target.value }
                    }))}
                    disabled={creating}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes/Description (Optional)
            </label>
            <textarea
              value={config.notes}
              onChange={(e) => setConfig(prev => ({ ...prev, notes: e.target.value }))}
              disabled={creating}
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Add any notes about this backup..."
            />
          </div>

          {/* Estimated Size */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Estimated File Size:</span>
              <span className="text-lg font-bold text-blue-900">{estimateFileSize()}</span>
            </div>
          </div>

          {/* Progress */}
          {progress && (
            <div className="bg-gray-50 border rounded-md p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">{progress.step}</span>
                <span className="text-sm text-gray-600">{progress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={creating}
            className="px-6 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || config.formats.length === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {creating ? 'Creating...' : 'Create Backup'}
          </button>
        </div>
      </div>
    </div>
  );
}
