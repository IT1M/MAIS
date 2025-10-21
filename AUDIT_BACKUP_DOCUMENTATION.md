# Audit Trail & Backup System Documentation

## Overview

This document provides comprehensive documentation for the audit trail and backup system implemented in the MAIS Inventory Management System.

## Table of Contents

1. [Audit Trail System](#audit-trail-system)
2. [Backup Management](#backup-management)
3. [Report Generation](#report-generation)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Security & Compliance](#security--compliance)

---

## Audit Trail System

### Features

#### 1. Audit Log Table (`/[locale]/audit`)
- **Real-time tracking** of all system activities
- **Comprehensive logging** of CREATE, UPDATE, DELETE, LOGIN, LOGOUT, and EXPORT actions
- **User attribution** with avatar, name, and role
- **Detailed change tracking** with old value → new value comparison
- **IP address and user agent** logging for security
- **Advanced filtering** by date range, users, actions, and entity types
- **Expandable rows** to view detailed changes
- **Column customization** to show/hide optional fields

#### 2. Audit Statistics Dashboard
- **Total actions** in selected period
- **Most active user** with action count
- **Most common action** type
- **Critical actions count** (deletes, role changes)
- **Activity chart** showing actions over time by type
- **Visual timeline** with color-coded action types

#### 3. Audit Filters
- **Date range presets**: Today, Yesterday, Last 7 days, Last 30 days, Custom
- **User filter**: Multi-select dropdown
- **Action type filter**: Checkboxes with Select All/Deselect All
- **Entity type filter**: Multi-select for different entity types
- **Global search**: Search across entity IDs, IPs, and changes
- **Apply/Reset** functionality

### Components

```
src/components/audit/
├── AuditLogTable.tsx       # Main audit log table with pagination
├── AuditFilters.tsx        # Filter sidebar component
└── AuditStatistics.tsx     # Statistics dashboard
```

### Usage Example

```typescript
import AuditLogTable from '@/components/audit/AuditLogTable';

<AuditLogTable 
  filters={{
    userIds: ['user-id-1', 'user-id-2'],
    actions: ['CREATE', 'UPDATE'],
    dateRange: { from: new Date('2025-01-01'), to: new Date() }
  }}
/>
```

### Creating Audit Logs

```typescript
import { createAuditLog } from '@/services/audit';

await createAuditLog({
  userId: 'user-id',
  action: 'UPDATE',
  entityType: 'InventoryItem',
  entityId: 'item-id',
  oldValue: { quantity: 100 },
  newValue: { quantity: 150 },
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
});
```

---

## Backup Management

### Features

#### 1. Automatic Backup Configuration
- **Enable/disable** automatic daily backups
- **Scheduled time** selection (default: 2:00 AM)
- **Multiple formats**: CSV, JSON, SQL
- **Include audit logs** option
- **Retention policy**:
  - Daily backups: Keep for X days (default: 30)
  - Weekly backups: Keep for X weeks (default: 12)
  - Monthly backups: Keep for X months (default: 12)

#### 2. Manual Backup Creation
- **Custom backup name** (auto-generated, editable)
- **Selective data inclusion**:
  - ☑ Inventory items (always included)
  - ☐ Audit logs
  - ☐ User data
  - ☐ System settings
- **Multiple format selection**: CSV, JSON, SQL, or All
- **Date range filtering**: Backup only specific date range
- **Notes/description** field
- **Estimated file size** calculation
- **Real-time progress** tracking

#### 3. Backup History Table
- **Comprehensive listing** of all backups
- **Sortable columns**: Date/Time, File Name, Type, Size, Records, Status
- **Status indicators**: Completed ✓, Failed ✗, In Progress ⏳
- **Actions**:
  - 📥 Download
  - ✓ Verify integrity
  - ↻ Restore
  - 🗑️ Delete
- **Pagination** (25 backups per page)

#### 4. Backup Health Monitor
- **Last successful backup** timestamp
- **Next scheduled backup** time
- **Backup streak** (consecutive days)
- **Failed backups** in last 30 days
- **Storage usage** with visual progress bar
- **Alerts** for:
  - Backup older than 24 hours
  - Storage over 80% full

#### 5. Backup Restore Functionality
- **Three restore modes**:
  - **Full restore**: Replace all data
  - **Merge restore**: Add missing items, update existing
  - **Preview mode**: Dry run to show what would change
- **Safety features**:
  - Warning modal with confirmation checkbox
  - Admin password re-entry required
  - Automatic backup of current state before restore
  - Database transaction for atomicity
- **Detailed restore report**: Items added, updated, skipped

#### 6. Backup Verification
- **Integrity check**: File corruption detection
- **Data completeness**: Record count validation
- **Format validity**: Parse test
- **Restore-ability test**: Test restore to temporary database

### Components

```
src/components/backup/
├── BackupManagement.tsx        # Main backup management component
├── BackupHealthDashboard.tsx   # Health monitoring dashboard
├── BackupHistoryTable.tsx      # Backup history with actions
└── CreateBackupModal.tsx       # Manual backup creation modal
```

### API Endpoints

```
GET  /api/backup                # List backups
GET  /api/backup?action=health  # Get backup health status
POST /api/backup                # Create new backup
POST /api/backup/verify         # Verify backup integrity
POST /api/backup/restore        # Restore from backup
DELETE /api/backup/:id          # Delete backup
```

### Creating a Backup Programmatically

```typescript
import { createBackup } from '@/services/backup';

const backupId = await createBackup(
  userId,
  {
    name: 'manual-backup-2025-10-21',
    includeData: {
      inventoryItems: true,
      auditLogs: true,
      userData: false,
      systemSettings: false,
    },
    formats: ['JSON', 'CSV'],
    dateRange: {
      from: new Date('2025-01-01'),
      to: new Date('2025-10-21'),
    },
    notes: 'Quarterly backup before system upgrade',
  },
  (progress) => {
    console.log(`${progress.step}: ${progress.percentage}%`);
  }
);
```

---

## Report Generation

### Features

#### 1. Report Configuration
- **Report types**:
  - Monthly Inventory Report
  - Yearly Summary Report
  - Custom Date Range Report
  - Audit Report
- **Time period selection**:
  - Month and year picker (for monthly)
  - Year picker (for yearly)
  - Date range picker (for custom)
- **Content options**:
  - ☑ Inventory summary statistics
  - ☑ Charts and visualizations
  - ☑ Item-by-item detailed table
  - ☑ Reject analysis
  - ☑ Destination breakdown (Mais vs Fozan)
  - ☑ Category analysis
  - ☑ AI-powered insights from Gemini (recommended)
  - ☐ User activity summary
  - ☐ Audit trail excerpt
  - ☐ Comparative analysis (vs previous period)

#### 2. Report Formats
- **PDF**: Styled, professional (recommended)
- **Excel**: With multiple sheets and charts
- **PowerPoint**: Executive summary slides

#### 3. Customization Options
- **Include company logo** (checkbox)
- **Include signature section** (checkbox)
- **Language**: English / Arabic / Bilingual
- **Paper size**: A4 / Letter
- **Orientation**: Portrait / Landscape

#### 4. Email Options
- **Email report when ready** (checkbox)
- **Recipients**: Multi-email input with add/remove
- **Subject**: Pre-filled, editable
- **Message**: Textarea for custom message

#### 5. Report Generation Process
- **Real-time progress** updates:
  - Fetching inventory data... (10%)
  - Calculating statistics... (25%)
  - Generating charts... (40%)
  - Requesting AI insights from Gemini... (60%)
  - Creating PDF document... (80%)
  - Finalizing and saving... (95%)
  - Report ready! (100%)
- **Estimated time**: ~2-3 minutes
- **Cancel generation** option

#### 6. Report History Table
- **Comprehensive listing** of all reports
- **Columns**: Title, Type, Period, Generated Date/Time, By, Status
- **Status badges**: Generating, Completed, Failed
- **Actions**:
  - 📥 Download
  - 👁️ Preview (in-browser PDF viewer)
  - 🗑️ Delete
- **Search** by title or period
- **Filter** by type and date
- **Pagination** (10 per page)

### Components

```
src/components/reports/
├── ReportGeneration.tsx    # Report configuration and generation
└── ReportHistoryTable.tsx  # Report history with actions
```

### Report Template Structure (PDF)

1. **Cover Page**
   - Company logo (centered, large)
   - Report title
   - Report period
   - Generation date and time
   - Generated by user name
   - Confidential watermark (optional)

2. **Executive Summary**
   - Key findings (3-5 bullet points)
   - Overall statistics
   - Notable trends or issues

3. **Gemini AI Insights**
   - 🤖 AI-Powered Analysis
   - Trends identified
   - Anomalies detected
   - Recommendations
   - Predictions for next period
   - Disclaimer

4. **Visual Analytics**
   - Full-page charts (high-resolution)
   - Inventory trend line chart
   - Destination pie chart
   - Category bar chart
   - Reject rate chart

5. **Detailed Data Tables**
   - Comprehensive inventory item list
   - Grouped by category or destination
   - Subtotals and grand totals

6. **Summary & Signatures**
   - Period recap
   - Approval signatures section
   - Footer with company info

---

## API Endpoints

### Audit Endpoints

```
GET  /api/audit                    # List audit logs with filters
GET  /api/audit/statistics         # Get audit statistics
POST /api/audit/export             # Export audit logs
```

### Backup Endpoints

```
GET  /api/backup                   # List backups
GET  /api/backup?action=health     # Get backup health
POST /api/backup                   # Create backup
POST /api/backup/verify            # Verify backup
POST /api/backup/restore           # Restore backup
GET  /api/backup/download/:id      # Download backup
DELETE /api/backup/:id             # Delete backup
POST /api/backup/config            # Save backup configuration
```

### Report Endpoints

```
GET  /api/reports                  # List reports
POST /api/reports                  # Generate report
GET  /api/reports/:id              # Get report details
DELETE /api/reports/:id            # Delete report
GET  /api/reports/:id/download     # Download report
```

---

## Database Schema

### AuditLog Model

```prisma
model AuditLog {
  id            String       @id @default(uuid())
  userId        String
  action        AuditAction
  entityType    String
  entityId      String?
  oldValue      Json?
  newValue      Json?
  ipAddress     String?
  userAgent     String?
  timestamp     DateTime     @default(now())
  
  user          User         @relation(fields: [userId], references: [id])
  inventoryItem InventoryItem? @relation(fields: [entityId], references: [id])
  
  @@index([userId, timestamp])
  @@index([entityType, entityId])
  @@index([timestamp])
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  EXPORT
}
```

### Backup Model

```prisma
model Backup {
  id          String         @id @default(uuid())
  fileName    String
  fileSize    Int
  fileType    BackupFileType
  recordCount Int
  storagePath String
  status      BackupStatus   @default(IN_PROGRESS)
  createdAt   DateTime       @default(now())
  createdBy   String
  
  user        User           @relation(fields: [createdBy], references: [id])
  
  @@index([createdAt])
}

enum BackupFileType {
  CSV
  JSON
  SQL
}

enum BackupStatus {
  IN_PROGRESS
  COMPLETED
  FAILED
}
```

### Report Model

```prisma
model Report {
  id           String       @id @default(uuid())
  title        String
  type         ReportType
  periodStart  DateTime
  periodEnd    DateTime
  generatedBy  String
  fileUrl      String?
  dataSnapshot Json
  aiInsights   String?      @db.Text
  status       ReportStatus @default(GENERATING)
  createdAt    DateTime     @default(now())
  
  user         User         @relation(fields: [generatedBy], references: [id])
  
  @@index([type, periodStart])
  @@index([createdAt])
}

enum ReportType {
  MONTHLY
  YEARLY
  CUSTOM
  AUDIT
}

enum ReportStatus {
  GENERATING
  COMPLETED
  FAILED
}
```

---

## Security & Compliance

### Access Control

- **Audit page**: Accessible to ADMIN and AUDITOR roles only
- **Backup page**: Accessible to ADMIN and MANAGER roles only
- **Restore operations**: Require admin password re-entry
- **Delete operations**: Require confirmation and admin role

### Data Protection

- **Backup encryption**: Optional AES-256 encryption with password
- **Secure key management**: Environment variables for sensitive data
- **Audit log integrity**: Cryptographic signing (optional)
- **Tamper-proof logs**: Immutable audit trail

### Compliance Features

- **Retention policy compliance**: Automatic cleanup based on regulations
- **Audit trail for all operations**: Complete activity tracking
- **Export for compliance officers**: Signed PDF exports
- **Data integrity verification**: Checksum validation

### Best Practices

1. **Regular backups**: Enable automatic daily backups
2. **Test restores**: Periodically verify backup integrity
3. **Monitor alerts**: Check backup health dashboard regularly
4. **Review audit logs**: Investigate suspicious activities
5. **Secure storage**: Use encrypted backups for sensitive data
6. **Access control**: Limit backup/restore access to authorized users
7. **Retention policy**: Configure appropriate retention periods
8. **Documentation**: Keep notes on manual backups

---

## Troubleshooting

### Backup Issues

**Problem**: Backup fails with "Out of storage" error
- **Solution**: Check storage usage in health dashboard, delete old backups, or increase storage limit

**Problem**: Backup verification fails
- **Solution**: File may be corrupted, create a new backup

**Problem**: Restore operation fails
- **Solution**: Check backup integrity, ensure database is accessible, verify admin password

### Audit Log Issues

**Problem**: Audit logs not appearing
- **Solution**: Check if audit logging is enabled, verify database connection

**Problem**: Filters not working
- **Solution**: Clear browser cache, check date range format

### Report Generation Issues

**Problem**: Report generation stuck at "Requesting AI insights"
- **Solution**: Check Gemini API key, disable AI insights option

**Problem**: Report download fails
- **Solution**: Check file URL, verify file exists on server

---

## Future Enhancements

1. **Cloud storage integration**: AWS S3, Google Cloud, Azure
2. **Scheduled reports**: Automatic report generation on schedule
3. **Real-time audit log**: WebSocket for live updates
4. **Advanced analytics**: Machine learning for anomaly detection
5. **Multi-language support**: Full i18n for reports
6. **Mobile app**: Backup and audit management on mobile
7. **Two-factor authentication**: For critical operations
8. **Backup compression**: Reduce storage usage
9. **Incremental backups**: Only backup changes since last backup
10. **Audit log search**: Full-text search with Elasticsearch

---

## Support

For issues or questions, contact the development team or refer to the main project documentation.

**Version**: 1.0.0  
**Last Updated**: October 21, 2025  
**Maintained by**: MAIS Development Team
