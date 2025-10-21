'use client';

import { useState } from 'react';
import BackupManagement from '@/components/backup/BackupManagement';
import ReportGeneration from '@/components/reports/ReportGeneration';
import ReportHistoryTable from '@/components/reports/ReportHistoryTable';

export default function BackupPage() {
  const [activeTab, setActiveTab] = useState<'backup' | 'reports'>('backup');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Backup & Reports</h1>
          <p className="text-gray-600 mt-1">
            Manage backups and generate comprehensive reports
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('backup')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'backup'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📦 Backup Management
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'reports'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Report Generation
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'backup' && <BackupManagement />}
        
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReportGeneration />
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Reports This Month</span>
                      <span className="text-lg font-bold">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Most Recent</span>
                      <span className="text-sm font-medium">Monthly Report - Oct 2025</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pending</span>
                      <span className="text-lg font-bold text-orange-600">0</span>
                    </div>
                  </div>
                </div>

                {/* Storage Info */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Storage</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Used</span>
                      <span className="text-lg font-bold">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Free: 2.5 GB</span>
                      <span>Total: 5 GB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Report History */}
            <ReportHistoryTable />
          </div>
        )}
      </div>
    </div>
  );
}
