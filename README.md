# Saudi Mais Co. - Inventory Management System

A comprehensive bilingual (English/Arabic) inventory management system for medical products with AI-powered insights, audit logging, and automated backups.

## Features

- 🌍 **Bilingual Support**: Full English and Arabic localization with RTL support
- 📊 **Analytics Dashboard**: Real-time inventory analytics with AI insights
- 📝 **Data Entry & Logging**: Comprehensive inventory tracking
- 🔍 **Audit Trail**: Complete audit logging for all operations
- 💾 **Automated Backups**: Scheduled backups with health monitoring
- 📈 **Report Generation**: Automated report generation and export
- 🔐 **Authentication**: Secure authentication with NextAuth
- 🎨 **Dark Mode**: Full dark mode support
- 📱 **Responsive**: Mobile-first responsive design

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth v5
- **Internationalization**: next-intl
- **AI**: Google Gemini AI
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mais-inventory
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- Database URL
- NextAuth secret and URL
- Gemini API key
- Other configuration options

4. Set up the database:
```bash
npm run db:setup
```

This will:
- Generate Prisma client
- Run migrations
- Seed initial data

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run validate-translations` - Validate translation files
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run db:setup` - Set up database (migrate + seed)

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── [locale]/          # Localized routes
│   │   │   ├── analytics/     # Analytics dashboard
│   │   │   ├── audit/         # Audit log
│   │   │   ├── backup/        # Backup management
│   │   │   ├── data-entry/    # Data entry form
│   │   │   └── data-log/      # Data log viewer
│   │   └── api/               # API routes
│   ├── components/            # React components
│   ├── db/                    # Database schema and migrations
│   ├── i18n/                  # Internationalization config
│   ├── lib/                   # Utility libraries
│   ├── services/              # Business logic services
│   ├── styles/                # Global styles
│   ├── types/                 # TypeScript types
│   └── utils/                 # Utility functions
├── messages/                  # Translation files
│   ├── en.json               # English translations
│   └── ar.json               # Arabic translations
├── scripts/                   # Utility scripts
└── public/                    # Static assets
```

## Internationalization

The application supports English and Arabic with full RTL support for Arabic.

### Adding Translations

1. Add keys to both `messages/en.json` and `messages/ar.json`
2. Run `npm run validate-translations` to ensure sync
3. Use translations in components:

```tsx
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('common');
  return <h1>{t('appName')}</h1>;
}
```

### Language Switching

Users can switch languages using the language switcher in the navigation bar. The selected language is persisted and the entire UI updates accordingly.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Configure environment variables (see `.env.production.example`)
4. Deploy

For detailed deployment instructions, see [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

### Environment Variables

Required environment variables for production:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Random secret (32+ characters)
- `GEMINI_API_KEY` - Google Gemini API key
- `NEXT_PUBLIC_APP_URL` - Public application URL

See `.env.example` for all available options.

## Database

The application uses PostgreSQL with Prisma ORM.

### Running Migrations

```bash
# Development
npm run prisma:migrate

# Production
npm run prisma:migrate:deploy
```

### Viewing Database

```bash
npm run prisma:studio
```

## Authentication

The system uses NextAuth v5 for authentication. Default credentials (development):

- Email: admin@mais.sa
- Password: admin123

**Important**: Change default credentials in production!

## AI Features

The system integrates Google Gemini AI for:
- Inventory insights and predictions
- Anomaly detection
- Trend analysis
- Automated recommendations

Configure with `GEMINI_API_KEY` environment variable.

## Backup & Reports

- Automated daily backups
- Manual backup creation
- Backup health monitoring
- Report generation (PDF/Excel)
- Backup restoration

## Security

- Secure authentication with NextAuth
- CSRF protection
- Rate limiting on API routes
- Security headers configured
- Environment variable validation
- SQL injection protection via Prisma

## Performance

- Server-side rendering (SSR)
- Static generation where applicable
- Image optimization
- Code splitting
- Lazy loading
- Database connection pooling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - Saudi Mais Co.

## Support

For support, contact: support@mais.sa
