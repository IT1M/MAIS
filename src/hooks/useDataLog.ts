'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { InventoryItemWithUser, FilterState } from '@/types/data-log';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100, 200];
const FILTER_STORAGE_KEY = 'data-log-filters';
const COLUMN_PREFS_KEY = 'data-log-columns';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export function useDataLog() {
  const [items, setItems] = useState<InventoryItemWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 50,
    total: 0,
  });
  
  const [filters, setFilters] = useState<FilterState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FILTER_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved filters', e);
        }
      }
    }
    return {
      search: '',
      startDate: '',
      endDate: '',
      destinations: [],
      categories: [],
      rejectFilter: 'all' as const,
      enteredBy: [],
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    };
  });

  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.startDate) params.append('startDate', new Date(filters.startDate).toISOString());
      if (filters.endDate) params.append('endDate', new Date(filters.endDate).toISOString());
      if (filters.destinations.length > 0) {
        filters.destinations.forEach(d => params.append('destination', d));
      }
      if (filters.categories.length > 0) {
        filters.categories.forEach(c => params.append('category', c));
      }

      const response = await fetch(`/api/inventory?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();
      
      let filteredItems = result.data.items;

      // Apply reject filter (client-side)
      if (filters.rejectFilter !== 'all') {
        filteredItems = filteredItems.filter((item: InventoryItemWithUser) => {
          const rejectPercent = item.quantity > 0 ? (item.reject / item.quantity) * 100 : 0;
          switch (filters.rejectFilter) {
            case 'no-rejects':
              return item.reject === 0;
            case 'has-rejects':
              return item.reject > 0;
            case 'high-rejects':
              return rejectPercent > 10;
            default:
              return true;
          }
        });
      }

      // Apply enteredBy filter (client-side)
      if (filters.enteredBy.length > 0) {
        filteredItems = filteredItems.filter((item: InventoryItemWithUser) =>
          filters.enteredBy.includes(item.enteredBy)
        );
      }

      setItems(filteredItems);
      setPagination(prev => ({
        ...prev,
        total: result.data.pagination.total,
      }));
      setLastRefresh(new Date());
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load data');
        toast.error('Failed to load inventory data');
      }
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save filters to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
    }
  }, [filters]);

  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      startDate: '',
      endDate: '',
      destinations: [],
      categories: [],
      rejectFilter: 'all',
      enteredBy: [],
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const changePage = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(item => item.id)));
    }
  }, [items, selectedIds.size]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      toast.success('Item deleted successfully');
      fetchData();
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Failed to delete item');
    }
  }, [fetchData]);

  const bulkDelete = useCallback(async (ids: string[]) => {
    try {
      const response = await fetch('/api/inventory/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete items');
      }

      toast.success(`${ids.length} items deleted successfully`);
      clearSelection();
      fetchData();
    } catch (err: any) {
      console.error('Bulk delete error:', err);
      toast.error(err.message || 'Failed to delete items');
    }
  }, [fetchData, clearSelection]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
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
    itemsPerPageOptions: ITEMS_PER_PAGE_OPTIONS,
  };
}
