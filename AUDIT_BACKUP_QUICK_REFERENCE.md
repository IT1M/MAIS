# Audit & Backup System - Quick Reference

## 🚀 Quick Access

| Feature | URL | Required Role |
|---------|-----|---------------|
| Audit Trail | `/[locale]/audit` | ADMIN, AUDITOR |
| Backup & Reports | `/[locale]/backup` | ADMIN, MANAGER |

## 📊 Audit Trail

### View Audit Logs
1. Navigate to `/[locale]/audit`
2. Use filters to narrow down results
3. Click row to expand and see details

### Filter Audit Logs
- **Date Range**: Today, Yesterday, Last 7 days, Last 30 days, Custom
- **Users**: Select one or more users
- **Actions**: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT, VIEW
- **Entity Types**: InventoryItem, User, Report, Backup, Settings
- **Search**: Entity IDs, IP addresses

### Export Audit Logs
1. Apply desired filters
2. Click "Export Logs" button
3. Choose format: CSV, Excel, or PDF
4. Download file

## 💾 Backup Management

### Create Manual Backup
1. Go to `/[locale]/backup`
2. Click "Create Backup" button
3. Configure options:
   - Name (auto-generated)
   - Include: Inventory, Audit Logs, Users, Settings
   - Format: CSV, JSON, SQL, or All
   - Date range (optional)
4. Click "Create Backup"
5. Wait for completion
6. Download from history table

### Configure Automatic Backups
1. Go to `/[locale]/backup`
2. Scroll to "Automatic Backup Configuration"
3. Toggle "Enable Automatic Daily Backups"
4. Set backup time (default: 2:00 AM)
5. Select formats
6. Enable "Include audit logs"
7. Set retention policy
8. Click "Save Settings"

### Restore from Backup
1. Find backup in history table
2. Click restore button (↻)
3. Read warning carefully
4. Check confirmation checkbox
5. Enter admin password
6. Choose mode: Full, Merge, or Preview
7. Click "Restore"
8. Review restore report

### Verify Backup Integrity
1. Find backup in history table
2. Click verify button (✓)
3. Wait for verification
4. Check result message

## 📈 Report Generation

### Generate Report
1. Go to `/[locale]/backup`
2. Click "Report Generation" tab
3. Select report type:
   - Monthly Inventory Report
   - Yearly Summary Report
   - Custom Date Range Report
   - Audit Report
4. Choose time period
5. Select content options
6. Choose format: PDF, Excel, PowerPoint
7. Configure customization:
   - Logo, Signatures, Language, Paper size
8. (Optional) Enable email delivery
9. Click "Generate Report"
10. Wait for completion (~2-3 minutes)
11. Download from history table

### Download Report
1. Find report in history table
2. Click download button (📥)
3. File downloads automatically

### Preview Report
1. Find report in history table
2. Click preview button (👁️)
3. View in browser
4. Download or print from preview

## 🔧 Common Tasks

### Daily Backup Check
```bash
# Check last backup
curl http://localhost:3000/api/backup?action=health

# Expected response:
{
  "lastSuccessfulBackup": "2025-10-21T02:00:00Z",
  "backupStreak": 15,
  "alerts": []
}
```

### Create Audit Log Entry
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

### Programmatic Backup
```typescript
import { createBackup } from '@/services/backup';

const backupId = await createBackup(userId, {
  name: 'manual-backup',
  includeData: {
    inventoryItems: true,
    auditLogs: true,
    userData: false,
    systemSettings: false,
  },
  formats: ['JSON'],
});
```

### Generate Report Programmatically
```typescript
import { generateReport } from '@/services/report-generator';

const reportId = await generateReport(userId, {
  type: 'MONTHLY',
  period: {
    start: new Date('2025-10-01'),
    end: new Date('2025-10-31'),
  },
  content: {
    summary: true,
    charts: true,
    aiInsights: true,
    // ... other options
  },
  format: 'pdf',
  customization: {
    includeLogo: true,
    language: 'en',
    paperSize: 'A4',
    orientation: 'portrait',
  },
});
```

## 🎯 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Apply Filters | `Ctrl/Cmd + Enter` |
| Reset Filters | `Ctrl/Cmd + R` |
| Export | `Ctrl/Cmd + E` |
| Create Backup | `Ctrl/Cmd + B` |
| Generate Report | `Ctrl/Cmd + G` |

## 📱 Mobile Access

All features are mobile-responsive:
- Simplified card view for tables
- Touch-friendly buttons
- Optimized filters
- Step-by-step wizards

## ⚠️ Important Notes

### Backup Warnings
- ⚠️ Restore operations are **irreversible**
- ⚠️ Always verify backup before restore
- ⚠️ Test restores in non-production first
- ⚠️ Keep multiple backup versions

### Security Reminders
- 🔒 Admin password required for restore
- 🔒 Audit logs are immutable
- 🔒 Backups can be encrypted
- 🔒 Access is role-based

### Performance Tips
- 📊 Use date range filters for large datasets
- 📊 Export in batches for huge logs
- 📊 Schedule backups during off-peak hours
- 📊 Clean up old backups regularly

## 🆘 Troubleshooting

### Backup Failed
1. Check storage space
2. Verify database connection
3. Check backup directory permissions
4. Review error logs

### Restore Failed
1. Verify backup integrity
2. Check admin password
3. Ensure database is accessible
4. Try preview mode first

### Report Generation Stuck
1. Check Gemini API key (if using AI)
2. Disable AI insights temporarily
3. Reduce date range
4. Check server logs

### Audit Logs Not Showing
1. Clear browser cache
2. Check date range filters
3. Verify user role (ADMIN/AUDITOR)
4. Check database connection

## 📞 Support

- **Documentation**: `AUDIT_BACKUP_DOCUMENTATION.md`
- **Setup Guide**: `AUDIT_BACKUP_SETUP.md`
- **API Docs**: See API endpoints section
- **Issues**: GitHub Issues

## 🔄 Update History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-21 | Initial release |

---

**Quick Tip**: Bookmark this page for easy reference! 📌
