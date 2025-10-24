'use client';

import { useState, useEffect } from 'react';
import { BackupFileType, BackupStatus } from '@prisma/client';
import { EmptyState } from '@/components/ui/EmptyState';
import { Database } from 'lucide-react';

interface Backup {
  id: string;
  fileName: string;
  fileType: BackupFileType;
  fileSize: number;
  recordCount: number;
  status: BackupStatus;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export default function BackupHistoryTable() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    fetchBackups();
  }, [page]);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/backup?page=${page}&limit=25`);
      const data = await response.json();
      setBackups(data.backups);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (backupId: string) => {
    setVerifying(backupId);
    try {
      const response = await fetch('/api/backup/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupId }),
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert('Failed to verify backup');
    } finally {
      setVerifying(null);
    }
  };

  const handleRestore = async (backupId: string) => {
    const confirmed = confirm(
      '⚠️ WARNING: Restoring will replace current data. This action cannot be undone.\n\n' +
      'Are you sure you want to continue?'
    );

    if (!confirmed) return;

    const password = prompt('Enter admin password to confirm:');
    if (!password) return;

    setRestoring(backupId);
    try {
      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupId,
          userId: 'current-user-id', // Replace with actual user ID
          mode: 'full',
          adminPassword: password,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(
          `Restore completed successfully!\n\n` +
          `Items added: ${data.result.itemsAdded}\n` +
          `Items updated: ${data.result.itemsUpdated}\n` +
          `Items skipped: ${data.result.itemsSkipped}`
        );
        window.location.reload();
      } else {
        alert('Restore failed: ' + data.error);
      }
    } catch (error) {
      alert('Failed to restore backup');
    } finally {
      setRestoring(null);
    }
  };

  const handleDownload = (backup: Backup) => {
    // Implement download logic
    window.open(`/api/backup/download/${backup.id}`, '_blank');
  };

  const handleDelete = async (backupId: string) => {
    const confirmed = confirm('Are you sure you want to delete this backup?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/backup/${backupId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Backup deleted successfully');
        fetchBackups();
      }
    } catch (error) {
      alert('Failed to delete backup');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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

  const getStatusBadge = (status: BackupStatus) => {
    const styles = {
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      FAILED: 'bg-red-100 text-red-800 border-red-200',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    const icons = {
      COMPLETED: '✓',
      FAILED: '✗',
      IN_PROGRESS: '⏳',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
        <span>{icons[status]}</span>
        {status}
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
      <h2 className="text-xl font-semibold mb-4">Backup History</h2>

      {backups.length === 0 ? (
        <EmptyState
          icon={Database}
          title="No backups created yet"
          description="Create your first backup to protect your data. Backups can be scheduled automatically or created manually on demand."
          action={{
            label: 'Create First Backup',
            onClick: () => {
              // Trigger the create backup modal
              const createButton = document.querySelector('[data-create-backup]') as HTMLButtonElement;
              if (createButton) createButton.click();
            },
          }}
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date/Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                File Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Size
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Records
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Created By
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {backups.map((backup) => (
              <tr key={backup.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {formatDate(backup.createdAt)}
                </td>
                <td className="px-4 py-3 text-sm font-mono">
                  {backup.fileName}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {backup.fileType}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {formatBytes(backup.fileSize)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {backup.recordCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getStatusBadge(backup.status)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {backup.user.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(backup)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Download"
                    >
                      📥
                    </button>
                    <button
                      onClick={() => handleVerify(backup.id)}
                      disabled={verifying === backup.id}
                      className="text-green-600 hover:text-green-800 disabled:opacity-50"
                      title="Verify"
                    >
                      {verifying === backup.id ? '⏳' : '✓'}
                    </button>
                    <button
                      onClick={() => handleRestore(backup.id)}
                      disabled={restoring === backup.id || backup.status !== BackupStatus.COMPLETED}
                      className="text-orange-600 hover:text-orange-800 disabled:opacity-50"
                      title="Restore"
                    >
                      {restoring === backup.id ? '⏳' : '↻'}
                    </button>
                    <button
                      onClick={() => handleDelete(backup.id)}
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
      </>
      )}
    </div>
  );
}
