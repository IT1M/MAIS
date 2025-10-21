# Database Setup Guide

## Overview
This document provides instructions for setting up the PostgreSQL database with Prisma ORM for the MAIS Inventory System.

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or remote)
- Database connection URL

## Database Schema

### Core Models

#### 1. User Model
- Manages user authentication and authorization
- Fields: id, email, name, password, role, isActive, preferences
- Roles: ADMIN, DATA_ENTRY, SUPERVISOR, MANAGER, AUDITOR
- Indexed on: email

#### 2. InventoryItem Model
- Tracks medical product inventory
- Fields: id, itemName, batch, quantity, reject, destination, category, notes
- Destinations: MAIS, FOZAN
- Indexed on: itemName, batch, createdAt, (itemName + batch), (createdAt + destination)

#### 3. AuditLog Model
- Records all system activities for compliance
- Fields: id, userId, action, entityType, entityId, oldValue, newValue, ipAddress, userAgent, timestamp
- Actions: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT
- Indexed on: (userId + timestamp), (entityType + entityId), timestamp

#### 4. Report Model
- Stores generated reports and AI insights
- Fields: id, title, type, periodStart, periodEnd, generatedBy, fileUrl, dataSnapshot, aiInsights, status
- Types: MONTHLY, YEARLY, CUSTOM, AUDIT
- Indexed on: (type + periodStart), createdAt

#### 5. Backup Model
- Tracks database backups
- Fields: id, fileName, fileSize, fileType, recordCount, storagePath, status
- File types: CSV, JSON, SQL
- Indexed on: createdAt

#### 6. SystemSettings Model
- Stores application configuration
- Fields: id, key, value, category, updatedBy, updatedAt
- Unique constraint on: key

## Setup Instructions

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Database URL
Update your `.env` file with your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/mais_inventory?schema=public"
```

### Step 3: Generate Prisma Client
```bash
npm run prisma:generate
```

### Step 4: Create Initial Migration
```bash
npm run prisma:migrate
```
When prompted, name the migration: `init`

### Step 5: Seed the Database
```bash
npm run prisma:seed
```

### Alternative: Complete Setup (All Steps)
```bash
npm run db:setup
```

## Default Credentials

After seeding, the following users are available:

### Admin User
- Email: `admin@mais.sa`
- Password: `Admin@123`
- Role: ADMIN

### Data Entry User
- Email: `dataentry@mais.sa`
- Password: `DataEntry@123`
- Role: DATA_ENTRY

### Supervisor User
- Email: `supervisor@mais.sa`
- Password: `Supervisor@123`
- Role: SUPERVISOR

**⚠️ IMPORTANT: Change these passwords in production!**

## Sample Data

The seed script creates:
- 3 users (admin, data entry, supervisor)
- 8 sample inventory items
- 5 default system settings

## Prisma Studio

To view and manage your database visually:
```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555`

## Data Validation Rules

### Item Names
- Required
- 2-100 characters
- Trimmed

### Batch Numbers
- Required
- 3-50 characters
- Alphanumeric only (letters, numbers, hyphens, underscores)
- Trimmed

### Quantity
- Required
- Positive integer
- Maximum: 1,000,000

### Reject Count
- Non-negative integer
- Cannot exceed quantity value
- Default: 0

### Email
- Valid email format
- Lowercase
- Trimmed

### Password
- Minimum 8 characters
- Hashed with bcrypt (10 rounds)

## Database Migrations

### Create a New Migration
```bash
npm run prisma:migrate
```

### Reset Database (⚠️ Deletes all data)
```bash
npx prisma migrate reset --schema=./src/db/schema.prisma
```

### View Migration Status
```bash
npx prisma migrate status --schema=./src/db/schema.prisma
```

## Performance Optimization

### Indexes
The schema includes optimized indexes for:
- User lookups by email
- Inventory searches by name and batch
- Time-based queries on audit logs
- Report filtering by type and period

### Connection Pooling
The Prisma client is configured with:
- Singleton pattern to prevent multiple instances
- Query logging in development mode
- Graceful shutdown handling

## Troubleshooting

### Migration Fails
```bash
# Check database connection
npx prisma db pull --schema=./src/db/schema.prisma

# Reset and retry
npx prisma migrate reset --schema=./src/db/schema.prisma
npm run db:setup
```

### Prisma Client Not Found
```bash
npm run prisma:generate
```

### Seed Script Fails
Ensure your database is empty or use:
```bash
npx prisma migrate reset --schema=./src/db/schema.prisma
npm run prisma:seed
```

## Production Considerations

1. **Environment Variables**: Use secure connection strings
2. **Password Security**: Change default passwords immediately
3. **Backup Strategy**: Implement automated backups
4. **Connection Limits**: Configure appropriate pool size
5. **Monitoring**: Enable query logging and performance monitoring
6. **SSL**: Use SSL connections for remote databases

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Next.js with Prisma](https://www.prisma.io/nextjs)
