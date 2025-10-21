/**
 * Database Helper Functions
 * Common database operations and utilities
 * 
 * NOTE: Run `npm run prisma:generate` first to generate Prisma Client types
 */

import { prisma } from './prisma';
import type { PaginationParams, PaginatedResponse } from '@/types/database';

// These types will be available after running `npm run prisma:generate`
type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT';
type InventoryItemCreateInput = any; // Will be properly typed after generation
type InventoryItemUpdateInput = any; // Will be properly typed after generation

// ============================================================================
// AUDIT LOGGING
// ============================================================================

export async function createAuditLog(params: {
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  return await prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValue: params.oldValue ? JSON.parse(JSON.stringify(params.oldValue)) : null,
      newValue: params.newValue ? JSON.parse(JSON.stringify(params.newValue)) : null,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });
}

// ============================================================================
// PAGINATION
// ============================================================================

export async function paginate<T>(
  model: any,
  params: PaginationParams & { where?: any; include?: any }
): Promise<PaginatedResponse<T>> {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      where: params.where,
      include: params.include,
      skip,
      take: limit,
      orderBy: params.sortBy
        ? { [params.sortBy]: params.sortOrder || 'desc' }
        : { createdAt: 'desc' },
    }),
    model.count({ where: params.where }),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ============================================================================
// INVENTORY OPERATIONS
// ============================================================================

export async function createInventoryItemWithAudit(
  data: InventoryItemCreateInput,
  userId: string,
  ipAddress?: string,
  userAgent?: string
) {
  return await prisma.$transaction(async (tx: any) => {
    const item = await tx.inventoryItem.create({ data });

    await tx.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        entityType: 'InventoryItem',
        entityId: item.id,
        newValue: item,
        ipAddress,
        userAgent,
      },
    });

    return item;
  });
}

export async function updateInventoryItemWithAudit(
  id: string,
  data: InventoryItemUpdateInput,
  userId: string,
  ipAddress?: string,
  userAgent?: string
) {
  return await prisma.$transaction(async (tx: any) => {
    const oldItem = await tx.inventoryItem.findUnique({ where: { id } });
    const newItem = await tx.inventoryItem.update({ where: { id }, data });

    await tx.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        entityType: 'InventoryItem',
        entityId: id,
        oldValue: oldItem,
        newValue: newItem,
        ipAddress,
        userAgent,
      },
    });

    return newItem;
  });
}

export async function deleteInventoryItemWithAudit(
  id: string,
  userId: string,
  ipAddress?: string,
  userAgent?: string
) {
  return await prisma.$transaction(async (tx: any) => {
    const item = await tx.inventoryItem.findUnique({ where: { id } });
    await tx.inventoryItem.delete({ where: { id } });

    await tx.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        entityType: 'InventoryItem',
        entityId: id,
        oldValue: item,
        ipAddress,
        userAgent,
      },
    });

    return item;
  });
}

// ============================================================================
// SEARCH & FILTER
// ============================================================================

