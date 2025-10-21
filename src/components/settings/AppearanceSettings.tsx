'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import toast from 'react-hot-toast';

export function AppearanceSettings() {
  const [settings, setSettings] = useState({
    theme: 'system' as 'light' | 'dark' | 'system',
    colorScheme: 'default',
    primaryColor: '#3B82F6',
    accentColor: '#10B981',
    uiDensity: 'comfortable' as 'compact' | 'comfortable' | 'spacious',
    fontSize: 16,
    sidebarPosition: 'left' as 'left' | 'right',
    sidebarCollapsed: false,
    showBreadcrumbs: true,
  });

  const handleSave = async () => {
    try {
      await fetch('/api/settings/appearance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      toast.success('Appearance settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const colorPresets = [
    { name: 'Default', primary: '#3B82F6', accent: '#10B981' },
    { name: 'Blue', primary: '#2563EB', accent: '#3B82F6' },
    { name: 'Green', primary: '#059669', accent: '#10B981' },
    { name: 'Purple', primary: '#7C3AED', accent: '#A78BFA' },
    { name: 'Red', primary: '#DC2626', accent: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appearance Settings</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Customize the look and feel of your interface
        </p>
      </div>

      {/* Theme Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme Mode</h3>
        <div className="grid grid-cols-3 gap-4">
          {(['light', 'dark', 'system'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => setSettings({ ...settings, theme })}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.theme === theme
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">
                {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '🌗'}
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {theme}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Color Scheme */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Color Scheme</h3>
        <div className="grid grid-cols-5 gap-4 mb-4">
          {colorPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() =>
                setSettings({
                  ...settings,
                  colorScheme: preset.name.toLowerCase(),
                  primaryColor: preset.primary,
                  accentColor: preset.accent,
                })
              }
              className={`p-3 rounded-lg border-2 transition-all ${
                settings.colorScheme === preset.name.toLowerCase()
                  ? 'border-blue-600'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex space-x-1 mb-2">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: preset.primary }}
                />
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: preset.accent }}
                />
              </div>
              <div className="text-xs font-medium text-gray-900 dark:text-white">
                {preset.name}
              </div>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Color
            </label>
            <input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
              className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Accent Color
            </label>
            <input
              type="color"
              value={settings.accentColor}
              onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
              className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>
      </div>

      {/* UI Density */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">UI Density</h3>
        <div className="grid grid-cols-3 gap-4">
          {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
            <button
              key={density}
              onClick={() => setSettings({ ...settings, uiDensity: density })}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.uiDensity === density
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {density}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {density === 'compact' && 'Tighter spacing'}
                {density === 'comfortable' && 'Default spacing'}
                {density === 'spacious' && 'Larger padding'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Font Size</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">12px</span>
          <input
            type="range"
            min="12"
            max="20"
            value={settings.fontSize}
            onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">20px</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
            {settings.fontSize}px
          </span>
        </div>
        <div
          className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded"
          style={{ fontSize: `${settings.fontSize}px` }}
        >
          Preview text: The quick brown fox jumps over the lazy dog
        </div>
      </div>

      {/* Layout Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Layout Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Sidebar Position
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose left or right sidebar
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={settings.sidebarPosition === 'left' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSettings({ ...settings, sidebarPosition: 'left' })}
              >
                Left
              </Button>
              <Button
                variant={settings.sidebarPosition === 'right' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSettings({ ...settings, sidebarPosition: 'right' })}
              >
                Right
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Sidebar Collapsed by Default
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Start with collapsed sidebar
              </p>
            </div>
            <Switch
              checked={settings.sidebarCollapsed}
              onChange={(e) => setSettings({ ...settings, sidebarCollapsed: e.target.checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Show Breadcrumbs
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Display navigation breadcrumbs
              </p>
            </div>
            <Switch
              checked={settings.showBreadcrumbs}
              onChange={(e) => setSettings({ ...settings, showBreadcrumbs: e.target.checked })}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>Apply Changes</Button>
      </div>
    </div>
  );
}
