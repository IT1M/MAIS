# Audit Trail & Backup System - Setup Guide

## Quick Start

Follow these steps to set up the audit trail and backup system in your MAIS Inventory Management System.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Environment variables configured
- Prisma CLI installed

## Installation Steps

### 1. Database Migration

Run the Prisma migration to create the necessary tables:

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Or use the combined command
npm run db:setup
```

This will create the following tables:
- `audit_logs` - Stores all audit trail entries
- `backups` - Stores backup metadata
- `reports` - Stores generated report metadata
- `system_settings` - Stores backup configuration

### 2. Environment Variables

Add the following to your `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mais_inventory"

# Backup Configuration
BACKUP_DIR="./backups"
BACKUP_STORAGE_LIMIT=10737418240  # 10GB in bytes

# Gemini AI (for report insights)
GEMINI_API_KEY="your-gemini-api-key"

# Email Configuration (optional, for report delivery)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-app-password"
```

### 3. Create Backup Directory

```bash
mkdir -p backups
chmod 755 backups
```

### 4. Install Dependencies

All required dependencies are already in `package.json`. If you need to install them separately:

```bash
npm install @prisma/client date-fns
```

### 5. Build the Application

```bash
npm run build
```

### 6. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Accessing the Features

### Audit Trail Page

Navigate to: `http://localhost:3000/[locale]/audit`

**Access Requirements:**
- Role: ADMIN or AUDITOR
- Authentication: Required

**Features Available:**
- View all audit logs with filtering
- Search by entity ID, IP address
- Filter by date range, user, action type
- View detailed changes
- Export audit logs

### Backup & Reports Page

Navigate to: `http://localhost:3000/[locale]/backup`

**Access Requirements:**
- Role: ADMIN or MANAGER
- Authentication: Required

**Features Available:**
- Configure automatic backups
- Create manual backups
- View backup history
- Restore from backups
- Generate reports
- View report history

## Configuration

### Automatic Backup Configuration

1. Navigate to `/[locale]/backup`
2. Scroll to "Automatic Backup Configuration"
3. Configure the following:
   - Enable automatic daily backups (toggle)
   - Set backup time (default: 2:00 AM)
   - Select backup formats (CSV, JSON, SQL)
   - Enable "Include audit logs in backup"
   - Set retention policy:
     - Daily backups: 30 days
     - Weekly backups: 12 weeks
     - Monthly backups: 12 months
4. Click "Save Settings"

### Setting Up Scheduled Backups

To enable automatic scheduled backups, you need to set up a cron job or scheduled task:

#### Using Node.js Cron (Recommended)

Install node-cron:

```bash
npm install node-cron
```

Create `src/jobs/backup-scheduler.ts`:

```typescript
import cron from 'node-cron';
import { createBackup } from '@/services/backup';

// Run daily at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running scheduled backup...');
  
  try {
    await createBackup('system-user-id', {
      name: `auto-backup-${new Date().toISOString().split('T')[0]}`,
      includeData: {
        inventoryItems: true,
        auditLogs: true,
        userData: false,
        systemSettings: false,
      },
      formats: ['JSON'],
    });
    
    console.log('Scheduled backup completed successfully');
  } catch (error) {
    console.error('Scheduled backup failed:', error);
  }
});
```

#### Using System Cron (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2:00 AM)
0 2 * * * cd /path/to/mais-inventory && node scripts/backup.js
```

Create `scripts/backup.js`:

```javascript
const { createBackup } = require('./src/services/backup');