export async function searchInventoryItems(searchTerm: string, limit = 20) {
  return await prisma.inventoryItem.findMany({
    where: {
      OR: [
        { itemName: { contains: searchTerm, mode: 'insensitive' } },
        { batch: { contains: searchTerm, mode: 'insensitive' } },
        { category: { contains: searchTerm, mode: 'insensitive' } },
        { notes: { contains: searchTerm, mode: 'insensitive' } },
      ],
    },
    include: { user: true },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getInventoryByDestination(destination: 'MAIS' | 'FOZAN') {
  return await prisma.inventoryItem.findMany({
    where: { destination },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getInventoryByDateRange(startDate: Date, endDate: Date) {
  return await prisma.inventoryItem.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================================================
// STATISTICS & AGGREGATIONS
// ============================================================================

export async function getInventoryStats() {
  const [totalItems, totalQuantity, totalRejects, byDestination] = await Promise.all([
    prisma.inventoryItem.count(),
    prisma.inventoryItem.aggregate({
      _sum: { quantity: true, reject: true },
    }),
    prisma.inventoryItem.groupBy({
      by: ['destination'],
      _sum: { quantity: true, reject: true },
      _count: true,
    }),
    prisma.inventoryItem.groupBy({
      by: ['destination'],
      _count: true,
    }),
  ]);

  return {
    totalItems,
    totalQuantity: totalQuantity._sum.quantity || 0,
    totalRejects: totalQuantity._sum.reject || 0,
    byDestination: byDestination.reduce((acc: Record<string, any>, item: any) => {
      acc[item.destination] = {
        count: item._count,
        quantity: item._sum.quantity || 0,
        rejects: item._sum.reject || 0,
      };
      return acc;
    }, {} as Record<string, any>),
  };
}

export async function getLowStockItems(threshold = 100) {
  return await prisma.inventoryItem.findMany({
    where: {
      quantity: { lte: threshold },
    },
    include: { user: true },
    orderBy: { quantity: 'asc' },
  });
}

export async function getHighRejectRateItems(minRejectRate = 0.05) {
  const items = await prisma.inventoryItem.findMany({
    where: {
      quantity: { gt: 0 },
    },
  });

  return items.filter((item: any) => {
    const rejectRate = item.reject / item.quantity;
    return rejectRate >= minRejectRate;
  });
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

export async function getUserWithStats(userId: string) {
  const [user, itemsCreated, reportsGenerated, auditLogs] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.inventoryItem.count({ where: { enteredBy: userId } }),
    prisma.report.count({ where: { generatedBy: userId } }),
    prisma.auditLog.count({ where: { userId } }),
  ]);

  return {
    ...user,
    stats: {
      itemsCreated,
      reportsGenerated,
      auditLogs,
    },
  };
}

export async function getActiveUsers() {
  return await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

export async function generateMonthlyReport(userId: string, month: Date) {
  const periodStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const periodEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);

  const items = await prisma.inventoryItem.findMany({
    where: {
      createdAt: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
  });

  const dataSnapshot = {
    totalItems: items.length,
    totalQuantity: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    totalRejects: items.reduce((sum: number, item: any) => sum + item.reject, 0),
    byDestination: {
      MAIS: items.filter((i: any) => i.destination === 'MAIS').length,
      FOZAN: items.filter((i: any) => i.destination === 'FOZAN').length,
    },
    byCategory: items.reduce((acc: Record<string, number>, item: any) => {
      const cat = item.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return await prisma.report.create({
    data: {
      title: `Monthly Report - ${month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      type: 'MONTHLY',
      periodStart,
      periodEnd,
      generatedBy: userId,
      dataSnapshot,
      status: 'COMPLETED',
    },
  });
}

// ============================================================================
// BACKUP OPERATIONS
// ============================================================================

export async function createBackupRecord(
  userId: string,
  fileName: string,
  fileType: 'CSV' | 'JSON' | 'SQL',
  recordCount: number,
  fileSize: number,
  storagePath: string
) {
  return await prisma.backup.create({
    data: {
      fileName,
      fileType,
      recordCount,
      fileSize,
      storagePath,
      status: 'COMPLETED',
      createdBy: userId,
    },
  });
}

// ============================================================================
// SYSTEM SETTINGS
// ============================================================================

export async function getSetting(key: string) {
  const setting = await prisma.systemSettings.findUnique({
    where: { key },
  });
  return setting?.value;
}

export async function updateSetting(key: string, value: any, userId: string) {
  return await prisma.systemSettings.upsert({
    where: { key },
    update: {
      value,
      updatedBy: userId,
    },
    create: {
      key,
      value,
      category: 'general',
      updatedBy: userId,
    },
  });
}

// ============================================================================
// CLEANUP UTILITIES
// ============================================================================

export async function cleanupOldAuditLogs(daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.auditLog.deleteMany({
    where: {
      timestamp: {
        lt: cutoffDate,
      },
    },
  });

  return result.count;
}

export async function archiveOldReports(daysToKeep = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  return await prisma.report.findMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
      status: 'COMPLETED',
    },
  });
}
