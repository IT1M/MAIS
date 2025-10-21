'use client';

import { useState } from 'react';
import { InventoryItemWithUser } from '@/types/data-log';

interface DeleteConfirmDialogProps {
  item: InventoryItemWithUser | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({ item, isOpen, onClose, onConfirm }: DeleteConfirmDialogProps) {
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen || !item) return null;

  const handleConfirm = () => {
    if (confirmed) {
      onConfirm();
      setConfirmed(false);
    }
  };

  const handleClose = () => {
    setConfirmed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-6 py-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Delete Inventory Item
                </h3>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <p className="mb-3">
                    Are you sure you want to delete this item? This action cannot be undone.
                  </p>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-1">
                    <div><span className="font-medium">Item:</span> {item.itemName}</div>
                    <div><span className="font-medium">Batch:</span> {item.batch}</div>
                    <div><span className="font-medium">Quantity:</span> {item.quantity}</div>
                    <div><span className="font-medium">Destination:</span> {item.destination}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      I understand this action cannot be undone
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!confirmed}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
