import { Prisma } from '@prisma/client';

// User types
export type User = Prisma.UserGetPayload<{}>;
export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    inventoryItems: true;
    auditLogs: true;
    reports: true;
    backups: true;
  };
}>;
export type CreateUserInput = Prisma.UserCreateInput;
export type UpdateUserInput = Prisma.UserUpdateInput;

// InventoryItem types
export type InventoryItem = Prisma.InventoryItemGetPayload<{}>;
export type InventoryItemWithUser = Prisma.InventoryItemGetPayload<{
  include: { user: true };
}>;
export type CreateInventoryItemInput = Prisma.InventoryItemCreateInput;
export type UpdateInventoryItemInput = Prisma.InventoryItemUpdateInput;

// AuditLog types
export type AuditLog = Prisma.AuditLogGetPayload<{}>;
export type AuditLogWithRelations = Prisma.AuditLogGetPayload<{
  include: {
    user: true;
    inventoryItem: true;
  };
}>;
export type CreateAuditLogInput = Prisma.AuditLogCreateInput;

// Report types
export type Report = Prisma.ReportGetPayload<{}>;
export type ReportWithUser = Prisma.ReportGetPayload<{
  include: { user: true };
}>;
export type CreateReportInput = Prisma.ReportCreateInput;
export type UpdateReportInput = Prisma.ReportUpdateInput;

// Backup types
export type Backup = Prisma.BackupGetPayload<{}>;
export type BackupWithUser = Prisma.BackupGetPayload<{
  include: { user: true };
}>;
export type CreateBackupInput = Prisma.BackupCreateInput;

// SystemSettings types
export type SystemSettings = Prisma.SystemSettingsGetPayload<{}>;
export type SystemSettingsWithUser = Prisma.SystemSettingsGetPayload<{
  include: { user: true };
}>;
export type CreateSystemSettingsInput = Prisma.SystemSettingsCreateInput;
export type UpdateSystemSettingsInput = Prisma.SystemSettingsUpdateInput;

// Enum exports for convenience
export { UserRole, Destination, AuditAction, ReportType, ReportStatus, BackupFileType, BackupStatus } from '@prisma/client';

// Query filter types
export type InventoryItemFilters = {
  itemName?: string;
  batch?: string;
  destination?: 'MAIS' | 'FOZAN';
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
};

export type AuditLogFilters = {
  userId?: string;
  action?: string;
  entityType?: string;
  dateFrom?: Date;
  dateTo?: Date;
};

export type ReportFilters = {
  type?: 'MONTHLY' | 'YEARLY' | 'CUSTOM' | 'AUDIT';
  status?: 'GENERATING' | 'COMPLETED' | 'FAILED';
  dateFrom?: Date;
  dateTo?: Date;
};

// Pagination types
export type PaginationParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
