# Database Quick Reference Card

## 🚀 Setup (First Time)

```bash
npm install
# Add DATABASE_URL to .env
npm run db:setup
```

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mais.sa | Admin@123 |
| Data Entry | dataentry@mais.sa | DataEntry@123 |
| Supervisor | supervisor@mais.sa | Supervisor@123 |

## 📋 Common Commands

```bash
# Development
npm run dev                    # Start dev server
npm run prisma:studio          # View database

# Database
npm run db:setup               # Setup (migrate + seed)
npm run prisma:generate        # Generate client
npm run prisma:migrate         # Create migration
npm run prisma:seed            # Seed data

# Reset (⚠️ deletes data)
npx prisma migrate reset --schema=./src/db/schema.prisma
```

## 📊 Models

```
User → InventoryItem, AuditLog, Report, Backup, SystemSettings
InventoryItem → User, AuditLog
AuditLog → User, InventoryItem
Report → User
Backup → User
SystemSettings → User
```

## 💻 Code Snippets

### Import Prisma
```typescript
import { prisma } from '@/services/prisma';
```

### Create Item
```typescript
const item = await prisma.inventoryItem.create({
  data: {
    itemName: 'Item Name',
    batch: 'BATCH-001',
    quantity: 100,
    reject: 5,
    destination: 'MAIS',
    enteredBy: userId,
  },
});
```

### Find Items
```typescript
const items = await prisma.inventoryItem.findMany({
  where: { destination: 'MAIS' },
  include: { user: true },
  orderBy: { createdAt: 'desc' },
  take: 20,
});
```

### Update Item
```typescript
await prisma.inventoryItem.update({
  where: { id: itemId },
  data: { quantity: 150 },
});
```

### Search
```typescript
const results = await prisma.inventoryItem.findMany({
  where: {
    OR: [
      { itemName: { contains: 'search', mode: 'insensitive' } },
      { batch: { contains: 'search', mode: 'insensitive' } },
    ],
  },
});
```

### With Audit Trail
```typescript
import { createInventoryItemWithAudit } from '@/services/database-helpers';

const item = await createInventoryItemWithAudit(
  { /* data */ },
  userId,
  ipAddress,
  userAgent
);
```

### Get Statistics
```typescript
import { getInventoryStats } from '@/services/database-helpers';

const stats = await getInventoryStats();
// { totalItems, totalQuantity, totalRejects, byDestination }
```

### Pagination
```typescript
const page = 1;
const limit = 20;

const [items, total] = await Promise.all([
  prisma.inventoryItem.findMany({
    skip: (page - 1) * limit,
    take: limit,
  }),
  prisma.inventoryItem.count(),
]);
```

### Transaction
```typescript
await prisma.$transaction(async (tx) => {
  const item = await tx.inventoryItem.create({ data: {...} });
  await tx.auditLog.create({ data: {...} });
  return item;
});
```

## 🔍 Validation

```typescript
import { inventoryItemSchema } from '@/utils/validation';

const validated = inventoryItemSchema.parse(data);
```

## 📁 File Locations

```
src/
├── db/
│   ├── schema.prisma          # Schema definition
│   ├── seed.ts                # Seed script
│   ├── README.md              # Operations guide
│   └── MIGRATION_GUIDE.md     # Migration guide
├── services/
│   ├── prisma.ts              # Prisma client
│   └── database-helpers.ts    # Helper functions
├── types/
│   └── database.ts            # Type definitions
└── utils/
    └── validation.ts          # Validation schemas
```

## 🐛 Quick Fixes

### Can't connect
```bash
# Check PostgreSQL
pg_isready
```

### Client not found
```bash
npm run prisma:generate
```

### Migration failed
```bash
npx prisma migrate reset --schema=./src/db/schema.prisma
npm run db:setup
```

### Type errors
```bash
npm run prisma:generate
# Restart TypeScript server
```

## 📚 Documentation

- **Quick Start:** PRISMA_SETUP_INSTRUCTIONS.md
- **Full Guide:** DATABASE_SETUP.md
- **Operations:** src/db/README.md
- **Migrations:** src/db/MIGRATION_GUIDE.md
- **Summary:** DATABASE_IMPLEMENTATION_SUMMARY.md

## 🔗 Useful Links

- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Zod Docs](https://zod.dev)

---

**Need help?** Check the troubleshooting sections in the documentation files.
