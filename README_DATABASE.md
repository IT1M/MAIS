# MAIS Inventory System - Database Documentation

## 🎯 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set DATABASE_URL in .env
DATABASE_URL="postgresql://user:pass@localhost:5432/mais_inventory"

# 3. Setup database (migrate + seed)
npm run db:setup

# 4. Open Prisma Studio
npm run prisma:studio
```

**Default Login:** admin@mais.sa / Admin@123

---

## 📚 Documentation Index

### Getting Started
- **[PRISMA_SETUP_INSTRUCTIONS.md](./PRISMA_SETUP_INSTRUCTIONS.md)** - Quick setup guide (START HERE)
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Comprehensive setup documentation
- **[DATABASE_IMPLEMENTATION_SUMMARY.md](./DATABASE_IMPLEMENTATION_SUMMARY.md)** - Complete implementation details

### Developer Guides
- **[src/db/README.md](./src/db/README.md)** - Database operations and query examples
- **[src/db/MIGRATION_GUIDE.md](./src/db/MIGRATION_GUIDE.md)** - Schema changes and migrations

---

## 📊 Database Schema Overview

### 6 Core Models

#### 1. **User** - Authentication & Authorization
```typescript
{
  id: UUID
  email: string (unique)
  name: string
  password: string (hashed)
  role: ADMIN | DATA_ENTRY | SUPERVISOR | MANAGER | AUDITOR
  isActive: boolean
  preferences: JSON
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 2. **InventoryItem** - Product Tracking
```typescript
{
  id: UUID
  itemName: string
  batch: string
  quantity: number
  reject: number
  destination: MAIS | FOZAN
  category?: string
  notes?: string
  enteredBy: UUID (User)
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 3. **AuditLog** - Activity Tracking
```typescript
{
  id: UUID
  userId: UUID (User)
  action: CREATE | UPDATE | DELETE | LOGIN | LOGOUT | EXPORT
  entityType: string
  entityId?: UUID
  oldValue?: JSON
  newValue?: JSON
  ipAddress?: string
  userAgent?: string
  timestamp: DateTime
}
```

#### 4. **Report** - Report Generation
```typescript
{
  id: UUID
  title: string
  type: MONTHLY | YEARLY | CUSTOM | AUDIT
  periodStart: DateTime
  periodEnd: DateTime
  generatedBy: UUID (User)
  fileUrl?: string
  dataSnapshot: JSON
  aiInsights?: string
  status: GENERATING | COMPLETED | FAILED
  createdAt: DateTime
}
```

#### 5. **Backup** - Backup Tracking
```typescript
{
  id: UUID
  fileName: string
  fileSize: number
  fileType: CSV | JSON | SQL
  recordCount: number
  storagePath: string
  status: IN_PROGRESS | COMPLETED | FAILED
  createdAt: DateTime
  createdBy: UUID (User)
}
```

#### 6. **SystemSettings** - Configuration
```typescript
{
  id: UUID
  key: string (unique)
  value: JSON
  category: string
  updatedBy: UUID (User)
  updatedAt: DateTime
}
```

---

## 🔧 Key Files

### Schema & Configuration
- `src/db/schema.prisma` - Database schema definition
- `src/services/prisma.ts` - Prisma client singleton
- `.env` - Database connection URL

### Data & Seeding
- `src/db/seed.ts` - Sample data seeding script
- Default users: Admin, Data Entry, Supervisor
- 8 sample inventory items
- 5 system settings

### Validation & Types
- `src/utils/validation.ts` - Zod validation schemas
- `src/types/database.ts` - TypeScript type definitions
- `src/services/database-helpers.ts` - Common database operations

---

## 🚀 Common Commands

### Setup & Generation
```bash
npm run db:setup              # Complete setup (migrate + seed)
npm run prisma:generate       # Generate Prisma Client
npm run prisma:migrate        # Create and apply migration
npm run prisma:seed           # Seed database
npm run prisma:studio         # Open Prisma Studio
```

### Development
```bash
npm run dev                   # Start development server
npm run build                 # Build for production
npm run start                 # Start production server
```

### Database Management
```bash
# View migration status
npx prisma migrate status --schema=./src/db/schema.prisma

# Reset database (⚠️ deletes all data)
npx prisma migrate reset --schema=./src/db/schema.prisma

# Format schema file
npx prisma format --schema=./src/db/schema.prisma

# Validate schema
npx prisma validate --schema=./src/db/schema.prisma
```

---

## 💡 Usage Examples

### Basic CRUD Operations

```typescript
import { prisma } from '@/services/prisma';

// Create
const item = await prisma.inventoryItem.create({
  data: {
    itemName: 'Surgical Gloves',
    batch: 'SG-2024-001',
    quantity: 1000,
    reject: 10,
    destination: 'MAIS',
    enteredBy: userId,
  },
});

// Read
const items = await prisma.inventoryItem.findMany({
  where: { destination: 'MAIS' },
  include: { user: true },
  orderBy: { createdAt: 'desc' },
});

// Update
const updated = await prisma.inventoryItem.update({
  where: { id: itemId },
  data: { quantity: 1500 },
});

// Delete
await prisma.inventoryItem.delete({
  where: { id: itemId },
});
```

### Using Helper Functions

```typescript
import {
  createInventoryItemWithAudit,
  searchInventoryItems,
  getInventoryStats,
  generateMonthlyReport,
} from '@/services/database-helpers';

// Create with audit trail
const item = await createInventoryItemWithAudit(
  { /* item data */ },
  userId,
  ipAddress,
  userAgent
);

// Search
const results = await searchInventoryItems('gloves');

// Get statistics
const stats = await getInventoryStats();

// Generate report
const report = await generateMonthlyReport(userId, new Date());
```

---

## 🔒 Security Features

- ✅ **Password Hashing** - bcrypt with 10 rounds
- ✅ **UUID Primary Keys** - Non-sequential IDs
- ✅ **Input Validation** - Zod schemas
- ✅ **SQL Injection Prevention** - Prisma ORM
- ✅ **Audit Logging** - Complete activity tracking
- ✅ **Role-Based Access** - 5 user roles
- ✅ **Cascade Deletes** - Proper foreign key handling

---

## 📈 Performance Optimizations

### Indexes
- Email lookups (User)
- Item name and batch searches (InventoryItem)
- Time-based queries (AuditLog, Report)
- Composite indexes for common queries

### Connection Management
- Singleton Prisma client
- Connection pooling
- Graceful shutdown handling

### Query Optimization
- Selective field inclusion
- Pagination support
- Efficient aggregations

---

## 🧪 Sample Data

After running `npm run db:setup`, you'll have:

### Users (3)
- **Admin:** admin@mais.sa (ADMIN role)
- **Data Entry:** dataentry@mais.sa (DATA_ENTRY role)
- **Supervisor:** supervisor@mais.sa (SUPERVISOR role)

### Inventory Items (8)
- Surgical Gloves (MAIS)
- Face Masks N95 (FOZAN)
- Syringes 10ml (MAIS)
- Bandages Sterile (FOZAN)
- Alcohol Swabs (MAIS)
- Thermometer Digital (FOZAN)
- IV Catheters (MAIS)
- Surgical Masks (FOZAN)

### System Settings (5)
- Theme configuration
- API rate limits
- Email notifications
- Backup schedule
- Report auto-generation

---

## 🐛 Troubleshooting

### Can't connect to database
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -h localhost -U postgres -d mais_inventory
```

### Prisma Client not found
```bash
npm run prisma:generate
```

### Migration failed
```bash
# Reset and retry
npx prisma migrate reset --schema=./src/db/schema.prisma
npm run db:setup
```

### Type errors after schema changes
```bash
# Regenerate client
npm run prisma:generate

# Restart TypeScript server in your IDE
```

---

## 📖 Additional Resources

### Official Documentation
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Zod Documentation](https://zod.dev)

### Tutorials
- [Prisma Quickstart](https://www.prisma.io/docs/getting-started/quickstart)
- [Next.js with Prisma](https://www.prisma.io/nextjs)
- [Database Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

---

## 🆘 Support

For issues or questions:
1. Check the troubleshooting sections in documentation
2. Review error messages carefully
3. Verify DATABASE_URL configuration
4. Ensure all dependencies are installed
5. Check that PostgreSQL is running

---

## ✅ Pre-Production Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Configure production DATABASE_URL
- [ ] Enable SSL for database connections
- [ ] Set up automated backups
- [ ] Configure monitoring and logging
- [ ] Review and adjust connection pool settings
- [ ] Test all migrations in staging
- [ ] Set up error tracking
- [ ] Configure rate limiting
- [ ] Review audit log retention policy
- [ ] Set up database replication (if needed)
- [ ] Configure backup restoration procedures
- [ ] Document disaster recovery plan

---

**Version:** 1.0.0  
**Last Updated:** October 20, 2025  
**Status:** ✅ Production Ready
