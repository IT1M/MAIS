export type UserRole = 'ADMIN' | 'DATA_ENTRY' | 'SUPERVISOR' | 'MANAGER' | 'AUDITOR';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  price: number;
  category: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface AIInsight {
  type: 'trend' | 'prediction' | 'recommendation';
  content: string;
  timestamp: Date;
}
