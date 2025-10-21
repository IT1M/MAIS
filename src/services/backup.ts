import { prisma } from '@/db/client';
import { BackupFileType, BackupStatus } from '@prisma/client';
import { BackupCreateOptions, BackupProgress, BackupHealth, RestoreResult } from '@/types/backup';
import { createAuditLog } from './audit';
import * as fs from 'fs/promises';
import * as path from 'path';

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';

export async function createBackup(
  userId: string,
  options: BackupCreateOptions,
  onProgress?: (progress: BackupProgress) => void
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseName = options.name || `mais-inventory-backup-${timestamp}`;
  
  const backupIds: string[] = [];

  for (const format of options.formats) {
    const fileName = `${baseName}.${format.toLowerCase()}`;
    const storagePath = path.join(BACKUP_DIR, fileName);

    // Create backup record
    const backup = await prisma.backup.create({
      data: {
        fileName,
        fileType: format,
        fileSize: 0,
        recordCount: 0,
        storagePath,
        status: BackupStatus.IN_PROGRESS,
        createdBy: userId,
      },
    });

    backupIds.push(backup.id);

    try {
      let data: any = {};
      let recordCount = 0;

      // Fetch data based on options
      if (options.includeData.inventoryItems) {
        onProgress?.({
          step: 'Exporting inventory items...',
          current: 0,
          total: 100,
          percentage: 10,
        });

        const query: any = {};
        if (options.dateRange) {
          query.createdAt = {
            gte: options.dateRange.from,
            lte: options.dateRange.to,
          };
        }

        const items = await prisma.inventoryItem.findMany({
          where: query,
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        });

        data.inventoryItems = items;
        recordCount += items.length;
      }

      if (options.includeData.auditLogs) {
        onProgress?.({
          step: 'Exporting audit logs...',
          current: 30,
          total: 100,
          percentage: 30,
        });

        const logs = await prisma.auditLog.findMany({
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        });

        data.auditLogs = logs;
      }

      if (options.includeData.userData) {
        onProgress?.({
          step: 'Exporting user data...',
          current: 50,
          total: 100,
          percentage: 50,
        });

        const users = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        });

        data.users = users;
      }

      if (options.includeData.systemSettings) {
        onProgress?.({
          step: 'Exporting system settings...',
          current: 70,
          total: 100,
          percentage: 70,
        });

        const settings = await prisma.systemSettings.findMany();
        data.systemSettings = settings;
      }

      // Generate file based on format
      onProgress?.({
        step: `Creating ${format} file...`,
        current: 80,
        total: 100,
        percentage: 80,
      });

      await fs.mkdir(BACKUP_DIR, { recursive: true });

      let fileContent: string;
      let fileSize: number;

      switch (format) {
        case BackupFileType.JSON:
          fileContent = JSON.stringify(data, null, 2);
          await fs.writeFile(storagePath, fileContent, 'utf-8');
          fileSize = Buffer.byteLength(fileContent, 'utf-8');
          break;

        case BackupFileType.CSV:
          fileContent = convertToCSV(data.inventoryItems || []);
          await fs.writeFile(storagePath, fileContent, 'utf-8');
          fileSize = Buffer.byteLength(fileContent, 'utf-8');
          break;

        case BackupFileType.SQL:
          fileContent = generateSQLDump(data);
          await fs.writeFile(storagePath, fileContent, 'utf-8');
          fileSize = Buffer.byteLength(fileContent, 'utf-8');
          break;

        default:
          throw new Error(`Unsupported backup format: ${format}`);
      }

      // Update backup record
      await prisma.backup.update({
        where: { id: backup.id },
        data: {
          status: BackupStatus.COMPLETED,
          fileSize,
          recordCount,
        },
      });

      // Create audit log
      await createAuditLog({
        userId,
        action: 'EXPORT',
        entityType: 'Backup',
        entityId: backup.id,
        newValue: { fileName, fileType: format, recordCount },
      });

      onProgress?.({
        step: 'Backup completed!',
        current: 100,
        total: 100,
        percentage: 100,
      });
    } catch (error) {
      // Mark backup as failed
      await prisma.backup.update({
        where: { id: backup.id },
        data: { status: BackupStatus.FAILED },
      });

      throw error;
    }
  }

  return backupIds[0];
}

