'use client';

import { useState } from 'react';
import { InventoryItemWithUser } from '@/types/data-log';
import { exportToCSV, exportToJSON, getFileSizeString } from '@/lib/export-utils';
import toast from 'react-hot-toast';

interface ExportButtonProps {
  items: InventoryItemWithUser[];
  selectedIds: Set<string>;
  filters: any;
}

export function ExportButton({ items, selectedIds, filters }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const getExportData = () => {
    if (selectedIds.size > 0) {
      return items.filter(item => selectedIds.has(item.id));
    }
    return items;
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const data = getExportData();
      const filename = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
      exportToCSV(data, filename);
      
      const size = new Blob([JSON.stringify(data)]).size;
      toast.success(`Exported ${data.length} items (${getFileSizeString(size)})`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV');
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const data = getExportData();
      const filename = `inventory-export-${new Date().toISOString().split('T')[0]}.json`;
      exportToJSON(data, filename);
      
      const size = new Blob([JSON.stringify(data)]).size;
      toast.success(`Exported ${data.length} items (${getFileSizeString(size)})`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export JSON');
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const data = getExportData();
      const response = await fetch('/api/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, filters }),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${data.length} items (${getFileSizeString(blob.size)})`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel file');
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const data = getExportData();
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, filters }),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory-export-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${data.length} items (${getFileSizeString(blob.size)})`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF file');
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const exportCount = selectedIds.size > 0 ? selectedIds.size : items.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting || items.length === 0}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {isExporting ? 'Exporting...' : 'Export'}
        {selectedIds.size > 0 && (
          <span className="px-2 py-0.5 text-xs bg-green-500 rounded-full">
            {selectedIds.size}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                Export {exportCount} items
              </div>
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export as CSV
              </button>
              <button
                onClick={handleExportExcel}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Export as Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Export as PDF
              </button>
              <button
                onClick={handleExportJSON}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Export as JSON
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
