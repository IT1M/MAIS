'use client';

import { useState, useEffect } from 'react';

interface BackupHealth {
  lastSuccessfulBackup?: string;
  nextScheduledBackup?: string;
  backupStreak: number;
  failedBackupsLast30Days: number;
  averageBackupDuration: number;
  totalStorageUsed: number;
  storageLimit: number;
  alerts: { type: 'warning' | 'error'; message: string }[];
}

export default function BackupHealthDashboard() {
  const [health, setHealth] = useState<BackupHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/backup?action=health');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Failed to fetch backup health:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!health) return null;

  const storagePercentage = (health.totalStorageUsed / health.storageLimit) * 100;

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Backup Health Monitor</h2>

      {/* Alerts */}
      {health.alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {health.alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-md ${
                alert.type === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{alert.type === 'error' ? '❌' : '⚠️'}</span>
                <span className="font-medium">{alert.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Last Backup */}
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Last Successful Backup</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatDate(health.lastSuccessfulBackup)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {health.lastSuccessfulBackup
              ? new Date(health.lastSuccessfulBackup).toLocaleDateString()
              : 'No backups yet'}
          </div>
        </div>

        {/* Next Backup */}
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Next Scheduled Backup</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatDate(health.nextScheduledBackup)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {health.nextScheduledBackup ? 'Automatic' : 'Not scheduled'}
          </div>
        </div>

        {/* Backup Streak */}
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Backup Streak</div>
          <div className="text-2xl font-bold text-green-600">
            {health.backupStreak}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {health.backupStreak === 1
              ? 'consecutive day'
              : 'consecutive days'}
          </div>
        </div>

        {/* Failed Backups */}
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Failed Backups (30d)</div>
          <div className={`text-2xl font-bold ${
            health.failedBackupsLast30Days > 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {health.failedBackupsLast30Days}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {health.failedBackupsLast30Days === 0 ? 'All successful ✓' : 'Needs attention'}
          </div>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="mt-6 border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-700">Storage Usage</div>
          <div className="text-sm text-gray-600">
            {formatBytes(health.totalStorageUsed)} / {formatBytes(health.storageLimit)}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              storagePercentage > 80
                ? 'bg-red-600'
                : storagePercentage > 60
                ? 'bg-yellow-500'
                : 'bg-green-600'
            }`}
            style={{ width: `${Math.min(storagePercentage, 100)}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {storagePercentage.toFixed(1)}% used
        </div>
      </div>
    </div>
  );
}
