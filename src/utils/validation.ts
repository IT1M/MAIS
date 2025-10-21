import { z } from 'zod';

// User validation schemas
export const userSchema = z.object({
  email: z.string().email().transform(val => val.trim().toLowerCase()),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'DATA_ENTRY', 'SUPERVISOR', 'MANAGER', 'AUDITOR']),
  isActive: z.boolean().optional().default(true),
  preferences: z.record(z.string(), z.any()).optional(),
});

export const loginSchema = z.object({
  email: z.string().email().transform(val => val.trim().toLowerCase()),
  password: z.string().min(1, 'Password is required'),
});

// Inventory item validation schemas
export const inventoryItemSchema = z.object({
  itemName: z.string()
    .min(2, 'Item name must be at least 2 characters')
    .max(100, 'Item name must not exceed 100 characters')
    .transform(val => val.trim()),
  batch: z.string()
    .min(3, 'Batch number must be at least 3 characters')
    .max(50, 'Batch number must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Batch number must be alphanumeric')
    .transform(val => val.trim()),
  quantity: z.number()
    .int('Quantity must be an integer')
    .positive('Quantity must be positive')
    .max(1000000, 'Quantity cannot exceed 1,000,000'),
  reject: z.number()
    .int('Reject count must be an integer')
    .nonnegative('Reject count cannot be negative')
    .default(0),
  destination: z.enum(['MAIS', 'FOZAN']),
  category: z.string().max(100).optional(),
  notes: z.string().max(5000).optional(),
}).refine((data) => data.reject <= data.quantity, {
  message: 'Reject count cannot exceed quantity',
  path: ['reject'],
});

export const updateInventoryItemSchema = inventoryItemSchema.partial();

// Report validation schemas
export const reportSchema = z.object({
  title: z.string().min(3).max(200),
  type: z.enum(['MONTHLY', 'YEARLY', 'CUSTOM', 'AUDIT']),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
}).refine((data) => data.periodEnd > data.periodStart, {
  message: 'Period end must be after period start',
  path: ['periodEnd'],
});

// Backup validation schemas
export const backupSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.enum(['CSV', 'JSON', 'SQL']),
});

// System settings validation schemas
export const systemSettingsSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.record(z.string(), z.any()),
  category: z.string().min(1).max(50),
});

// Audit log validation schemas
export const auditLogSchema = z.object({
  action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT']),
  entityType: z.string().min(1).max(50),
  entityId: z.string().uuid().optional(),
  oldValue: z.record(z.string(), z.any()).optional(),
  newValue: z.record(z.string(), z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().max(500).optional(),
});

// Helper function to validate data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// Helper function to safely validate data
export function safeValidateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