async function runBackup() {
  try {
    await createBackup('system-user-id', {
      name: `auto-backup-${new Date().toISOString().split('T')[0]}`,
      includeData: {
        inventoryItems: true,
        auditLogs: true,
        userData: false,
        systemSettings: false,
      },
      formats: ['JSON'],
    });
    console.log('Backup completed');
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
}

runBackup();
```

## Testing

### Test Audit Logging

```typescript
// In your API route or service
import { createAuditLog } from '@/services/audit';

await createAuditLog({
  userId: 'test-user-id',
  action: 'CREATE',
  entityType: 'InventoryItem',
  entityId: 'test-item-id',
  newValue: { name: 'Test Item', quantity: 100 },
  ipAddress: '127.0.0.1',
  userAgent: 'Mozilla/5.0...',
});
```

Then check the audit page to see the log entry.

### Test Backup Creation

1. Navigate to `/[locale]/backup`
2. Click "Create Backup"
3. Configure backup options
4. Click "Create Backup"
5. Monitor progress
6. Verify backup appears in history table

### Test Backup Restore

1. Navigate to `/[locale]/backup`
2. Find a completed backup in history
3. Click the restore button (↻)
4. Read the warning carefully
5. Check "I understand this will overwrite existing data"
6. Enter admin password
7. Click "Restore"
8. Verify data is restored

### Test Report Generation

1. Navigate to `/[locale]/backup`
2. Click "Report Generation" tab
3. Select report type (e.g., Monthly)
4. Choose period (e.g., October 2025)
5. Select content options
6. Click "Generate Report"
7. Monitor progress
8. Download when complete

## Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Verify database exists
- Check network connectivity

```bash
# Test database connection
psql $DATABASE_URL
```

### Issue: "Backup directory not writable"

**Solution:**
```bash
# Check permissions
ls -la backups/

# Fix permissions
chmod 755 backups/
chown $USER:$USER backups/
```

### Issue: "Prisma client not generated"

**Solution:**
```bash
# Regenerate Prisma client
npm run prisma:generate
```

### Issue: "Audit logs not appearing"

**Solution:**
- Check if audit logging is enabled in code
- Verify database connection
- Check browser console for errors
- Verify user has ADMIN or AUDITOR role

### Issue: "Report generation fails with AI insights"

**Solution:**
- Check GEMINI_API_KEY in .env
- Verify API key is valid
- Disable AI insights option temporarily
- Check API quota limits

## Performance Optimization

### Database Indexes

The schema includes optimized indexes for:
- Audit logs: `userId + timestamp`, `entityType + entityId`, `timestamp`
- Backups: `createdAt`
- Reports: `type + periodStart`, `createdAt`

### Backup Storage

To optimize storage:

1. **Enable compression** (future feature)
2. **Use retention policy** to auto-delete old backups
3. **Store backups on separate disk** for better I/O
4. **Use cloud storage** for long-term retention

### Audit Log Cleanup

Create a cleanup job to archive old audit logs:

```typescript
// Archive logs older than 1 year
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

await prisma.auditLog.deleteMany({
  where: {
    timestamp: {
      lt: oneYearAgo,
    },
  },
});
```

## Security Checklist

- [ ] Enable HTTPS in production
- [ ] Set strong admin passwords
- [ ] Enable backup encryption
- [ ] Restrict backup directory permissions
- [ ] Enable two-factor authentication (future)
- [ ] Regular security audits
- [ ] Monitor failed login attempts
- [ ] Review audit logs regularly
- [ ] Test backup restore procedures
- [ ] Keep backup copies off-site

## Monitoring

### Health Checks

Monitor these metrics:
- Last successful backup timestamp
- Backup failure rate
- Storage usage percentage
- Audit log growth rate
- Report generation success rate

### Alerts

Set up alerts for:
- Backup failures
- Storage > 80% full
- No backup in 24+ hours
- Suspicious audit log patterns
- Failed restore attempts

### Logging

Enable application logging:

```typescript
// In your logger configuration
{
  level: 'info',
  format: 'json',
  transports: [
    new winston.transports.File({ filename: 'logs/audit.log' }),
    new winston.transports.File({ filename: 'logs/backup.log' }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
}
```

## Backup Best Practices

1. **3-2-1 Rule**: 3 copies, 2 different media, 1 off-site
2. **Test restores**: Monthly restore tests
3. **Document procedures**: Keep restore instructions updated
4. **Monitor storage**: Set up alerts before running out
5. **Encrypt sensitive data**: Use backup encryption
6. **Version control**: Keep multiple backup versions
7. **Automate**: Use scheduled backups
8. **Verify integrity**: Run verification checks

## Support & Resources

- **Documentation**: See `AUDIT_BACKUP_DOCUMENTATION.md`
- **API Reference**: See API endpoints section
- **Database Schema**: See `src/db/schema.prisma`
- **Issue Tracker**: GitHub Issues
- **Community**: Discord/Slack channel

## Next Steps

After setup:

1. ✅ Test audit logging with sample data
2. ✅ Create your first manual backup
3. ✅ Configure automatic backup schedule
4. ✅ Generate a test report
5. ✅ Set up monitoring and alerts
6. ✅ Train team on backup/restore procedures
7. ✅ Document your backup strategy
8. ✅ Schedule regular backup tests

## Maintenance Schedule

### Daily
- Monitor backup health dashboard
- Check for failed backups
- Review critical audit logs

### Weekly
- Review audit log statistics
- Check storage usage
- Verify backup integrity

### Monthly
- Test backup restore procedure
- Generate monthly reports
- Review retention policy
- Clean up old backups

### Quarterly
- Security audit
- Update documentation
- Review access controls
- Test disaster recovery plan

---

**Setup Complete!** 🎉

Your audit trail and backup system is now ready to use. For detailed feature documentation, see `AUDIT_BACKUP_DOCUMENTATION.md`.
