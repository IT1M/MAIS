# Prisma Database Setup - Quick Start Guide

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- PostgreSQL database running (local or remote)
- Database connection URL

## 🚀 Quick Setup (3 Steps)

### Step 1: Install Dependencies
```bash
npm install
```

This installs all required packages including:
- `@prisma/client` - Prisma ORM client
- `prisma` - Prisma CLI
- `bcryptjs` - Password hashing
- `zod` - Data validation
- `tsx` - TypeScript execution

### Step 2: Configure Database Connection

Update your `.env` file with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/mais_inventory?schema=public"
```

**Connection String Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

**Example for local PostgreSQL:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mais_inventory?schema=public"
```

### Step 3: Setup Database
```bash
npm run db:setup
```

This single command will:
1. Generate Prisma Client
2. Create database migrations
3. Apply migrations to your database
4. Seed with sample data

## ✅ Verify Setup

After setup completes, you should see:
```
✅ Admin user created: admin@mais.sa
✅ Sample users created
✅ Created 8 sample inventory items
✅ Created default system settings
🎉 Database seed completed successfully!
```

## 🔐 Default Login Credentials

### Admin Account
- **Email:** `admin@mais.sa`
- **Password:** `Admin@123`
- **Role:** ADMIN

### Data Entry Account
- **Email:** `dataentry@mais.sa`
- **Password:** `DataEntry@123`
- **Role:** DATA_ENTRY

### Supervisor Account
- **Email:** `supervisor@mais.sa`
- **Password:** `Supervisor@123`
- **Role:** SUPERVISOR

⚠️ **IMPORTANT:** Change these passwords immediately in production!

## 📊 View Your Data

Open Prisma Studio to browse your database:
```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555` where you can:
- View all tables
- Edit records
- Run queries
- Explore relationships

## 🛠️ Individual Commands

If you prefer to run steps separately:

```bash
# Generate Prisma Client only
npm run prisma:generate

# Create and apply migrations only
npm run prisma:migrate

# Seed database only
npm run prisma:seed
```

## 📁 What Was Created

### Database Schema (`src/db/schema.prisma`)
Complete schema with 6 models:
- **User** - User management with roles
- **InventoryItem** - Product inventory tracking
- **AuditLog** - Activity logging
- **Report** - Report generation
- **Backup** - Backup tracking
- **SystemSettings** - Application configuration

### Prisma Client (`src/services/prisma.ts`)
Singleton Prisma client with:
- Connection pooling
- Query logging (dev mode)
- Graceful shutdown

### Seed Data (`src/db/seed.ts`)
Sample data including:
- 3 users (admin, data entry, supervisor)
- 8 inventory items
- 5 system settings

### Validation (`src/utils/validation.ts`)
Zod schemas for:
- User registration/login
- Inventory item CRUD
- Report generation
- Audit logging
- System settings

### Type Definitions (`src/types/database.ts`)
TypeScript types for:
- All models
- Relations
- Filters
- Pagination

## 🔄 Reset Database

If you need to start fresh:

```bash
# ⚠️ WARNING: This deletes ALL data
npx prisma migrate reset --schema=./src/db/schema.prisma
```

Then run setup again:
```bash
npm run db:setup
```

## 🐛 Troubleshooting

### Error: "Can't reach database server"
- Check if PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Test connection: `psql -h localhost -U postgres`

### Error: "Database does not exist"
Create the database first:
```sql
CREATE DATABASE mais_inventory;
```

### Error: "Prisma Client not found"
Regenerate the client:
```bash
npm run prisma:generate
```

### Error: "Migration failed"
Reset and retry:
```bash
npx prisma migrate reset --schema=./src/db/schema.prisma
npm run db:setup
```

## 📚 Next Steps

1. **Read the documentation:**
   - `DATABASE_SETUP.md` - Comprehensive guide
   - `src/db/README.md` - Database operations guide

2. **Start development:**
   ```bash
   npm run dev
   ```

3. **Test the API:**
   - Login with default credentials
   - Create inventory items
   - Generate reports

4. **Customize:**
   - Update user roles
   - Add custom fields
   - Configure system settings

## 🔗 Useful Links

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Zod Documentation](https://zod.dev)

## 💡 Tips

- Use Prisma Studio for quick data inspection
- Check `src/db/README.md` for query examples
- All passwords are hashed with bcrypt
- Audit logs track all data changes
- Indexes are optimized for common queries

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review error messages carefully
3. Verify your DATABASE_URL is correct
4. Ensure PostgreSQL is running
5. Check the documentation files

---

**Ready to start?** Run `npm run db:setup` and you're good to go! 🚀
