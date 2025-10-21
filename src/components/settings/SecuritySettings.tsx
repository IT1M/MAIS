'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface SecuritySession {
  id: string;
  deviceInfo: string;
  browser: string;
  ipAddress: string;
  location?: string;
  lastActive: Date;
  isCurrent: boolean;
}

interface SecurityLog {
  id: string;
  action: string;
  timestamp: Date;
  ipAddress: string;
  success: boolean;
}

export function SecuritySettings() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<SecuritySession[]>([
    {
      id: '1',
      deviceInfo: 'MacBook Pro',
      browser: 'Chrome 120',
      ipAddress: '192.168.1.100',
      location: 'Riyadh, Saudi Arabia',
      lastActive: new Date(),
      isCurrent: true,
    },
  ]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 1) return { label: 'Weak', color: 'text-red-600', width: '25%' };
    if (strength === 2) return { label: 'Fair', color: 'text-yellow-600', width: '50%' };
    if (strength === 3) return { label: 'Good', color: 'text-blue-600', width: '75%' };
    return { label: 'Strong', color: 'text-green-600', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) throw new Error('Failed to change password');

      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOutSession = async (sessionId: string) => {
    try {
      await fetch(`/api/settings/sessions/${sessionId}`, { method: 'DELETE' });
      setSessions(sessions.filter((s) => s.id !== sessionId));
      toast.success('Session signed out');
    } catch (error) {
      toast.error('Failed to sign out session');
    }
  };

  const handleSignOutAll = async () => {
    try {
      await fetch('/api/settings/sessions/all', { method: 'DELETE' });
      setSessions(sessions.filter((s) => s.isCurrent));
      toast.success('All other sessions signed out');
    } catch (error) {
      toast.error('Failed to sign out sessions');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your password and active sessions
        </p>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Change Password
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="relative">
            <Input
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              required
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords({ ...showPasswords, current: !showPasswords.current })
              }
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.current ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <div className="relative">
            <Input
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.new ? '👁️' : '👁️‍🗨️'}
            </button>
            {passwordForm.newPassword && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Password strength:</span>
                  <span className={passwordStrength.color}>{passwordStrength.label}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      passwordStrength.label === 'Weak'
                        ? 'bg-red-600'
                        : passwordStrength.label === 'Fair'
                        ? 'bg-yellow-600'
                        : passwordStrength.label === 'Good'
                        ? 'bg-blue-600'
                        : 'bg-green-600'
                    }`}
                    style={{ width: passwordStrength.width }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <Input
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              required
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
              }
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              Password Requirements:
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li className="flex items-center">
                <span className="mr-2">{passwordForm.newPassword.length >= 8 ? '✓' : '○'}</span>
                Minimum 8 characters
              </li>
              <li className="flex items-center">
                <span className="mr-2">{/[A-Z]/.test(passwordForm.newPassword) ? '✓' : '○'}</span>
                At least one uppercase letter
              </li>
              <li className="flex items-center">
                <span className="mr-2">{/[0-9]/.test(passwordForm.newPassword) ? '✓' : '○'}</span>
                At least one number
              </li>
              <li className="flex items-center">
                <span className="mr-2">
                  {/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? '✓' : '○'}
                </span>
                At least one special character
              </li>
            </ul>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </Button>
        </form>
      </div>

      {/* Active Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Sessions</h3>
          {sessions.length > 1 && (
            <Button variant="outline" size="sm" onClick={handleSignOutAll}>
              Sign Out All Others
            </Button>
          )}
        </div>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {session.deviceInfo} - {session.browser}
                  </p>
                  {session.isCurrent && <Badge variant="success">Current</Badge>}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {session.ipAddress}
                  {session.location && ` • ${session.location}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Last active: {format(session.lastActive, 'PPp')}
                </p>
              </div>
              {!session.isCurrent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSignOutSession(session.id)}
                >
                  Sign Out
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
