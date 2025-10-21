import { z } from 'zod';
import { UserRole, Destination, ReportType, BackupFileType } from '@prisma/client';

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(UserRole).optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// Inventory validation schemas
export const createInventorySchema = z.object({
  itemName: z.string()
    .min(2, 'Item name must be at least 2 characters')
    .max(100, 'Item name must not exceed 100 characters')
    .transform(val => val.trim()),
  batch: z.string()
    .min(3, 'Batch must be at least 3 characters')
    .max(50, 'Batch must not exceed 50 characters')
    .regex(/^[A-Z0-9]+$/, 'Batch must contain only uppercase letters and numbers')
    .transform(val => val.toUpperCase()),
  quantity: z.number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(1000000, 'Quantity must not exceed 1,000,000'),
  reject: z.number()
    .int('Reject quantity must be a whole number')
    .min(0, 'Reject quantity cannot be negative')
    .default(0),
  destination: z.nativeEnum(Destination, {
    errorMap: () => ({ message: 'Please select a valid destination' })
  }),
  category: z.string()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must not exceed 50 characters')
    .transform(val => val.trim())
    .optional(),
  notes: z.string()
    .max(500, 'Notes must not exceed 500 characters')
    .transform(val => val.trim())
    .optional(),
}).refine(data => data.reject <= data.quantity, {
  message: 'Reject quantity cannot exceed total quantity',
  path: ['reject'],
});

export const updateInventorySchema = z.object({
  itemName: z.string().min(1).optional(),
  batch: z.string().min(1).optional(),
  quantity: z.number().int().positive().optional(),
  reject: z.number().int().min(0).optional(),
  destination: z.nativeEnum(Destination).optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
});

export const inventoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
  search: z.string().optional(),
  destination: z.nativeEnum(Destination).optional(),
  category: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Report validation schemas
export const generateReportSchema = z.object({
  type: z.nativeEnum(ReportType),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  includeCharts: z.boolean().default(false),
  includeAiInsights: z.boolean().default(false),
  title: z.string().optional(),
});

// Backup validation schemas
export const createBackupSchema = z.object({
  fileType: z.nativeEnum(BackupFileType),
  includeAudit: z.boolean().default(false),
});

// Analytics validation schemas
export const analyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
});

export const aiInsightsSchema = z.object({
  dataType: z.enum(['inventory', 'trends', 'comparison']),
  period: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  }),
});

// Settings validation schemas
export const updateSettingsSchema = z.record(z.string(), z.any());

// Batch import validation
export const batchImportRowSchema = z.object({
  itemName: z.string().min(1),
  batch: z.string().min(1),
  quantity: z.number().int().positive(),
  reject: z.number().int().min(0).default(0),
  destination: z.enum(['MAIS', 'FOZAN']),
  category: z.string().optional(),
  notes: z.string().optional(),
});
