'use client';

import { useState, useEffect } from 'react';
import { InventoryItemWithUser } from '@/types/data-log';
import toast from 'react-hot-toast';

interface EditInventoryModalProps {
  item: InventoryItemWithUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditInventoryModal({ item, isOpen, onClose, onSuccess }: EditInventoryModalProps) {
  const [formData, setFormData] = useState({
    itemName: '',
    batch: '',
    quantity: 0,
    reject: 0,
    destination: 'MAIS' as 'MAIS' | 'FOZAN',
    category: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        itemName: item.itemName,
        batch: item.batch,
        quantity: item.quantity,
        reject: item.reject,
        destination: item.destination,
        category: item.category || '',
        notes: item.notes || '',
      });
      setIsDirty(false);
    }
  }, [item]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/inventory/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update item');
      }

      toast.success('Item updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen || !item) return null;

  const rejectPercent = formData.quantity > 0 ? (formData.reject / formData.quantity) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Edit Inventory Item
              </h3>
            </div>

            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) => handleChange('itemName', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    value={formData.batch}
                    onChange={(e) => handleChange('batch', e.target.value.toUpperCase())}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reject
                  </label>
                  <input
                    type="number"
                    value={formData.reject}
                    onChange={(e) => handleChange('reject', parseInt(e.target.value) || 0)}
                    min="0"
                    max={formData.quantity}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {formData.quantity > 0 && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Reject Percentage: <span className={`font-semibold ${rejectPercent > 10 ? 'text-red-600' : rejectPercent > 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {rejectPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Destination *
                  </label>
                  <select
                    value={formData.destination}
                    onChange={(e) => handleChange('destination', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="MAIS">MAIS</option>
                    <option value="FOZAN">FOZAN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.notes.length}/500 characters
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <div>Created by: {item.user.name}</div>
                  <div>Created at: {new Date(item.createdAt).toLocaleString()}</div>
                  <div>Last updated: {new Date(item.updatedAt).toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
