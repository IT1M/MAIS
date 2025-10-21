'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import toast from 'react-hot-toast';

export function SystemPreferences({ userRole }: { userRole: string }) {
  const [companySettings, setCompanySettings] = useState({
    name: 'Saudi Mais Co. for Medical Products',
    logo: '',
    fiscalYearStart: 1,
    timezone: 'Asia/Riyadh',
  });

  const [inventorySettings, setInventorySettings] = useState({
    defaultDestination: '' as '' | 'MAIS' | 'FOZAN',
    enableCategories: true,
    predefinedCategories: ['Medical Supplies', 'Equipment', 'Consumables'],
    autoGenerateBatch: false,
    batchPattern: 'BATCH-{YYYY}-{MM}-{###}',
    requireApproval: true,
    approvalThreshold: 10000,
  });

  const [backupSettings, setBackupSettings] = useState({
    enabled: true,
    time: '02:00',
    retentionDays: 30,
    format: 'both' as 'csv' | 'json' | 'both',
  });

  const [dataRetention, setDataRetention] = useState({
    auditLogDays: 365,
    autoArchive: true,
    archiveAfterDays: 730,
  });

  const [limits, setLimits] = useState({
    maxItemsPerDay: 1000,
    maxUploadSizeMB: 10,
    sessionTimeoutMinutes: 60,
  });

  const [developerSettings, setDeveloperSettings] = useState({
    debugMode: false,
    apiRateLimit: 100,
    logLevel: 'info' as 'error' | 'warning' | 'info' | 'debug',
  });

  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    if (newCategory && !inventorySettings.predefinedCategories.includes(newCategory)) {
      setInventorySettings({
        ...inventorySettings,
        predefinedCategories: [...inventorySettings.predefinedCategories, newCategory],
      });
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    setInventorySettings({
      ...inventorySettings,
      predefinedCategories: inventorySettings.predefinedCategories.filter((c) => c !== category),
    });
  };

  const handleSaveAll = async () => {
    try {
      await fetch('/api/settings/system', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: companySettings,
          inventory: inventorySettings,
          backup: backupSettings,
          dataRetention,
          limits,
          developer: developerSettings,
        }),
      });
      toast.success('System preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  const handleExportLogs = async () => {
    try {
      const response = await fetch('/api/settings/export-logs');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-logs-${new Date().toISOString()}.txt`;
      a.click();
      toast.success('Logs exported');
    } catch (error) {
      toast.error('Failed to export logs');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          System Preferences
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Configure system-wide settings and preferences
        </p>
      </div>

      {/* Company Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Company Information
        </h3>
        <div className="space-y-4">
          <Input
            label="Company Name"
            value={companySettings.name}
            onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Logo
            </label>
            <div className="flex items-center space-x-4">
              {companySettings.logo && (
                <img
                  src={companySettings.logo}
                  alt="Company Logo"
                  className="w-20 h-20 object-contain border border-gray-200 dark:border-gray-700 rounded"
                />
              )}
              <Button variant="outline" size="sm">
                Upload Logo
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Used in PDFs and headers. Recommended size: 200x200px
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Fiscal Year Start Month"
              value={companySettings.fiscalYearStart.toString()}
              onChange={(e) =>
                setCompanySettings({
                  ...companySettings,
                  fiscalYearStart: parseInt(e.target.value),
                })
              }
              options={[
                { value: '1', label: 'January' },
                { value: '2', label: 'February' },
                { value: '3', label: 'March' },
                { value: '4', label: 'April' },
                { value: '5', label: 'May' },
                { value: '6', label: 'June' },
                { value: '7', label: 'July' },
                { value: '8', label: 'August' },
                { value: '9', label: 'September' },
                { value: '10', label: 'October' },
                { value: '11', label: 'November' },
                { value: '12', label: 'December' },
              ]}
            />
            <Select
              label="Timezone"
              value={companySettings.timezone}
              onChange={(e) => setCompanySettings({ ...companySettings, timezone: e.target.value })}
              options={[
                { value: 'Asia/Riyadh', label: 'Asia/Riyadh (GMT+3)' },
                { value: 'Asia/Dubai', label: 'Asia/Dubai (GMT+4)' },
                { value: 'Europe/London', label: 'Europe/London (GMT+0)' },
                { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Inventory Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Inventory Settings
        </h3>
        <div className="space-y-4">
          <Select
            label="Default Destination"
            value={inventorySettings.defaultDestination}
            onChange={(e) =>
              setInventorySettings({
                ...inventorySettings,
                defaultDestination: e.target.value as '' | 'MAIS' | 'FOZAN',
              })
            }
            options={[
              { value: '', label: 'None (User must select)' },
              { value: 'MAIS', label: 'Mais' },
              { value: 'FOZAN', label: 'Fozan' },
            ]}
          />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Enable Categories
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Allow categorization of inventory items
              </p>
            </div>
            <Switch
              checked={inventorySettings.enableCategories}
              onChange={(e) =>
                setInventorySettings({ ...inventorySettings, enableCategories: e.target.checked })
              }
            />
          </div>

          {inventorySettings.enableCategories && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Predefined Categories
              </label>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add new category"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Button type="button" onClick={handleAddCategory}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {inventorySettings.predefinedCategories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  >
                    {category}
                    <button
                      onClick={() => handleRemoveCategory(category)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Auto-generate Batch Numbers
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatically create batch numbers
              </p>
            </div>
            <Switch
              checked={inventorySettings.autoGenerateBatch}
              onChange={(e) =>
                setInventorySettings({ ...inventorySettings, autoGenerateBatch: e.target.checked })
              }
            />
          </div>

          {inventorySettings.autoGenerateBatch && (
            <Input
              label="Batch Number Pattern"
              value={inventorySettings.batchPattern}
              onChange={(e) =>
                setInventorySettings({ ...inventorySettings, batchPattern: e.target.value })
              }
              helperText="Use {YYYY} for year, {MM} for month, {###} for sequence"
            />
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Require Supervisor Approval
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                For high-value items
              </p>
            </div>
            <Switch
              checked={inventorySettings.requireApproval}
              onChange={(e) =>
                setInventorySettings({ ...inventorySettings, requireApproval: e.target.checked })
              }
            />
          </div>

          {inventorySettings.requireApproval && (
            <Input
              label="Approval Threshold (SAR)"
              type="number"
              value={inventorySettings.approvalThreshold}
              onChange={(e) =>
                setInventorySettings({
                  ...inventorySettings,
                  approvalThreshold: parseInt(e.target.value),
                })
              }
            />
          )}
        </div>
      </div>

      {/* Backup & Maintenance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Backup & Maintenance
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Enable Daily Backups
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatic database backups
              </p>
            </div>
            <Switch
              checked={backupSettings.enabled}
              onChange={(e) => setBackupSettings({ ...backupSettings, enabled: e.target.checked })}
            />
          </div>

          {backupSettings.enabled && (
            <>
              <Input
                label="Backup Time"
                type="time"
                value={backupSettings.time}
                onChange={(e) => setBackupSettings({ ...backupSettings, time: e.target.value })}
              />
              <Input
                label="Retention Period (days)"
                type="number"
                value={backupSettings.retentionDays}
                onChange={(e) =>
                  setBackupSettings({ ...backupSettings, retentionDays: parseInt(e.target.value) })
                }
                min={1}
                max={365}
              />
              <Select
                label="Backup Format"
                value={backupSettings.format}
                onChange={(e) =>
                  setBackupSettings({
                    ...backupSettings,
                    format: e.target.value as 'csv' | 'json' | 'both',
                  })
                }
                options={[
                  { value: 'csv', label: 'CSV' },
                  { value: 'json', label: 'JSON' },
                  { value: 'both', label: 'Both (CSV & JSON)' },
                ]}
              />
            </>
          )}
        </div>
      </div>

      {/* Data Retention */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Data Retention
        </h3>
        <div className="space-y-4">
          <Input
            label="Keep Audit Logs For (days)"
            type="number"
            value={dataRetention.auditLogDays}
            onChange={(e) =>
              setDataRetention({ ...dataRetention, auditLogDays: parseInt(e.target.value) })
            }
            min={30}
            max={3650}
          />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Auto-archive Old Inventory
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Move old records to archive
              </p>
            </div>
            <Switch
              checked={dataRetention.autoArchive}
              onChange={(e) =>
                setDataRetention({ ...dataRetention, autoArchive: e.target.checked })
              }
            />
          </div>
          {dataRetention.autoArchive && (
            <Input
              label="Archive After (days)"
              type="number"
              value={dataRetention.archiveAfterDays}
              onChange={(e) =>
                setDataRetention({ ...dataRetention, archiveAfterDays: parseInt(e.target.value) })
              }
              min={365}
            />
          )}
        </div>
      </div>

      {/* System Limits */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          System Limits
        </h3>
        <div className="space-y-4">
          <Input
            label="Max Items Per User Per Day"
            type="number"
            value={limits.maxItemsPerDay}
            onChange={(e) => setLimits({ ...limits, maxItemsPerDay: parseInt(e.target.value) })}
            helperText="Prevent spam and errors"
          />
          <Input
            label="Max File Upload Size (MB)"
            type="number"
            value={limits.maxUploadSizeMB}
            onChange={(e) => setLimits({ ...limits, maxUploadSizeMB: parseInt(e.target.value) })}
          />
          <Input
            label="Session Timeout (minutes)"
            type="number"
            value={limits.sessionTimeoutMinutes}
            onChange={(e) =>
              setLimits({ ...limits, sessionTimeoutMinutes: parseInt(e.target.value) })
            }
            min={5}
            max={1440}
          />
        </div>
      </div>

      {/* Developer Settings (Admin Only) */}
      {userRole === 'ADMIN' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Developer Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Enable Debug Mode
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Show detailed error messages
                </p>
              </div>
              <Switch
                checked={developerSettings.debugMode}
                onChange={(e) =>
                  setDeveloperSettings({ ...developerSettings, debugMode: e.target.checked })
                }
              />
            </div>
            <Input
              label="API Rate Limit (requests/minute)"
              type="number"
              value={developerSettings.apiRateLimit}
              onChange={(e) =>
                setDeveloperSettings({ ...developerSettings, apiRateLimit: parseInt(e.target.value) })
              }
            />
            <Select
              label="Log Level"
              value={developerSettings.logLevel}
              onChange={(e) =>
                setDeveloperSettings({
                  ...developerSettings,
                  logLevel: e.target.value as 'error' | 'warning' | 'info' | 'debug',
                })
              }
              options={[
                { value: 'error', label: 'Error' },
                { value: 'warning', label: 'Warning' },
                { value: 'info', label: 'Info' },
                { value: 'debug', label: 'Debug' },
              ]}
            />
            <Button variant="outline" onClick={handleExportLogs}>
              Export System Logs
            </Button>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveAll}>Save All Settings</Button>
      </div>
    </div>
  );
}
