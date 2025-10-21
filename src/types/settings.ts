import { UserRole } from './index';

export interface UserSettings {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  employeeId?: string;
  department?: string;
  phone?: string;
  workLocation?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecuritySession {
  id: string;
  deviceInfo: string;
  browser: string;
  ipAddress: string;
  location?: string;
  lastActive: Date;
  isCurrent: boolean;
}

export interface SecurityLog {
  id: string;
  action: string;
  timestamp: Date;
  ipAddress: string;
  success: boolean;
  details?: string;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  colorScheme: 'default' | 'blue' | 'green' | 'purple' | 'red';
  primaryColor?: string;
  accentColor?: string;
  uiDensity: 'compact' | 'comfortable' | 'spacious';
  fontSize: number;
  sidebarPosition: 'left' | 'right';
  sidebarCollapsed: boolean;
  showBreadcrumbs: boolean;
}

export interface NotificationSettings {
  email: {
    dailySummary: boolean;
    weeklyReport: boolean;
    newUserRegistration: boolean;
    highRejectAlert: boolean;
    systemUpdates: boolean;
    backupStatus: boolean;
  };
  inApp: {
    enabled: boolean;
    playSound: boolean;
    desktop: boolean;
  };
  frequency: 'realtime' | 'hourly' | 'daily' | 'custom';
}

export interface APIConfiguration {
  gemini: {
    apiKey: string;
    lastValidated?: Date;
    model: string;
    temperature: number;
    maxTokens: number;
    cacheDuration: number;
    features: {
      insights: boolean;
      predictive: boolean;
      nlq: boolean;
    };
  };
  database: {
    type: string;
    status: 'connected' | 'disconnected' | 'error';
    lastMigration?: Date;
    size?: string;
    backupStatus: 'ok' | 'warning' | 'error';
  };
}

export interface SystemPreferences {
  company: {
    name: string;
    logo?: string;
    fiscalYearStart: number;
    timezone: string;
  };
  inventory: {
    defaultDestination?: 'MAIS' | 'FOZAN';
    enableCategories: boolean;
    predefinedCategories: string[];
    autoGenerateBatch: boolean;
    batchPattern?: string;
    requireApproval: boolean;
    approvalThreshold?: number;
  };
  backup: {
    enabled: boolean;
    time: string;
    retentionDays: number;
    format: 'csv' | 'json' | 'both';
  };
  dataRetention: {
    auditLogDays: number;
    autoArchive: boolean;
    archiveAfterDays?: number;
  };
  limits: {
    maxItemsPerDay: number;
    maxUploadSizeMB: number;
    sessionTimeoutMinutes: number;
  };
  developer: {
    debugMode: boolean;
    apiRateLimit: number;
    logLevel: 'error' | 'warning' | 'info' | 'debug';
  };
}

export interface RolePermission {
  permission: string;
  admin: boolean;
  supervisor: boolean;
  manager: boolean;
  dataEntry: boolean;
  auditor: boolean;
}

export type SettingsSection = 
  | 'profile'
  | 'security'
  | 'users'
  | 'appearance'
  | 'notifications'
  | 'api'
  | 'system';
