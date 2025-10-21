'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useDataEntryForm } from '@/hooks/useDataEntryForm';
import toast from 'react-hot-toast';

enum Destination {
  MAIS = 'MAIS',
  FOZAN = 'FOZAN',
}

interface DataEntryFormProps {
  onSuccess?: () => void;
}

export function DataEntryForm({ onSuccess }: DataEntryFormProps) {
  const {
    formData,
    errors,
    isSubmitting,
    isDirty,
    lastSaved,
    recentItems,
    existingBatches,
    updateField,
    validateField,
    handleSubmit,
    clearForm,
    rejectPercentage,
    rejectStatus,
  } = useDataEntryForm();

  const itemNameRef = useRef<HTMLInputElement>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredItems, setFilteredItems] = useState<string[]>([]);
  const [showBatchWarning, setShowBatchWarning] = useState(false);

  useEffect(() => {
    itemNameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (formData.itemName.length >= 2) {
      const filtered = recentItems
        .filter(item => 
          item.toLowerCase().includes(formData.itemName.toLowerCase())
        )
        .slice(0, 5);
      setFilteredItems(filtered);
      setShowAutocomplete(filtered.length > 0);
    } else {
      setShowAutocomplete(false);
    }
  }, [formData.itemName, recentItems]);

  useEffect(() => {
    if (formData.batch.length >= 3) {
      const exists = existingBatches.includes(formData.batch.toUpperCase());
      setShowBatchWarning(exists);
    } else {
      setShowBatchWarning(false);
    }
  }, [formData.batch, existingBatches]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isDirty && !confirm('Clear form? Unsaved changes will be lost.')) {
          return;
        }
        clearForm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit, clearForm, isDirty]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleSubmit();
    if (success) {
      toast.success('Item added successfully!', {
        duration: 4000,
        icon: '✓',
      });
      onSuccess?.();
      itemNameRef.current?.focus();
    }
  };

  const handleClear = () => {
    if (isDirty && !confirm('Clear form? Unsaved changes will be lost.')) {
      return;
    }
    clearForm();
    itemNameRef.current?.focus();
  };

  const characterCount = formData.itemName.length;
  const maxItemNameLength = 100;
  const notesCount = formData.notes?.length || 0;
  const maxNotesLength = 500;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="relative">
        <label htmlFor="itemName" className="block text-sm font-medium mb-2">
          Item Name <span className="text-red-500">*</span>
        </label>
        <Input
          ref={itemNameRef}
          id="itemName"
          name="itemName"
          type="text"
          value={formData.itemName}
          onChange={(e) => updateField('itemName', e.target.value)}
          onBlur={() => validateField('itemName')}
          className={errors.itemName ? 'border-red-500' : ''}
          placeholder="Enter item name"
          maxLength={maxItemNameLength}
          aria-invalid={!!errors.itemName}
          aria-describedby={errors.itemName ? 'itemName-error' : undefined}
        />
        <div className="flex justify-between mt-1">
          <div>
            {errors.itemName && (
              <p id="itemName-error" className="text-sm text-red-500" role="alert">
                {errors.itemName}
              </p>
            )}
          </div>
          <span className={`text-xs ${characterCount > maxItemNameLength - 10 ? 'text-yellow-600' : 'text-gray-500'}`}>
            {characterCount}/{maxItemNameLength}
          </span>
        </div>
        
        {showAutocomplete && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-auto">
            {filteredItems.map((item, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none"
                onClick={() => {
                  updateField('itemName', item);
                  setShowAutocomplete(false);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="batch" className="block text-sm font-medium mb-2">
          Batch Number <span className="text-red-500">*</span>
        </label>
        <Input
          id="batch"
          name="batch"
          type="text"
          value={formData.batch}
          onChange={(e) => updateField('batch', e.target.value.toUpperCase())}
          onBlur={() => validateField('batch')}
          className={errors.batch ? 'border-red-500' : ''}
          placeholder="Enter batch number"
          maxLength={50}
          aria-invalid={!!errors.batch}
          aria-describedby={errors.batch ? 'batch-error' : showBatchWarning ? 'batch-warning' : undefined}
        />
        {errors.batch && (
          <p id="batch-error" className="text-sm text-red-500 mt-1" role="alert">
            {errors.batch}
          </p>
        )}
        {showBatchWarning && !errors.batch && (
          <p id="batch-warning" className="text-sm text-yellow-600 mt-1 flex items-center gap-1" role="alert">
            <span>⚠️</span> This batch number already exists
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium mb-2">
            Quantity <span className="text-red-500">*</span>
          </label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            value={formData.quantity || ''}
            onChange={(e) => updateField('quantity', parseInt(e.target.value) || 0)}
            onBlur={() => validateField('quantity')}
            className={`text-2xl font-bold ${errors.quantity ? 'border-red-500' : ''}`}
            placeholder="0"
            min={1}
            max={1000000}
            aria-invalid={!!errors.quantity}
            aria-describedby={errors.quantity ? 'quantity-error' : undefined}
          />
          {errors.quantity && (
            <p id="quantity-error" className="text-sm text-red-500 mt-1" role="alert">
              {errors.quantity}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reject" className="block text-sm font-medium mb-2">
            Reject Quantity
          </label>
          <Input
            id="reject"
            name="reject"
            type="number"
            value={formData.reject || 0}
            onChange={(e) => updateField('reject', parseInt(e.target.value) || 0)}
            onBlur={() => validateField('reject')}
            className={`text-2xl font-bold ${errors.reject ? 'border-red-500' : ''}`}
            placeholder="0"
            min={0}
            max={formData.quantity || 0}
            aria-invalid={!!errors.reject}
            aria-describedby={errors.reject ? 'reject-error' : 'reject-percentage'}
          />
          {errors.reject && (
            <p id="reject-error" className="text-sm text-red-500 mt-1" role="alert">
              {errors.reject}
            </p>
          )}
          {!errors.reject && formData.quantity > 0 && (
            <div id="reject-percentage" className="mt-2 flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                rejectStatus === 'good' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                rejectStatus === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {rejectPercentage.toFixed(1)}% reject rate
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Destination <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => updateField('destination', Destination.MAIS)}
            className={`min-h-[44px] px-6 py-3 rounded-lg border-2 font-medium transition-all ${
              formData.destination === Destination.MAIS
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            aria-pressed={formData.destination === Destination.MAIS}
          >
            Mais
          </button>
          <button
            type="button"
            onClick={() => updateField('destination', Destination.FOZAN)}
            className={`min-h-[44px] px-6 py-3 rounded-lg border-2 font-medium transition-all ${
              formData.destination === Destination.FOZAN
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            aria-pressed={formData.destination === Destination.FOZAN}
          >
            Fozan
          </button>
        </div>
        {errors.destination && (
          <p className="text-sm text-red-500 mt-1" role="alert">
            {errors.destination}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-2">
          Category <span className="text-gray-500 text-xs">(Optional)</span>
        </label>
        <Input
          id="category"
          name="category"
          type="text"
          value={formData.category || ''}
          onChange={(e) => updateField('category', e.target.value)}
          placeholder="e.g., Surgical Supplies, Pharmaceuticals, Equipment"
          maxLength={50}
        />
        <p className="text-xs text-gray-500 mt-1">
          Help categorize this item for better organization
        </p>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-2">
          Notes <span className="text-gray-500 text-xs">(Optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
          placeholder="Add any additional notes or comments"
          maxLength={maxNotesLength}
          rows={4}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">
            Additional information about this item
          </span>
          <span className={`text-xs ${notesCount > maxNotesLength - 50 ? 'text-yellow-600' : 'text-gray-500'}`}>
            {notesCount}/{maxNotesLength}
          </span>
        </div>
      </div>

      {lastSaved && (
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
          Draft saved {lastSaved}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting || Object.keys(errors).length > 0}
          className="flex-1 min-h-[44px]"
        >
          {isSubmitting ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              Saving...
            </>
          ) : (
            '💾 Save Entry'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleClear}
          disabled={isSubmitting}
          className="min-h-[44px]"
        >
          Clear Form
        </Button>
      </div>

      <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
        <p className="font-medium">Keyboard Shortcuts:</p>
        <ul className="space-y-0.5 pl-4">
          <li>• Ctrl/Cmd + S or Ctrl/Cmd + Enter: Save entry</li>
          <li>• Esc: Clear form</li>
          <li>• Tab: Navigate between fields</li>
        </ul>
      </div>
    </form>
  );
}
