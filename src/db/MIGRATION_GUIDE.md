# Database Migration Guide

## Overview
This guide explains how to safely modify the database schema and create migrations.

## Making Schema Changes

### 1. Edit the Schema File
Open `src/db/schema.prisma` and make your changes:

```prisma
// Example: Adding a new field to InventoryItem
model InventoryItem {
  id          String      @id @default(uuid())
  itemName    String
  batch       String
  quantity    Int
  reject      Int         @default(0)
  destination Destination
  category    String?
  notes       String?     @db.Text
  
  // NEW FIELD
  expiryDate  DateTime?   // Add expiry date tracking
  
  enteredBy   String
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  user        User        @relation(fields: [enteredBy], references: [id], onDelete: Cascade)
  auditLogs   AuditLog[]
  
  @@index([itemName])
  @@index([batch])
  @@index([createdAt])
  @@index([itemName, batch])
  @@index([createdAt, destination])
  @@map("inventory_items")
}
```

### 2. Create Migration
```bash
npm run prisma:migrate
```

When prompted, give your migration a descriptive name:
```
Enter a name for the new migration: add_expiry_date_to_inventory
```

### 3. Review Migration
Prisma creates a migration file in `prisma/migrations/`. Review it:

```sql
-- AlterTable
ALTER TABLE "inventory_items" ADD COLUMN "expiryDate" TIMESTAMP(3);
```

### 4. Apply Migration
The migration is automatically applied. For production:

```bash
npx prisma migrate deploy --schema=./src/db/schema.prisma
```

### 5. Regenerate Client
```bash
npm run prisma:generate
```

## Common Schema Changes

### Adding a New Field

```prisma
model User {
  // ... existing fields
  phoneNumber String? // Optional field
  department  String  @default("General") // With default
}
```

### Adding a New Model

```prisma
model Category {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  createdAt   DateTime @default(now())
  
  // Relations
  items       InventoryItem[]
  
  @@map("categories")
}

// Update InventoryItem to reference Category
model InventoryItem {
  // ... existing fields
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])
}
```

### Adding an Index

```prisma
model InventoryItem {
  // ... existing fields
  
  @@index([destination, createdAt]) // Composite index
  @@index([expiryDate]) // Single field index
}
```

### Adding an Enum Value

```prisma
enum Destination {
  MAIS
  FOZAN
  WAREHOUSE // New value
}
```

### Modifying Field Type

```prisma
model InventoryItem {
  // Change from Int to BigInt for large quantities
  quantity BigInt
  reject   BigInt @default(0)
}
```

## Migration Strategies

### Development Environment

```bash
# Create and apply migration
npm run prisma:migrate

# Reset database (deletes all data)
npx prisma migrate reset --schema=./src/db/schema.prisma

# Regenerate client
npm run prisma:generate
```

### Production Environment

```bash
# 1. Test migration in staging first
npx prisma migrate deploy --schema=./src/db/schema.prisma

# 2. Backup database before migration
pg_dump -U username -d mais_inventory > backup_$(date +%Y%m%d).sql

# 3. Apply migration
npx prisma migrate deploy --schema=./src/db/schema.prisma

# 4. Verify data integrity
npm run prisma:studio
```

## Handling Data Migrations

### Example: Populating New Field

Create a data migration script:

```typescript
// scripts/migrate-data.ts
import { prisma } from '../src/services/prisma';

async function migrateData() {
  // Example: Set default category for existing items
  await prisma.inventoryItem.updateMany({
    where: { category: null },
    data: { category: 'Uncategorized' },
  });
  
  console.log('Data migration completed');
}

migrateData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run it:
```bash
tsx scripts/migrate-data.ts
```

## Rollback Strategies

### Undo Last Migration

```bash
# 1. Identify migration to rollback
npx prisma migrate status --schema=./src/db/schema.prisma

# 2. Manually revert schema changes in schema.prisma

# 3. Create new migration
npm run prisma:migrate
```

### Manual Rollback

```bash
# Connect to database
psql -U username -d mais_inventory

# Run reverse SQL
ALTER TABLE "inventory_items" DROP COLUMN "expiryDate";
```

## Best Practices

### 1. Always Backup Before Migration
```bash
# PostgreSQL backup
pg_dump -U username -d mais_inventory > backup.sql

# Restore if needed
psql -U username -d mais_inventory < backup.sql
```

### 2. Test Migrations in Development
- Create migration in dev environment
- Test with sample data
- Verify application still works
- Then apply to production

### 3. Use Descriptive Migration Names
```bash
# Good names
add_expiry_date_to_inventory
create_category_model
add_phone_number_to_users

# Bad names
migration1
update
fix
```

### 4. Review Generated SQL
Always check the migration SQL before applying:
```bash
# View migration files
ls -la prisma/migrations/
cat prisma/migrations/[timestamp]_[name]/migration.sql
```

### 5. Handle Breaking Changes Carefully

For breaking changes, use a multi-step approach:

**Step 1: Add new field (optional)**
```prisma
model User {
  oldField String?
  newField String?
}
```

**Step 2: Migrate data**
```typescript
// Copy data from oldField to newField
await prisma.user.updateMany({
  data: { newField: prisma.user.fields.oldField },
});
```

**Step 3: Make new field required**
```prisma
model User {
  oldField String? // Keep temporarily
  newField String  // Now required
}
```

**Step 4: Remove old field**
```prisma
model User {
  newField String
}
```

## Common Issues

### Issue: Migration Conflicts
```
Error: Migration conflicts detected
```

**Solution:**
```bash
# Reset migrations (dev only)
npx prisma migrate reset --schema=./src/db/schema.prisma

# Or resolve conflicts manually
npx prisma migrate resolve --schema=./src/db/schema.prisma
```

### Issue: Type Mismatch
```
Error: Type mismatch
```

**Solution:**
- Check field types match database
- Use explicit type casting in migration
- Update validation schemas

### Issue: Foreign Key Constraint
```
Error: Foreign key constraint failed
```

**Solution:**
```prisma
// Use onDelete cascade or setNull
model InventoryItem {
  user User @relation(fields: [enteredBy], references: [id], onDelete: Cascade)
}
```

## Migration Checklist

Before applying migrations to production:

- [ ] Backup database
- [ ] Test migration in development
- [ ] Test migration in staging
- [ ] Review generated SQL
- [ ] Check for breaking changes
- [ ] Update validation schemas
- [ ] Update TypeScript types
- [ ] Test application functionality
- [ ] Prepare rollback plan
- [ ] Schedule maintenance window
- [ ] Monitor after deployment

## Useful Commands

```bash
# View migration status
npx prisma migrate status --schema=./src/db/schema.prisma

# Create migration without applying
npx prisma migrate dev --create-only --schema=./src/db/schema.prisma

# Apply pending migrations
npx prisma migrate deploy --schema=./src/db/schema.prisma

# Reset database (dev only)
npx prisma migrate reset --schema=./src/db/schema.prisma

# Generate Prisma Client
npm run prisma:generate

# Open Prisma Studio
npm run prisma:studio

# Validate schema
npx prisma validate --schema=./src/db/schema.prisma

# Format schema file
npx prisma format --schema=./src/db/schema.prisma
```

## Resources

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Migration Troubleshooting](https://www.prisma.io/docs/guides/migrate/production-troubleshooting)
