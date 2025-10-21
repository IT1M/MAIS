import { prisma } from '@/db/client';
import { AuditAction } from '@prisma/client';

export interface CreateAuditLogParams {
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValue: params.oldValue || null,
        newValue: params.newValue || null,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main operation
  }
}

export async function logInventoryChange(
  userId: string,
  action: AuditAction,
  itemId: string,
  oldValue?: any,
  newValue?: any,
  ipAddress?: string,
  userAgent?: string
) {
  return createAuditLog({
    userId,
    action,
    entityType: 'InventoryItem',
    entityId: itemId,
    oldValue,
    newValue,
    ipAddress,
    userAgent,
  });
}

export async function logUserAction(
  userId: string,
  action: AuditAction,
  ipAddress?: string,
  userAgent?: string
) {
  return createAuditLog({
    userId,
    action,
    entityType: 'User',
    entityId: userId,
    ipAddress,
    userAgent,
  });
}
