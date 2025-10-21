# API Quick Start Guide

Get up and running with the Medical Inventory Management System API in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Gemini API key (optional, for AI features)

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mais_inventory"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your-gemini-api-key"
NODE_ENV="development"
```

### 3. Setup Database
```bash
# Run migrations
npm run prisma:migrate

# Seed with test data
npm run prisma:seed
```

### 4. Start Development Server
```bash
npm run dev
```

Server will start at `http://localhost:3000`

---

## Quick API Examples

### 1. Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "name": "Admin User",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

### 2. Login
Visit `http://localhost:3000/login` and login with your credentials.

### 3. Create Inventory Item
```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION" \
  -d '{
    "itemName": "Aspirin 500mg",
    "batch": "BATCH-001",
    "quantity": 1000,
    "reject": 5,
    "destination": "MAIS",
    "category": "Medication"
  }'
```

### 4. Get Analytics
```bash
curl http://localhost:3000/api/analytics/summary \
  -H "Cookie: next-auth.session-token=YOUR_SESSION"
```

### 5. Generate AI Insights
```bash
curl -X POST http://localhost:3000/api/analytics/ai-insights \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION" \
  -d '{
    "dataType": "inventory",
    "period": {
      "start": "2025-10-01T00:00:00Z",
      "end": "2025-10-31T23:59:59Z"
    }
  }'
```

---

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/change-password` - Change password

### Inventory
- `GET /api/inventory` - List items (with filters)
- `POST /api/inventory` - Create item
- `PATCH /api/inventory/[id]` - Update item
- `DELETE /api/inventory/[id]` - Delete item
- `POST /api/inventory/batch-import` - Bulk import
- `GET /api/inventory/export` - Export data

### Analytics
- `GET /api/analytics/summary` - Get summary stats
- `GET /api/analytics/trends` - Get trend data
- `POST /api/analytics/ai-insights` - Generate AI insights

### Audit
- `GET /api/audit/logs` - Get audit logs
- `GET /api/audit/user-activity` - Get user activity

### Reports
- `GET /api/reports` - List reports
- `POST /api/reports/generate` - Generate report
- `GET /api/reports/[id]/download` - Download report

### Backups
- `POST /api/backup/create` - Create backup
- `GET /api/backup/list` - List backups

### Settings
- `GET /api/settings` - Get settings
- `PATCH /api/settings` - Update settings

---

## User Roles

1. **DATA_ENTRY** - Create and view inventory
2. **AUDITOR** - View audit logs
3. **SUPERVISOR** - Update/delete inventory
4. **MANAGER** - Generate reports
5. **ADMIN** - Full access

---

## Common Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50, max: 200)
- `sortBy` - Field to sort by
- `sortOrder` - asc or desc

### Filtering
- `search` - Search term
- `destination` - MAIS or FOZAN
- `category` - Category name
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```

---

## Rate Limits

- **Default:** 100 requests per minute per user
- **Exceeded:** Returns 429 status code

---

## Security Features

✅ Session-based authentication  
✅ Role-based access control  
✅ Input validation with Zod  
✅ XSS protection  
✅ Audit logging  
✅ Rate limiting  
✅ CSRF protection  

---

## Testing Tools

### Browser
- Visit `http://localhost:3000` for web interface
- Use browser DevTools to inspect API calls

### Command Line
```bash
# Using cURL
curl -X GET http://localhost:3000/api/inventory \
  -H "Cookie: next-auth.session-token=YOUR_SESSION"
```

### Postman
1. Import API collection
2. Set base URL: `http://localhost:3000`
3. Add session token to cookies

### JavaScript
```javascript
const response = await fetch('http://localhost:3000/api/inventory', {
  headers: {
    'Cookie': 'next-auth.session-token=YOUR_SESSION'
  },
  credentials: 'include'
});
const data = await response.json();
```

---

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U user -d mais_inventory -c "SELECT 1"

# Verify DATABASE_URL in .env.local
```

### Authentication Error
```bash
# Ensure you're logged in
# Check session cookie is valid
# Verify NEXTAUTH_SECRET is set
```

### Gemini API Error
```bash
# Verify GEMINI_API_KEY is valid
# Check API quota
# AI features will gracefully fallback if unavailable
```

---

## Next Steps

1. ✅ Read full [API Documentation](./API_DOCUMENTATION.md)
2. ✅ Review [Testing Guide](./API_TESTING_GUIDE.md)
3. ✅ Explore web interface at `http://localhost:3000`
4. ✅ Check Prisma Studio: `npm run prisma:studio`
5. ✅ Review audit logs in database

---

## Support

For issues or questions:
1. Check documentation files
2. Review error messages in console
3. Inspect database with Prisma Studio
4. Check audit logs for debugging

---

## Production Deployment

Before deploying to production:

1. ✅ Set strong NEXTAUTH_SECRET
2. ✅ Use production database
3. ✅ Set NODE_ENV=production
4. ✅ Configure proper CORS if needed
5. ✅ Set up SSL/TLS
6. ✅ Configure rate limiting
7. ✅ Set up monitoring
8. ✅ Regular backups
9. ✅ Review security settings
10. ✅ Test all endpoints

---

## File Structure

```
src/
├── app/
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts
│       │   └── change-password/route.ts
│       ├── inventory/
│       │   ├── route.ts
│       │   ├── [id]/route.ts
│       │   ├── batch-import/route.ts
│       │   └── export/route.ts
│       ├── analytics/
│       │   ├── summary/route.ts
│       │   ├── trends/route.ts
│       │   └── ai-insights/route.ts
│       ├── audit/
│       │   ├── logs/route.ts
│       │   └── user-activity/route.ts
│       ├── reports/
│       │   ├── route.ts
│       │   ├── generate/route.ts
│       │   └── [id]/download/route.ts
│       ├── backup/
│       │   ├── create/route.ts
│       │   └── list/route.ts
│       └── settings/
│           └── route.ts
├── lib/
│   ├── api-utils.ts
│   └── validation.ts
├── services/
│   ├── gemini.ts
│   └── audit.ts
└── db/
    ├── client.ts
    └── schema.prisma
```

---

Happy coding! 🚀
