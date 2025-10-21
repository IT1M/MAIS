# Setup Guide - Saudi Mais Co. Inventory Management System

## Initial Setup Complete ✓

The foundational architecture has been successfully initialized with:

- ✅ Next.js 15 with App Router
- ✅ TailwindCSS with Saudi Mais branding (Teal/Medical blue theme)
- ✅ Prisma ORM configured
- ✅ NextAuth v5 authentication setup
- ✅ Gemini AI integration
- ✅ Dark/Light mode support
- ✅ TypeScript with strict mode
- ✅ Role-based access control (Admin, Manager, Supervisor, Data Entry, Auditor)

## Next Steps

### 1. Database Setup

You need to set up a PostgreSQL database. Update the `DATABASE_URL` in `.env.local`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/mais_inventory?schema=public"
```

Then run migrations:

```bash
npm run prisma:migrate
```

### 2. Generate NextAuth Secret

Generate a secure secret for NextAuth:

```bash
openssl rand -base64 32
```

Update `NEXTAUTH_SECRET` in `.env.local` with the generated value.

### 3. Create First Admin User

You'll need to create your first admin user directly in the database. Here's a sample SQL script:

```sql
-- First, hash your password using bcrypt (rounds: 10)
-- Example: password "admin123" hashed
INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  'admin-001',
  'admin@saudimais.com',
  'System Administrator',
  '$2a$10$YourHashedPasswordHere',
  'ADMIN',
  NOW(),
  NOW()
);
```

Or use Prisma Studio:

```bash
npm run prisma:studio
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
/src
├── app/
│   ├── api/auth/[...nextauth]/  # NextAuth API routes
│   ├── dashboard/               # Dashboard pages
│   ├── login/                   # Login page
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page (redirects)
├── components/
│   ├── ui/                     # Button, Card, Input components
│   ├── forms/                  # Form components (empty, ready for implementation)
│   └── layout/                 # ThemeToggle component
├── services/
│   ├── auth.ts                 # NextAuth configuration
│   ├── gemini.ts               # Gemini AI client with rate limiting
│   └── prisma.ts               # Prisma client singleton
├── db/
│   └── schema.prisma           # Database schema
├── utils/
│   ├── validators.ts           # Zod schemas
│   ├── formatters.ts           # Currency, date formatters
│   ├── constants.ts            # App constants
│   └── cn.ts                   # Tailwind class merger
├── types/
│   └── index.ts                # TypeScript types
└── styles/
    └── globals.css             # Global styles with theme variables
```

## Available Commands

```bash
# Development
npm run dev                    # Start dev server

# Build
npm run build                  # Build for production
npm run start                  # Start production server

# Database
npm run prisma:generate        # Generate Prisma client
npm run prisma:migrate         # Run migrations
npm run prisma:studio          # Open Prisma Studio GUI

# Code Quality
npm run lint                   # Run ESLint
```

## Environment Variables

Required variables in `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mais_inventory?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Gemini AI (Already configured)
GEMINI_API_KEY="AIzaSyCV3Kb2rHMQoyAiYkrAFA82UlcGbYAAC0M"

# Environment
NODE_ENV="development"
```

## Gemini AI Features

Three AI functions are ready to use:

1. **analyzeInventoryTrends(data)** - Analyze patterns in inventory
2. **generateInsights(data)** - Generate actionable insights
3. **predictStockNeeds(data)** - Predict future stock requirements

Example usage:

```typescript
import { analyzeInventoryTrends } from '@/services/gemini';

const insights = await analyzeInventoryTrends({
  items: inventoryData,
  period: '30days'
});
```

## User Roles & Permissions

| Role | Permissions |
|------|------------|
| **ADMIN** | Full access: read, write, delete, manage users, view reports |
| **MANAGER** | Read, write, view reports |
| **SUPERVISOR** | Read, write, view reports |
| **DATA_ENTRY** | Read, write |
| **AUDITOR** | Read-only, view reports |

## Theme Configuration

The app uses a custom color palette:

- **Primary**: Teal/Medical blue (`hsl(174 72% 40%)`)
- **Accent**: Green for success states (`hsl(142 76% 36%)`)
- **Destructive**: Red for errors (`hsl(0 84.2% 60.2%)`)
- **Dark mode**: Fully supported with persistent preference

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT-based sessions
- ✅ Route protection middleware
- ✅ Role-based access control
- ✅ Environment variable validation
- ✅ Rate limiting on AI requests

## Next Development Phase

Ready to implement:

1. Complete login/registration forms
2. Inventory CRUD operations
3. Dashboard with real data
4. Reports and analytics
5. User management interface
6. Internationalization (Arabic/English)
7. Advanced AI features integration

## Support

For issues or questions, refer to:
- Next.js docs: https://nextjs.org/docs
- Prisma docs: https://www.prisma.io/docs
- NextAuth docs: https://authjs.dev
- Gemini AI docs: https://ai.google.dev/docs
