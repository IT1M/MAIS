'use client';

import { useState } from 'react';
import { ReportType } from '@prisma/client';

export default function ReportGeneration() {
  const [config, setConfig] = useState<{
    type: ReportType;
    period: {
      month: number;
      year: number;
      customFrom: string;
      customTo: string;
    };
    content: {
      summary: boolean;
      charts: boolean;
      detailedTable: boolean;
      rejectAnalysis: boolean;
      destinationBreakdown: boolean;
      categoryAnalysis: boolean;
      aiInsights: boolean;
      userActivity: boolean;
      auditTrail: boolean;
      comparativeAnalysis: boolean;
    };
    format: 'pdf' | 'excel' | 'powerpoint';
    customization: {
      includeLogo: boolean;
      includeSignatures: boolean;
      language: 'en' | 'ar' | 'bilingual';
      paperSize: 'A4' | 'Letter';
      orientation: 'portrait' | 'landscape';
    };
    email: {
      enabled: boolean;
      recipients: string[];
      subject: string;
      message: string;
    };
  }>({
    type: ReportType.MONTHLY,
    period: {
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      customFrom: '',
      customTo: '',
    },
    content: {
      summary: true,
      charts: true,
      detailedTable: true,
      rejectAnalysis: true,
      destinationBreakdown: true,
      categoryAnalysis: true,
      aiInsights: true,
      userActivity: false,
      auditTrail: false,
      comparativeAnalysis: false,
    },
    format: 'pdf',
    customization: {
      includeLogo: true,
      includeSignatures: true,
      language: 'en',
      paperSize: 'A4',
      orientation: 'portrait',
    },
    email: {
      enabled: false,
      recipients: [],
      subject: '',
      message: '',
    },
  });

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<{ step: string; percentage: number; message: string } | null>(null);
  const [recipientInput, setRecipientInput] = useState('');

  const handleGenerate = async () => {
    setGenerating(true);
    setProgress({ step: 'Starting...', percentage: 0, message: 'Initializing report generation' });

    try {
      // Calculate period dates
      let periodStart: Date;
      let periodEnd: Date;

      if (config.type === ReportType.MONTHLY) {
        periodStart = new Date(config.period.year, config.period.month, 1);
        periodEnd = new Date(config.period.year, config.period.month + 1, 0);
      } else if (config.type === ReportType.YEARLY) {
        periodStart = new Date(config.period.year, 0, 1);
        periodEnd = new Date(config.period.year, 11, 31);
      } else {
        periodStart = new Date(config.period.customFrom);
        periodEnd = new Date(config.period.customTo);
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user-id', // Replace with actual user ID
          config: {
            ...config,
            period: { start: periodStart, end: periodEnd },
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProgress({ step: 'Complete!', percentage: 100, message: 'Report generated successfully' });
        setTimeout(() => {
          alert('Report generated successfully!');
          window.location.reload();
        }, 1000);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      alert('Failed to generate report: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const addRecipient = () => {
    if (recipientInput && recipientInput.includes('@')) {
      setConfig(prev => ({
        ...prev,
        email: {
          ...prev.email,
          recipients: [...prev.email.recipients, recipientInput],
        },
      }));
      setRecipientInput('');
    }
  };

  const removeRecipient = (email: string) => {
    setConfig(prev => ({
      ...prev,
      email: {
        ...prev.email,
        recipients: prev.email.recipients.filter(r => r !== email),
      },
    }));
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Generate Report</h2>

      <div className="space-y-6">
        {/* Report Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Type
          </label>
          <select
            value={config.type}
            onChange={(e) => setConfig(prev => ({ ...prev, type: e.target.value as ReportType }))}
            disabled={generating}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value={ReportType.MONTHLY}>Monthly Inventory Report</option>
            <option value={ReportType.YEARLY}>Yearly Summary Report</option>
            <option value={ReportType.CUSTOM}>Custom Date Range Report</option>
            <option value={ReportType.AUDIT}>Audit Report</option>
          </select>
        </div>

        {/* Time Period */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Period
          </label>
          
          {config.type === ReportType.MONTHLY && (
            <div className="grid grid-cols-2 gap-4">
              <select
                value={config.period.month}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  period: { ...prev.period, month: parseInt(e.target.value) }
                }))}
                disabled={generating}
                className="px-3 py-2 border rounded-md"
              >
                {months.map((month, idx) => (
                  <option key={idx} value={idx}>{month}</option>
                ))}
              </select>
              <select
                value={config.period.year}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  period: { ...prev.period, year: parseInt(e.target.value) }
                }))}
                disabled={generating}
                className="px-3 py-2 border rounded-md"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          {config.type === ReportType.YEARLY && (
            <select
              value={config.period.year}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                period: { ...prev.period, year: parseInt(e.target.value) }
              }))}
              disabled={generating}
              className="w-full px-3 py-2 border rounded-md"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}

          {config.type === ReportType.CUSTOM && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">From</label>
                <input
                  type="date"
                  value={config.period.customFrom}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    period: { ...prev.period, customFrom: e.target.value }
                  }))}
                  disabled={generating}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">To</label>
                <input
                  type="date"
                  value={config.period.customTo}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    period: { ...prev.period, customTo: e.target.value }
                  }))}
                  disabled={generating}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          )}
        </div>

        {/* Report Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Report Content
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(config.content).map(([key, value]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    content: { ...prev.content, [key]: e.target.checked }
                  }))}
                  disabled={generating}
                  className="rounded"
                />
                <span className="text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                  {key === 'aiInsights' && ' (recommended)'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Report Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Format
          </label>
          <div className="flex gap-4">
            {(['pdf', 'excel', 'powerpoint'] as const).map(format => (
              <label key={format} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="format"
                  value={format}
                  checked={config.format === format}
                  onChange={(e) => setConfig(prev => ({ ...prev, format: e.target.value as any }))}
                  disabled={generating}
                  className="rounded"
                />
                <span className="text-sm capitalize">{format}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Customization Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Customization Options
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.customization.includeLogo}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  customization: { ...prev.customization, includeLogo: e.target.checked }
                }))}
                disabled={generating}
                className="rounded"
              />
              <span className="text-sm">Include company logo</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.customization.includeSignatures}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  customization: { ...prev.customization, includeSignatures: e.target.checked }
                }))}
                disabled={generating}
                className="rounded"
              />
              <span className="text-sm">Include signature section</span>
            </label>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Language</label>
                <select
                  value={config.customization.language}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    customization: { ...prev.customization, language: e.target.value as any }
                  }))}
                  disabled={generating}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                  <option value="bilingual">Bilingual</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Paper Size</label>
                <select
                  value={config.customization.paperSize}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    customization: { ...prev.customization, paperSize: e.target.value as any }
                  }))}
                  disabled={generating}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Orientation</label>
                <select
                  value={config.customization.orientation}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    customization: { ...prev.customization, orientation: e.target.value as any }
                  }))}
                  disabled={generating}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Email Options */}
        <div>
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={config.email.enabled}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                email: { ...prev.email, enabled: e.target.checked }
              }))}
              disabled={generating}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Email report when ready
            </span>
          </label>

          {config.email.enabled && (
            <div className="ml-6 space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Recipients</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                    placeholder="email@example.com"
                    disabled={generating}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                  />
                  <button
                    onClick={addRecipient}
                    disabled={generating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {config.email.recipients.map(email => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    >
                      {email}
                      <button
                        onClick={() => removeRecipient(email)}
                        className="hover:text-blue-900"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Subject</label>
                <input
                  type="text"
                  value={config.email.subject}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    email: { ...prev.email, subject: e.target.value }
                  }))}
                  disabled={generating}
                  placeholder="Inventory Report - October 2025"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Message</label>
                <textarea
                  value={config.email.message}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    email: { ...prev.email, message: e.target.value }
                  }))}
                  disabled={generating}
                  rows={3}
                  placeholder="Please find attached the inventory report..."
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Progress */}
        {progress && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">{progress.step}</span>
              <span className="text-sm text-blue-700">{progress.percentage}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-blue-700">{progress.message}</p>
            <p className="text-xs text-blue-600 mt-1">Estimated time: ~2-3 minutes</p>
          </div>
        )}

        {/* Generate Button */}
        <div className="pt-4 border-t">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
          >
            {generating ? 'Generating Report...' : '📊 Generate Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
