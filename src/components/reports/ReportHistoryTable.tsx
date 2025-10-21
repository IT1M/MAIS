'use client';

import { useState, useEffect } from 'react';
import { ReportType, ReportStatus } from '@prisma/client';

interface Report {
  id: string;
  title: string;
  type: ReportType;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
  status: ReportStatus;
  fileUrl?: string;
}

export default function ReportHistoryTable() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReports();
  }, [page]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports?page=${page}&limit=10`);
      const data = await response.json();
      setReports(data.reports);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (report: Report) => {
    if (report.fileUrl) {
      window.open(report.fileUrl, '_blank');
    } else {
      alert('Report file not available');
    }
  };

  const handleDelete = async (reportId: string) => {
    const confirmed = confirm('Are you sure you want to delete this report?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Report deleted successfully');
        fetchReports();
      }
    } catch (error) {
      alert('Failed to delete report');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPeriod = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      return startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    return `${startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };

  const getStatusBadge = (status: ReportStatus) => {
    const styles = {
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      FAILED: 'bg-red-100 text-red-800 border-red-200',
      GENERATING: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: ReportType) => {
    const styles = {
      MONTHLY: 'bg-blue-100 text-blue-800',
      YEARLY: 'bg-purple-100 text-purple-800',
      CUSTOM: 'bg-orange-100 text-orange-800',
      AUDIT: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type]}`}>
        {type}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Report History</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search reports..."
            className="px-3 py-2 border rounded-md text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Period
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Generated
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                By
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {report.title}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getTypeBadge(report.type)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {formatPeriod(report.periodStart, report.periodEnd)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(report.createdAt)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {report.user.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getStatusBadge(report.status)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    {report.status === ReportStatus.COMPLETED && (
                      <>
                        <button
                          onClick={() => handleDownload(report)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Download"
                        >
                          📥
                        </button>
                        <button
                          onClick={() => alert('Preview coming soon')}
                          className="text-green-600 hover:text-green-800"
                          title="Preview"
                        >
                          👁️
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          Page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
