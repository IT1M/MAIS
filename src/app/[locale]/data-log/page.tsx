'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useDataLog } from '@/hooks/useDataLog';
import { InventoryFilters } from '@/components/filters/InventoryFilters';
import { InventoryTable } from '@/components/tables/InventoryTable';
import { Pagination } from '@/components/ui/Pagination';
import { ExportButton } from '@/components/export/ExportButton';
import { EditInventoryModal } from '@/components/modals/EditInventoryModal';
import { DeleteConfirmDialog } from '@/components/modals/DeleteConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { InventoryItemWithUser } from '@/types/data-log';
import { PackageOpen, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DataLogPage() {
  const {
    items,
    loading,
    error,
    filters,
    pagination,
    selectedIds,
    lastRefresh,
    updateFilters,
    resetFilters,
    changePage,
    changeLimit,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    deleteItem,
    bulkDelete,
    refresh,
    itemsPerPageOptions,
  } = useDataLog();

  const [editingItem, setEditingItem] = useState<InventoryItemWithUser | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItemWithUser | null>(null);
  const [userRole, setUserRole] = useState<string>('DATA_ENTRY');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch user session
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserRole(data.user.role);
        }
      })
      .catch(console.error);
  }, []);

  // Fetch available categories and users
  useEffect(() => {
    // Get unique categories from items
    const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean))) as string[];
    setAvailableCategories(categories);

    // Get unique users
    const users = Array.from(
      new Map(items.map(item => [item.user.id, { id: item.user.id, name: item.user.name }])).values()
    );
    setAvailableUsers(users);
  }, [items]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refresh();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refresh]);

  const handleEdit = (item: InventoryItemWithUser) => {
    setEditingItem(item);
  };

  const handleDelete = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setDeletingItem(item);
    }
  };

  const handleDuplicate = (item: InventoryItemWithUser) => {
    // Navigate to data entry with pre-filled data
    const data = {
      itemName: item.itemName,
      batch: item.batch + '-COPY',
      quantity: item.quantity,
      reject: item.reject,
      destination: item.destination,
      category: item.category,
      notes: item.notes,
    };
    localStorage.setItem('inventory-draft', JSON.stringify(data));
    window.location.href = '/data-entry';
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedIds.size} items?`)) {
      await bulkDelete(Array.from(selectedIds));
    }
  };

  const handleBulkExport = () => {
    // Export is handled by ExportButton component
  };

  const timeSinceRefresh = Math.floor((Date.now() - lastRefresh.getTime()) / 1000);
  const refreshText = timeSinceRefresh < 60
    ? `${timeSinceRefresh}s ago`
    : `${Math.floor(timeSinceRefresh / 60)}m ago`;

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <MainLayout>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Inventory Data Log
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                View and manage all inventory entries
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Updated {refreshText}
              </div>
              <button
                onClick={refresh}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
                title="Refresh data"
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Auto-refresh
              </label>
              <ExportButton items={items} selectedIds={selectedIds} filters={filters} />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  {selectedIds.size} items selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center gap-2">
                {(userRole === 'ADMIN' || userRole === 'SUPERVISOR') && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Delete Selected
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <InventoryFilters
              filters={filters}
              onFiltersChange={updateFilters}
              onReset={resetFilters}
              availableCategories={availableCategories}
              availableUsers={availableUsers}
              userRole={userRole}
            />
          </div>

          {/* Table */}
          <div className="lg:col-span-3 space-y-4">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-red-900 dark:text-red-200">
                      {error}
                    </span>
                  </div>
                  <button
                    onClick={refresh}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {!loading && items.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <EmptyState
                  icon={PackageOpen}
                  title="No inventory items yet"
                  description="Get started by adding your first inventory item. You can track quantities, batches, and destinations all in one place."
                  action={{
                    label: 'Add Your First Item',
                    onClick: () => window.location.href = '/data-entry',
                  }}
                />
              </div>
            ) : (
              <>
                <InventoryTable
                  items={items}
                  loading={loading}
                  selectedIds={selectedIds}
                  onToggleSelection={toggleSelection}
                  onToggleSelectAll={toggleSelectAll}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  userRole={userRole}
                />

                {!loading && items.length > 0 && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={totalPages}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                    onPageChange={changePage}
                    onItemsPerPageChange={changeLimit}
                    itemsPerPageOptions={itemsPerPageOptions}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditInventoryModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSuccess={refresh}
      />

      <DeleteConfirmDialog
        item={deletingItem}
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => {
          if (deletingItem) {
            deleteItem(deletingItem.id);
            setDeletingItem(null);
          }
        }}
      />
    </MainLayout>
  );
}
