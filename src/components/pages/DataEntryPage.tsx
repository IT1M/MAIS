'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { DataEntryForm } from '@/components/forms/DataEntryForm';
import { QuickStatsWidget } from '@/components/widgets/QuickStatsWidget';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useRouter } from 'next/navigation';

export function DataEntryPage() {
  const router = useRouter();
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleSuccess = () => {
    // Optional: Show success animation or update stats
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                📦 Inventory Data Entry
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Enter new inventory items - Saudi Mais Co.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                {currentDateTime}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>New Entry</CardTitle>
              </CardHeader>
              <CardContent>
                <DataEntryForm onSuccess={handleSuccess} />
              </CardContent>
            </Card>

            {/* Action Links */}
            <div className="mt-4 flex gap-4">
              <button
                onClick={() => router.push('/inventory')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                → View All Entries
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                → Back to Dashboard
              </button>
            </div>
          </div>

          {/* Sidebar - Quick Stats */}
          <div className="lg:col-span-1">
            <QuickStatsWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
