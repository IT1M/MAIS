# Database Operations Guide

## Quick Start

```bash
# Install dependencies
npm install

# Setup database (migrate + seed)
npm run db:setup

# Or run separately:
npm run prisma:migrate  # Create/apply migrations
npm run prisma:seed     # Seed with sample data
```

## Using Prisma Client

### Import the Client
```typescript
import { prisma } from '@/services/prisma';
```

### Basic CRUD Operations

#### Create
```typescript
// Create a user
const user = await prisma.user.create({
  data: {
    email: 'user@mais.sa',
    name: 'John Doe',
    password: hashedPassword,
    role: 'DATA_ENTRY',
  },
});

// Create an inventory item
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
```

#### Read
```typescript
// Find one user by email
const user = await prisma.user.findUnique({
  where: { email: 'admin@mais.sa' },
});

// Find many with filters
const items = await prisma.inventoryItem.findMany({
  where: {
    destination: 'MAIS',
    quantity: { gte: 100 },
  },
  include: { user: true },
  orderBy: { createdAt: 'desc' },
  take: 10,
});

// Count records
const count = await prisma.inventoryItem.count({
  where: { destination: 'MAIS' },
});
```

#### Update
```typescript
// Update a single record
const updated = await prisma.inventoryItem.update({
  where: { id: itemId },
  data: {
    quantity: 1500,
    reject: 15,
  },
});

// Update many records
const result = await prisma.inventoryItem.updateMany({
  where: { destination: 'MAIS' },
  data: { category: 'Medical Supplies' },
});
```

#### Delete
```typescript
// Delete a single record
await prisma.inventoryItem.delete({
  where: { id: itemId },
});

// Delete many records
await prisma.inventoryItem.deleteMany({
  where: { createdAt: { lt: new Date('2024-01-01') } },
});
```

### Advanced Queries

#### Pagination
```typescript
const page = 1;
const limit = 20;

const [items, total] = await Promise.all([
  prisma.inventoryItem.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  }),
  prisma.inventoryItem.count(),
]);

const totalPages = Math.ceil(total / limit);
```

#### Search
```typescript
const searchTerm = 'gloves';

const results = await prisma.inventoryItem.findMany({
  where: {
    OR: [
      { itemName: { contains: searchTerm, mode: 'insensitive' } },
      { batch: { contains: searchTerm, mode: 'insensitive' } },
      { notes: { contains: searchTerm, mode: 'insensitive' } },
    ],
  },
});
```

#### Aggregations
```typescript
// Sum quantities by destination
const stats = await prisma.inventoryItem.groupBy({
  by: ['destination'],
  _sum: {
    quantity: true,
    reject: true,
  },
  _count: true,
});

// Get min/max/avg
const aggregates = await prisma.inventoryItem.aggregate({
  _sum: { quantity: true },
  _avg: { quantity: true },
  _min: { quantity: true },
  _max: { quantity: true },
});
```

#### Transactions
```typescript
// Atomic operations
const result = await prisma.$transaction(async (tx) => {
  // Create inventory item
  const item = await tx.inventoryItem.create({
    data: { /* ... */ },
  });

  // Create audit log
  await tx.auditLog.create({
    data: {
      userId: user.id,
      action: 'CREATE',
      entityType: 'InventoryItem',
      entityId: item.id,
      newValue: item,
    },
  });

  return item;
});
```

### Audit Logging Helper

```typescript
async function createAuditLog(
  userId: string,
  action: AuditAction,
  entityType: string,
  entityId: string,
  oldValue?: any,
  newValue?: any,
  ipAddress?: string,
  userAgent?: string
) {
  return await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
      newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
      ipAddress,
      userAgent,
    },
  });
}
```

### Report Generation

```typescript
async function generateMonthlyReport(userId: string, month: Date) {
  const periodStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const periodEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  // Get data for the period
  const items = await prisma.inventoryItem.findMany({
    where: {
      createdAt: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
  });

  // Calculate statistics
  const dataSnapshot = {
    totalItems: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    totalRejects: items.reduce((sum, item) => sum + item.reject, 0),
    byDestination: {
      MAIS: items.filter(i => i.destination === 'MAIS').length,
      FOZAN: items.filter(i => i.destination === 'FOZAN').length,
    },
  };

  // Create report
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
```

## Best Practices

1. **Always use transactions** for operations that modify multiple tables
2. **Include relations** only when needed to avoid over-fetching
3. **Use pagination** for large datasets
4. **Create audit logs** for all data modifications
5. **Validate input** before database operations
6. **Handle errors** gracefully with try-catch blocks
7. **Use indexes** for frequently queried fields
8. **Close connections** properly (handled by singleton)

## Common Patterns

### With Audit Trail
```typescript
async function updateItemWithAudit(
  itemId: string,
  userId: string,
  updates: Partial<InventoryItem>
) {
  return await prisma.$transaction(async (tx) => {
    // Get old value
    const oldItem = await tx.inventoryItem.findUnique({
      where: { id: itemId },
    });

    // Update item
    const newItem = await tx.inventoryItem.update({
      where: { id: itemId },
      data: updates,
    });

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        entityType: 'InventoryItem',
        entityId: itemId,
        oldValue: oldItem,
        newValue: newItem,
      },
    });

    return newItem;
  });
}
```

### Soft Delete Pattern
```typescript
// Instead of deleting, mark as inactive
const user = await prisma.user.update({
  where: { id: userId },
  data: { isActive: false },
});

// Query only active users
const activeUsers = await prisma.user.findMany({
  where: { isActive: true },
});
```

## Troubleshooting

### Type Errors
```bash
# Regenerate Prisma Client
npm run prisma:generate
```

### Migration Issues
```bash
# Check migration status
npx prisma migrate status --schema=./src/db/schema.prisma

# Reset database (⚠️ deletes all data)
npx prisma migrate reset --schema=./src/db/schema.prisma
```

### Connection Issues
- Check DATABASE_URL in .env
- Verify PostgreSQL is running
- Check network connectivity
- Verify credentials

## Resources

- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Query Optimization](https://www.prisma.io/docs/guides/performance-and-optimization)
