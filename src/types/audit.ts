import { AuditAction } from '@prisma/client';

export interface AuditLogEntry {
  id: string;
  timestamp: DateTime;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  action: AuditAction;
  entityType: string;
  entityId?: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface AuditFilters {
  dateRange?: {
    from: Date;
    to: Date;
  };
  userIds?: string[];
  actions?: AuditAction[];
  entityTypes?: string[];
  searchQuery?: string;
}

export interface AuditStatistics {
  totalActions: number;
  mostActiveUser: {
    id: string;
    name: string;
    actionCount: number;
  };
  mostCommonAction: AuditAction;
  criticalActionsCount: number;
  activityByDay: {
    date: string;
    count: number;
    byAction: Record<AuditAction, number>;
  }[];
}

export interface UserActivity {
  userId: string;
  userName: string;
  userRole: string;
  totalActions: number;
  actionBreakdown: Record<AuditAction, number>;
  lastActivity: Date;
}

export type AuditExportFormat = 'csv' | 'excel' | 'pdf';

export interface AuditExportOptions {
  format: AuditExportFormat;
  filters: AuditFilters;
  includeDetails: boolean;
  encrypted?: boolean;
  signedPdf?: boolean;
}
