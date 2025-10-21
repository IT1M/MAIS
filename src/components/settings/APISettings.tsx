'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export function APISettings() {
  const [apiKey, setApiKey] = useState('****************************C0M');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidated, setLastValidated] = useState<Date | null>(new Date());
  
  const [aiSettings, setAiSettings] = useState({
    model: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 2048,
    cacheDuration: 60,
    features: {
      insights: true,
      predictive: true,
      nlq: false,
    },
  });

  const [dbStatus] = useState({
    type: 'PostgreSQL',
    status: 'connected' as 'connected' | 'disconnected' | 'error',
    lastMigration: new Date('2024-01-15'),
    size: '245 MB',
    backupStatus: 'ok' as 'ok' | 'warning' | 'error',
  });

  const handleValidateKey = async () => {
    setIsValidating(true);
    try {
      const response = await fetch('/api/settings/validate-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      if (!response.ok) throw new Error('Invalid API key');

      setLastValidated(new Date());
      toast.success('API key validated successfully');
    } catch (error) {
      toast.error('Failed to validate API key');
    } finally {
      setIsValidating(false);
    }
  };

  const handleUpdateApiKey = async () => {
    try {
      await fetch('/api/settings/api-key', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      toast.success('API key updated');
      setShowApiKey(false);
    } catch (error) {
      toast.error('Failed to update API key');
    }
  };

  const handleSaveAISettings = async () => {
    try {
      await fetch('/api/settings/ai', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiSettings),
      });
      toast.success('AI settings saved');
    } catch (error) {
      toast.error('Failed to save AI settings');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          API & Integrations
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage API keys and external integrations
        </p>
      </div>

      {/* Gemini AI Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Gemini AI Configuration
        </h3>

        {/* API Key Management */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Key
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showApiKey ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <Button variant="outline" onClick={handleValidateKey} disabled={isValidating}>
                {isValidating ? 'Validating...' : 'Validate'}
              </Button>
              <Button onClick={handleUpdateApiKey}>Update</Button>
            </div>
            {lastValidated && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Last validated: {format(lastValidated, 'PPp')}
              </p>
            )}
          </div>

          {/* Usage Stats */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
              Usage Statistics
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-400">Requests This Month</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-300">1,247</p>
              </div>
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-400">Tokens Consumed</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-300">45.2K</p>
              </div>
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-400">Rate Limit</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-300">60/min</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Features Toggle */}
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">AI Features</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Enable AI Insights
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Get intelligent insights from your data
                </p>
              </div>
              <Switch
                checked={aiSettings.features.insights}
                onChange={(e) =>
                  setAiSettings({
                    ...aiSettings,
                    features: { ...aiSettings.features, insights: e.target.checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Enable Predictive Analytics
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Forecast trends and patterns
                </p>
              </div>
              <Switch
                checked={aiSettings.features.predictive}
                onChange={(e) =>
                  setAiSettings({
                    ...aiSettings,
                    features: { ...aiSettings.features, predictive: e.target.checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Enable Natural Language Queries
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ask questions in plain language
                </p>
              </div>
              <Switch
                checked={aiSettings.features.nlq}
                onChange={(e) =>
                  setAiSettings({
                    ...aiSettings,
                    features: { ...aiSettings.features, nlq: e.target.checked },
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* AI Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">AI Settings</h4>
          <Select
            label="Model Selection"
            value={aiSettings.model}
            onChange={(e) => setAiSettings({ ...aiSettings, model: e.target.value })}
            options={[
              { value: 'gemini-pro', label: 'Gemini Pro' },
              { value: 'gemini-pro-vision', label: 'Gemini Pro Vision' },
              { value: 'gemini-ultra', label: 'Gemini Ultra' },
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Response Temperature: {aiSettings.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={aiSettings.temperature}
              onChange={(e) =>
                setAiSettings({ ...aiSettings, temperature: parseFloat(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          <Input
            label="Max Tokens per Request"
            type="number"
            value={aiSettings.maxTokens}
            onChange={(e) =>
              setAiSettings({ ...aiSettings, maxTokens: parseInt(e.target.value) })
            }
            min={256}
            max={8192}
          />

          <Input
            label="Cache Insights Duration (minutes)"
            type="number"
            value={aiSettings.cacheDuration}
            onChange={(e) =>
              setAiSettings({ ...aiSettings, cacheDuration: parseInt(e.target.value) })
            }
            min={5}
            max={1440}
          />
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={handleSaveAISettings}>Save AI Settings</Button>
        </div>
      </div>

      {/* Database Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Database Configuration
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Database Type</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {dbStatus.type}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Connection Status</span>
            <Badge variant={dbStatus.status === 'connected' ? 'success' : 'danger'}>
              {dbStatus.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Last Migration</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {format(dbStatus.lastMigration, 'PP')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Database Size</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {dbStatus.size}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Backup Status</span>
            <Badge variant={dbStatus.backupStatus === 'ok' ? 'success' : 'warning'}>
              {dbStatus.backupStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* External Integrations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          External Integrations
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Accounting Software
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Connect to your accounting system
              </p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">ERP System</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Integrate with your ERP
              </p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Email Service
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Configure email notifications
              </p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