function convertToCSV(items: any[]): string {
  if (items.length === 0) return '';

  const headers = Object.keys(items[0]).filter(key => typeof items[0][key] !== 'object');
  const rows = items.map(item =>
    headers.map(header => {
      const value = item[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
      return value;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

function generateSQLDump(data: any): string {
  let sql = '-- MAIS Inventory Backup SQL Dump\n';
  sql += `-- Generated: ${new Date().toISOString()}\n\n`;

  if (data.inventoryItems) {
    sql += '-- Inventory Items\n';
    for (const item of data.inventoryItems) {
      sql += `INSERT INTO inventory_items (id, "itemName", batch, quantity, reject, destination, category, notes, "enteredBy", "createdAt", "updatedAt") VALUES `;
      sql += `('${item.id}', '${escapeSql(item.itemName)}', '${escapeSql(item.batch)}', ${item.quantity}, ${item.reject}, '${item.destination}', `;
      sql += `${item.category ? `'${escapeSql(item.category)}'` : 'NULL'}, ${item.notes ? `'${escapeSql(item.notes)}'` : 'NULL'}, `;
      sql += `'${item.enteredBy}', '${item.createdAt}', '${item.updatedAt}');\n`;
    }
  }

  return sql;
}

function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

export async function getBackupHealth(): Promise<BackupHealth> {
  const backups = await prisma.backup.findMany({
    where: { status: BackupStatus.COMPLETED },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const lastSuccessful = backups[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const failedBackups = await prisma.backup.count({
    where: {
      status: BackupStatus.FAILED,
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  const totalStorage = backups.reduce((sum, b) => sum + b.fileSize, 0);
  
  const alerts: { type: 'warning' | 'error'; message: string }[] = [];
  
  if (lastSuccessful && new Date().getTime() - lastSuccessful.createdAt.getTime() > 24 * 60 * 60 * 1000) {
    alerts.push({
      type: 'warning',
      message: 'Last backup was more than 24 hours ago',
    });
  }

  const storageLimit = 10 * 1024 * 1024 * 1024; // 10GB
  if (totalStorage > storageLimit * 0.8) {
    alerts.push({
      type: 'warning',
      message: 'Backup storage is over 80% full',
    });
  }

  return {
    lastSuccessfulBackup: lastSuccessful?.createdAt,
    backupStreak: calculateBackupStreak(backups),
    failedBackupsLast30Days: failedBackups,
    averageBackupDuration: 0, // Calculate from logs if needed
    totalStorageUsed: totalStorage,
    storageLimit,
    alerts,
  };
}

function calculateBackupStreak(backups: any[]): number {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    
    const hasBackup = backups.some(b => {
      const backupDate = new Date(b.createdAt);
      backupDate.setHours(0, 0, 0, 0);
      return backupDate.getTime() === checkDate.getTime();
    });

    if (hasBackup) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}

export async function restoreBackup(
  backupId: string,
  userId: string,
  mode: 'full' | 'merge' | 'preview'
): Promise<RestoreResult> {
  const backup = await prisma.backup.findUnique({
    where: { id: backupId },
  });

  if (!backup) {
    throw new Error('Backup not found');
  }

  const fileContent = await fs.readFile(backup.storagePath, 'utf-8');
  let data: any;

  switch (backup.fileType) {
    case BackupFileType.JSON:
      data = JSON.parse(fileContent);
      break;
    default:
      throw new Error(`Restore from ${backup.fileType} not yet implemented`);
  }

  if (mode === 'preview') {
    return {
      success: true,
      itemsAdded: data.inventoryItems?.length || 0,
      itemsUpdated: 0,
      itemsSkipped: 0,
      errors: [],
      duration: 0,
    };
  }

  const startTime = Date.now();
  let itemsAdded = 0;
  let itemsUpdated = 0;
  let itemsSkipped = 0;
  const errors: string[] = [];

  try {
    if (mode === 'full') {
      // Delete existing data
      await prisma.inventoryItem.deleteMany({});
    }

    // Restore inventory items
    if (data.inventoryItems) {
      for (const item of data.inventoryItems) {
        try {
          if (mode === 'merge') {
            const existing = await prisma.inventoryItem.findUnique({
              where: { id: item.id },
            });

            if (existing) {
              await prisma.inventoryItem.update({
                where: { id: item.id },
                data: item,
              });
              itemsUpdated++;
            } else {
              await prisma.inventoryItem.create({ data: item });
              itemsAdded++;
            }
          } else {
            await prisma.inventoryItem.create({ data: item });
            itemsAdded++;
          }
        } catch (error: any) {
          errors.push(`Failed to restore item ${item.id}: ${error.message}`);
          itemsSkipped++;
        }
      }
    }

    // Create audit log
    await createAuditLog({
      userId,
      action: 'UPDATE',
      entityType: 'System',
      newValue: {
        action: 'restore',
        backupId,
        mode,
        itemsAdded,
        itemsUpdated,
      },
    });

    return {
      success: true,
      itemsAdded,
      itemsUpdated,
      itemsSkipped,
      errors,
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      itemsAdded,
      itemsUpdated,
      itemsSkipped,
      errors: [...errors, error.message],
      duration: Date.now() - startTime,
    };
  }
}

export async function verifyBackup(backupId: string): Promise<boolean> {
  const backup = await prisma.backup.findUnique({
    where: { id: backupId },
  });

  if (!backup) return false;

  try {
    const fileContent = await fs.readFile(backup.storagePath, 'utf-8');
    
    switch (backup.fileType) {
      case BackupFileType.JSON:
        JSON.parse(fileContent);
        return true;
      case BackupFileType.CSV:
        return fileContent.length > 0;
      default:
        return true;
    }
  } catch {
    return false;
  }
}
