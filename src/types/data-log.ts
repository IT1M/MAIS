export interface InventoryItemWithUser {
  id: string;
  itemName: string;
  batch: string;
  quantity: number;
  reject: number;
  destination: 'MAIS' | 'FOZAN';
  category: string | null;
  notes: string | null;
  enteredBy: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface FilterState {
  search: string;
  startDate: string;
  endDate: string;
  destinations: string[];
  categories: string[];
  rejectFilter: 'all' | 'no-rejects' | 'has-rejects' | 'high-rejects';
  enteredBy: string[];
  sortBy: 'createdAt' | 'itemName' | 'quantity' | 'batch';
  sortOrder: 'asc' | 'desc';
}

export interface DatePreset {
  label: string;
  getValue: () => { start: Date; end: Date };
}

export interface ExportFormat {
  type: 'csv' | 'excel' | 'pdf' | 'json';
  label: string;
  icon: string;
}

export interface ColumnConfig {
  key: string;
  label: string;
  sortable: boolean;
  visible: boolean;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export interface BulkAction {
  id: string;
  label: string;
  icon: string;
  requiresRole?: string[];
  action: (ids: string[]) => Promise<void>;
}
