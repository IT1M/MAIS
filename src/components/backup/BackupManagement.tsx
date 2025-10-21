'use client';

import { useState, useEffect } from 'react';
import { BackupFileType, BackupStatus } from '@prisma/client';
import BackupHistoryTable from './BackupHistoryTable';
import BackupHealthDashboard from './BackupHealthDashboard';
import CreateBackupModal from './CreateBackupModal';

export default function BackupManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [backupConfig, setBackupConfig] = useState({
    enableAutoBackup: true,
    backupTime: '02:00',
    backupFormats: [BackupFileType.JSON],
    includeAuditLogs: true,
    retentionDays: 30,
    retentionWeeks: 12,
    retentionMonths: 12,
  });

  const handleSaveConfig = async () => {
    try {
      const response = await fetch('/api/backup/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupConfig),
      });

      if (response.ok) {
        alert('Backup configuration saved successfully');
      }
    } catch (error) {
      console.error('Failed to save backup config:', error);
      alert('Failed to save configuration');
    }
  };

  return (
    <div className="space-y-6">
      {/* Health Dashboard */}
      <BackupHealthDashboard />

      {/* Configuration Panel */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Automatic Backup Configuration</h2>
          <span className="text-sm text-gray-500">Admin Only</span>
        </div>

        <div className="space-y-6">
          {/* Enable Auto Backup */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Enable Automatic Daily Backups
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Automatically create backups at the scheduled time
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={backupConfig.enableAutoBackup}
                onChange={(e) => setBackupConfig(prev => ({ ...prev, enableAutoBackup: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Backup Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Backup Time
            </label>
            <input
              type="time"
              value={backupConfig.backupTime}
              onChange={(e) => setBackupConfig(prev => ({ ...prev, backupTime: e.target.value }))}
              className="px-3 py-2 border rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">Default: 2:00 AM</p>
          </div>

          {/* Backup Formats */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Backup Formats
            </label>
            <div className="space-y-2">
              {Object.values(BackupFileType).map(format => (
                <label key={format} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={backupConfig.backupFormats.includes(format)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBackupConfig(prev => ({
                          ...prev,
                          backupFormats: [...prev.backupFormats, format],
                        }));
                      } else {
                        setBackupConfig(prev => ({
                          ...prev,
                          backupFormats: prev.backupFormats.filter(f => f !== format),
                        }));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{format}</span>
                  <span className="text-xs text-gray-500">
                    {format === 'CSV' && '(lightweight, Excel-compatible)'}
                    {format === 'JSON' && '(complete data structure)'}
                    {format === 'SQL' && '(PostgreSQL, for complete restore)'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Include Audit Logs */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={backupConfig.includeAuditLogs}
                onChange={(e) => setBackupConfig(prev => ({ ...prev, includeAuditLogs: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm font-medium">Include audit logs in backup</span>
            </label>
          </div>

          {/* Retention Policy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Backup Retention Policy
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Daily Backups</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={backupConfig.retentionDays}
                    onChange={(e) => setBackupConfig(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
                    className="w-20 px-3 py-2 border rounded-md text-sm"
                    min="1"
                  />
                  <span className="text-sm text-gray-600">days</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Weekly Backups</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={backupConfig.retentionWeeks}
                    onChange={(e) => setBackupConfig(prev => ({ ...prev, retentionWeeks: parseInt(e.target.value) }))}
                    className="w-20 px-3 py-2 border rounded-md text-sm"
                    min="1"
                  />
                  <span className="text-sm text-gray-600">weeks</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Monthly Backups</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={backupConfig.retentionMonths}
                    onChange={(e) => setBackupConfig(prev => ({ ...prev, retentionMonths: parseInt(e.target.value) }))}
                    className="w-20 px-3 py-2 border rounded-md text-sm"
                    min="1"
                  />
                  <span className="text-sm text-gray-600">months</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t">
            <button
              onClick={handleSaveConfig}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Manual Backup Section */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Manual Backup</h2>
            <p className="text-sm text-gray-500 mt-1">Create a backup on demand</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium flex items-center gap-2"
          >
            <span>📦</span>
            Create Backup
          </button>
        </div>
      </div>

      {/* Backup History */}
      <BackupHistoryTable />

      {/* Create Backup Modal */}
      {showCreateModal && (
        <CreateBackupModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
