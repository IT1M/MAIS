'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    email: {
      dailySummary: true,
      weeklyReport: true,
      newUserRegistration: false,
      highRejectAlert: true,
      systemUpdates: true,
      backupStatus: true,
    },
    inApp: {
      enabled: true,
      playSound: true,
      desktop: false,
    },
    frequency: 'realtime' as 'realtime' | 'hourly' | 'daily' | 'custom',
  });

  const handleEmailToggle = (key: keyof typeof settings.email) => {
    setSettings({
      ...settings,
      email: { ...settings.email, [key]: !settings.email[key] },
    });
  };

  const handleInAppToggle = (key: keyof typeof settings.inApp) => {
    setSettings({
      ...settings,
      inApp: { ...settings.inApp, [key]: !settings.inApp[key] },
    });
  };

  const handleSave = async () => {
    try {
      await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      toast.success('Notification settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const requestDesktopPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Desktop notifications enabled');
        setSettings({
          ...settings,
          inApp: { ...settings.inApp, desktop: true },
        });
      } else {
        toast.error('Desktop notifications denied');
      }
    } else {
      toast.error('Desktop notifications not supported');
    }
  };

  const sendTestNotification = () => {
    toast.success('This is a test notification!', {
      duration: 4000,
      icon: '🔔',
    });

    if (settings.inApp.desktop && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test desktop notification from Mais Inventory',
        icon: '/favicon.ico',
      });
    }
  };

  const sendTestEmail = async () => {
    try {
      await fetch('/api/settings/notifications/test-email', { method: 'POST' });
      toast.success('Test email sent');
    } catch (error) {
      toast.error('Failed to send test email');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Notification Settings
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage how you receive notifications
        </p>
      </div>

      {/* Email Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Email Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Daily Inventory Summary
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receive daily summary of inventory changes
              </p>
            </div>
            <Switch
              checked={settings.email.dailySummary}
              onChange={() => handleEmailToggle('dailySummary')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Weekly Analytics Report
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Get weekly analytics and insights
              </p>
            </div>
            <Switch
              checked={settings.email.weeklyReport}
              onChange={() => handleEmailToggle('weeklyReport')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                New User Registration
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Notify when new users are added (Admin only)
              </p>
            </div>
            <Switch
              checked={settings.email.newUserRegistration}
              onChange={() => handleEmailToggle('newUserRegistration')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                High Reject Rate Alert
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Alert when reject rate exceeds 15%
              </p>
            </div>
            <Switch
              checked={settings.email.highRejectAlert}
              onChange={() => handleEmailToggle('highRejectAlert')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                System Updates
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Notifications about system updates and maintenance
              </p>
            </div>
            <Switch
              checked={settings.email.systemUpdates}
              onChange={() => handleEmailToggle('systemUpdates')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Backup Status
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Notify about backup completion or failures
              </p>
            </div>
            <Switch
              checked={settings.email.backupStatus}
              onChange={() => handleEmailToggle('backupStatus')}
            />
          </div>
        </div>
      </div>

      {/* In-App Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          In-App Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Enable Browser Notifications
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Show notifications in the application
              </p>
            </div>
            <Switch
              checked={settings.inApp.enabled}
              onChange={() => handleInAppToggle('enabled')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Play Sound
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Play sound for notifications
              </p>
            </div>
            <Switch
              checked={settings.inApp.playSound}
              onChange={() => handleInAppToggle('playSound')}
              disabled={!settings.inApp.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Desktop Notifications
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Show system desktop notifications
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {!settings.inApp.desktop && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestDesktopPermission}
                  disabled={!settings.inApp.enabled}
                >
                  Enable
                </Button>
              )}
              <Switch
                checked={settings.inApp.desktop}
                onChange={() => handleInAppToggle('desktop')}
                disabled={!settings.inApp.enabled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Frequency */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notification Frequency
        </h3>
        <Select
          label="How often do you want to receive notifications?"
          value={settings.frequency}
          onChange={(e) =>
            setSettings({
              ...settings,
              frequency: e.target.value as typeof settings.frequency,
            })
          }
          options={[
            { value: 'realtime', label: 'Real-time (as they happen)' },
            { value: 'hourly', label: 'Batched Hourly' },
            { value: 'daily', label: 'Daily Digest' },
            { value: 'custom', label: 'Custom Schedule' },
          ]}
        />
      </div>

      {/* Test Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Test Notifications
        </h3>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={sendTestEmail}>
            Send Test Email
          </Button>
          <Button variant="outline" onClick={sendTestNotification}>
            Show Test Notification
          </Button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
}
