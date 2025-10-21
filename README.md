# Saudi Mais Co. - Medical Products Inventory Management System

A production-ready Next.js 15 application with TailwindCSS, Prisma ORM, NextAuth authentication, and Gemini AI integration.

## Features

- **Next.js 15** with App Router architecture
- **TailwindCSS** with custom Saudi Mais branding
- **Prisma ORM** for database management
- **NextAuth v5** for authentication with role-based access control
- **Gemini AI** integration for inventory insights and predictions
- **Dark/Light mode** with persistent theme preference
- **Internationalization** ready with next-intl
- **TypeScript** with strict mode enabled
- **Zod** for runtime validation

## User Roles

- **Admin**: Full system access
- **Manager**: Read, write, and view reports
- **Supervisor**: Read, write, and view reports
- **Data Entry**: Read and write access
- **Auditor**: Read-only and view reports

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Gemini API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env.local`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/mais_inventory"
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   GEMINI_API_KEY="your-gemini-api-key"
   NODE_ENV="development"
   ```

4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

5. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
/src
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   ├── forms/       # Form components
│   └── layout/      # Navigation, sidebar, header
├── services/        # External service integrations
│   ├── gemini.ts    # Gemini AI client
│   ├── prisma.ts    # Prisma client singleton
│   └── auth.ts      # NextAuth configuration
├── db/              # Database schema
│   └── schema.prisma
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
└── styles/          # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Gemini AI Features

The system includes AI-powered features:

- **Inventory Trend Analysis**: Analyze patterns and trends in inventory data
- **Predictive Insights**: Generate actionable insights for optimization
- **Stock Prediction**: Predict future stock needs based on historical data

## License

Private - Saudi Mais Co.
