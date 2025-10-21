export const USER_ROLES = {
  ADMIN: 'ADMIN',
  DATA_ENTRY: 'DATA_ENTRY',
  SUPERVISOR: 'SUPERVISOR',
  MANAGER: 'MANAGER',
  AUDITOR: 'AUDITOR',
} as const;

export const INVENTORY_STATUS = {
  IN_STOCK: 'IN_STOCK',
  LOW_STOCK: 'LOW_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  INVENTORY: '/inventory',
  REPORTS: '/reports',
  USERS: '/users',
  SETTINGS: '/settings',
} as const;

export const PERMISSIONS = {
  [USER_ROLES.ADMIN]: ['read', 'write', 'delete', 'manage_users', 'view_reports'],
  [USER_ROLES.MANAGER]: ['read', 'write', 'view_reports'],
  [USER_ROLES.SUPERVISOR]: ['read', 'write', 'view_reports'],
  [USER_ROLES.DATA_ENTRY]: ['read', 'write'],
  [USER_ROLES.AUDITOR]: ['read', 'view_reports'],
} as const;
