'use client';

import { useState } from 'react';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { UserManagement } from '@/components/settings/UserManagement';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { APISettings } from '@/components/settings/APISettings';
import { SystemPreferences } from '@/components/settings/SystemPreferences';
import { SettingsSection } from '@/types/settings';

// Mock user data - replace with actual auth
const mockUser = {
  id: '1',
  name: 'Ahmed Al-Saud',
  email: 'ahmed@mais.com',
  role: 'ADMIN' as const,
  avatar: '',
  employeeId: 'EMP001',
  department: 'Warehouse',
  phone: '+966 50 123 4567',
  workLocation: 'Riyadh Office',
};

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    { id: 'profile' as SettingsSection, icon: '👤', label: 'Profile', roles: ['*'] },
    { id: 'security' as SettingsSection, icon: '🔐', label: 'Security', roles: ['*'] },
    { id: 'users' as SettingsSection, icon: '👥', label: 'User Management', roles: ['ADMIN'] },
    { id: 'appearance' as SettingsSection, icon: '🎨', label: 'Appearance', roles: ['*'] },
    { id: 'notifications' as SettingsSection, icon: '🔔', label: 'Notifications', roles: ['*'] },
    { id: 'api' as SettingsSection, icon: '🔌', label: 'API & Integrations', roles: ['ADMIN'] },
    {
      id: 'system' as SettingsSection,
      icon: '⚙️',
      label: 'System Preferences',
      roles: ['ADMIN', 'MANAGER'],
    },
  ];

  const visibleSections = sections.filter(
    (section) => section.roles.includes('*') || section.roles.includes(mockUser.role)
  );

  const filteredSections = searchQuery
    ? visibleSections.filter((section) =>
        section.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : visibleSections;

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSettings user={mockUser} />;
      case 'security':
        return <SecuritySettings />;
      case 'users':
        return <UserManagement />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'api':
        return <APISettings />;
      case 'system':
        return <SystemPreferences userRole={mockUser.role} />;
      default:
        return <ProfileSettings user={mockUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xl">{section.icon}</span>
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </nav>

            {/* Quick Info */}
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Quick Info
              </h3>
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <p>
                  <span className="font-medium">Role:</span> {mockUser.role}
                </p>
                <p>
                  <span className="font-medium">Department:</span> {mockUser.department}
                </p>
                <p>
                  <span className="font-medium">Employee ID:</span> {mockUser.employeeId}
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
