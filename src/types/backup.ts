import { BackupFileType, BackupStatus } from '@prisma/client';

export interface BackupConfig {
  enableAutoBackup: boolean;
  backupTime: string; // HH:mm format
  backupFormats: BackupFileType[];
  includeAuditLogs: boolean;
  retentionPolicy: {
    dailyDays: number;
    weeklyWeeks: number;
    monthlyMonths: number;
  };
  storagePath: string;
  cloudStorage?: {
    enabled: boolean;
    provider: 'aws' | 'gcp' | 'azure';
    bucket: string;
  };
}

export interface BackupEntry {
  id: string;
  fileName: string;
  fileType: BackupFileType;
  fileSize: number;
  recordCount: number;
  status: BackupStatus;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
  };
  storagePath: string;
  checksum?: string;
  verified?: boolean;
}

export interface BackupCreateOptions {
  name?: string;
  includeData: {
    inventoryItems: boolean;
    auditLogs: boolean;
    userData: boolean;
    systemSettings: boolean;
  };
  formats: BackupFileType[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  notes?: string;
  encrypted?: boolean;
}

export interface BackupRestoreOptions {
  backupId: string;
  mode: 'full' | 'merge' | 'preview';
  createBackupBeforeRestore: boolean;
  adminPassword: string;
}

export interface BackupProgress {
  step: string;
  current: number;
  total: number;
  percentage: number;
  estimatedTimeRemaining?: number;
}

export interface BackupHealth {
  lastSuccessfulBackup?: Date;
  nextScheduledBackup?: Date;
  backupStreak: number;
  failedBackupsLast30Days: number;
  averageBackupDuration: number;
  totalStorageUsed: number;
  storageLimit: number;
  alerts: {
    type: 'warning' | 'error';
    message: string;
  }[];
}

export interface RestoreResult {
  success: boolean;
  itemsAdded: number;
  itemsUpdated: number;
  itemsSkipped: number;
  errors: string[];
  duration: number;
}
