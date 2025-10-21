# API Testing Guide

Complete guide for testing the Medical Inventory Management System API.

## Setup

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Ensure Database is Running
```bash
# Check if PostgreSQL is running
psql -U user -d mais_inventory -c "SELECT 1"

# Run migrations if needed
npm run prisma:migrate

# Seed database with test data
npm run prisma:seed
```

### 3. Set Environment Variables
Ensure `.env.local` has:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mais_inventory"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your-gemini-api-key"
```

---

## Testing with cURL

### Authentication

#### Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123",
    "role": "DATA_ENTRY"
  }'
```

#### Login (via NextAuth)
```bash
# Login through the web interface at http://localhost:3000/login
# Then extract the session cookie for API requests
```

#### Change Password
```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "oldPassword": "password123",
    "newPassword": "newpassword456"
  }'
```

---

### Inventory Management

#### Create Inventory Item
```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "itemName": "Aspirin 500mg",
    "batch": "BATCH-2025-001",
    "quantity": 1000,
    "reject": 5,
    "destination": "MAIS",
    "category": "Medication",
    "notes": "Store in cool place"
  }'
```

#### List Inventory Items
```bash
curl -X GET "http://localhost:3000/api/inventory?page=1&limit=10&destination=MAIS" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

#### Update Inventory Item
```bash
curl -X PATCH http://localhost:3000/api/inventory/ITEM_UUID \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "quantity": 950,
    "notes": "Updated after recount"
  }'
```

#### Delete Inventory Item
```bash
curl -X DELETE http://localhost:3000/api/inventory/ITEM_UUID \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

#### Batch Import
```bash
curl -X POST http://localhost:3000/api/inventory/batch-import \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "items": [
      {
        "itemName": "Paracetamol 250mg",
        "batch": "BATCH-002",
        "quantity": 2000,
        "reject": 10,
        "destination": "FOZAN",
        "category": "Medication"
      },
      {
        "itemName": "Bandages",
        "batch": "BATCH-003",
        "quantity": 500,
        "reject": 2,
        "destination": "MAIS",
        "category": "Supplies"
      }
    ]
  }'
```

#### Export Inventory
```bash
# Export as CSV
curl -X GET "http://localhost:3000/api/inventory/export?format=csv&destination=MAIS" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -o inventory-export.csv

# Export as JSON
curl -X GET "http://localhost:3000/api/inventory/export?format=json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -o inventory-export.json
```

---

### Analytics

#### Get Summary
```bash
curl -X GET http://localhost:3000/api/analytics/summary \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

#### Get Trends
```bash
curl -X GET "http://localhost:3000/api/analytics/trends?period=30d&groupBy=day" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

#### Generate AI Insights
```bash
curl -X POST http://localhost:3000/api/analytics/ai-insights \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "dataType": "inventory",
    "period": {
      "start": "2025-10-01T00:00:00Z",
      "end": "2025-10-31T23:59:59Z"
    }
  }'
```

---

### Audit Logs

#### Get Audit Logs
```bash
curl -X GET "http://localhost:3000/api/audit/logs?page=1&limit=20&action=CREATE" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

#### Get User Activity
```bash
curl -X GET http://localhost:3000/api/audit/user-activity \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

---

### Reports

#### Generate Report
```bash
curl -X POST http://localhost:3000/api/reports/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "type": "MONTHLY",
    "periodStart": "2025-10-01T00:00:00Z",
    "periodEnd": "2025-10-31T23:59:59Z",
    "includeCharts": true,
    "includeAiInsights": true,
    "title": "October 2025 Report"
  }'
```

#### List Reports
```bash
curl -X GET "http://localhost:3000/api/reports?page=1&limit=10&type=MONTHLY" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

#### Download Report
```bash
curl -X GET http://localhost:3000/api/reports/REPORT_UUID/download \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -o report.json
```

---

### Backups

#### Create Backup
```bash
curl -X POST http://localhost:3000/api/backup/create \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "fileType": "JSON",
    "includeAudit": true
  }'
```

#### List Backups
```bash
curl -X GET "http://localhost:3000/api/backup/list?page=1&limit=10" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

---

### Settings

#### Get Settings
```bash
curl -X GET http://localhost:3000/api/settings \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

#### Update Settings
```bash
curl -X PATCH http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "app_name": "MAIS Inventory System",
    "email_notifications": true,
    "low_stock_threshold": 100
  }'
```

---

## Testing with Postman

### 1. Import Collection

Create a new Postman collection with the following structure:

```
Medical Inventory API
├── Auth
│   ├── Register
│   ├── Change Password
├── Inventory
│   ├── List Items
│   ├── Create Item
│   ├── Update Item
│   ├── Delete Item
│   ├── Batch Import
│   └── Export
├── Analytics
│   ├── Summary
│   ├── Trends
│   └── AI Insights
├── Audit
│   ├── Logs
│   └── User Activity
├── Reports
│   ├── Generate
│   ├── List
│   └── Download
├── Backups
│   ├── Create
│   └── List
└── Settings
    ├── Get
    └── Update
```

### 2. Set Environment Variables

Create a Postman environment with:
- `base_url`: `http://localhost:3000`
- `session_token`: (set after login)

### 3. Authentication Flow

1. Register a user via `/api/auth/register`
2. Login through the web interface
3. Extract session cookie from browser DevTools
4. Add to Postman environment as `session_token`

---

## Testing with JavaScript/Fetch

### Example Test Suite

```javascript
// test-api.js
const BASE_URL = 'http://localhost:3000/api';
let sessionToken = '';

async function testRegister() {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
      role: 'DATA_ENTRY'
    })
  });
  
  const data = await response.json();
  console.log('Register:', data);
  return data;
}

async function testCreateInventory() {
  const response = await fetch(`${BASE_URL}/inventory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `next-auth.session-token=${sessionToken}`
    },
    credentials: 'include',
    body: JSON.stringify({
      itemName: 'Aspirin 500mg',
      batch: 'BATCH-2025-001',
      quantity: 1000,
      reject: 5,
      destination: 'MAIS',
      category: 'Medication'
    })
  });
  
  const data = await response.json();
  console.log('Create Inventory:', data);
  return data;
}

async function testGetAnalytics() {
  const response = await fetch(`${BASE_URL}/analytics/summary`, {
    headers: {
      'Cookie': `next-auth.session-token=${sessionToken}`
    },
    credentials: 'include'
  });
  
  const data = await response.json();
  console.log('Analytics Summary:', data);
  return data;
}

// Run tests
async function runTests() {
  try {
    await testRegister();
    // Set sessionToken from login
    await testCreateInventory();
    await testGetAnalytics();
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTests();
```

---

## Common Test Scenarios

### 1. Complete Inventory Workflow
```bash
# 1. Create item
ITEM_ID=$(curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{"itemName":"Test Item","batch":"TEST-001","quantity":100,"reject":0,"destination":"MAIS"}' \
  | jq -r '.data.id')

# 2. Update item
curl -X PATCH http://localhost:3000/api/inventory/$ITEM_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{"quantity":90}'

# 3. View item
curl -X GET "http://localhost:3000/api/inventory?search=Test Item" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"

# 4. Delete item
curl -X DELETE http://localhost:3000/api/inventory/$ITEM_ID \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

### 2. Analytics Pipeline
```bash
# 1. Get summary
curl -X GET http://localhost:3000/api/analytics/summary \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"

# 2. Get trends
curl -X GET "http://localhost:3000/api/analytics/trends?period=30d" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"

# 3. Generate AI insights
curl -X POST http://localhost:3000/api/analytics/ai-insights \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{"dataType":"inventory","period":{"start":"2025-10-01T00:00:00Z","end":"2025-10-31T23:59:59Z"}}'
```

### 3. Report Generation
```bash
# 1. Generate report
REPORT_ID=$(curl -X POST http://localhost:3000/api/reports/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{"type":"MONTHLY","periodStart":"2025-10-01T00:00:00Z","periodEnd":"2025-10-31T23:59:59Z","includeAiInsights":true}' \
  | jq -r '.data.id')

# 2. Check report status
curl -X GET "http://localhost:3000/api/reports?page=1&limit=1" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"

# 3. Download report
curl -X GET http://localhost:3000/api/reports/$REPORT_ID/download \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -o report.json
```

---

## Error Testing

### Test Invalid Input
```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "itemName": "",
    "quantity": -10
  }'
# Expected: 400 VALIDATION_ERROR
```

### Test Unauthorized Access
```bash
curl -X GET http://localhost:3000/api/inventory
# Expected: 401 UNAUTHORIZED
```

### Test Insufficient Permissions
```bash
# As DATA_ENTRY user, try to delete
curl -X DELETE http://localhost:3000/api/inventory/ITEM_UUID \
  -H "Cookie: next-auth.session-token=$DATA_ENTRY_TOKEN"
# Expected: 403 FORBIDDEN
```

### Test Rate Limiting
```bash
# Send 101 requests rapidly
for i in {1..101}; do
  curl -X GET http://localhost:3000/api/inventory \
    -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
done
# Expected: 429 RATE_LIMIT on 101st request
```

---

## Performance Testing

### Load Test with Apache Bench
```bash
# Test inventory listing endpoint
ab -n 1000 -c 10 -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  http://localhost:3000/api/inventory

# Test analytics endpoint
ab -n 500 -c 5 -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  http://localhost:3000/api/analytics/summary
```

---

## Troubleshooting

### Issue: Session Cookie Not Working
**Solution:** Ensure you're using the correct cookie name and value from browser DevTools.

### Issue: CORS Errors
**Solution:** API routes in Next.js don't have CORS issues when accessed from the same domain.

### Issue: Database Connection Errors
**Solution:** Check PostgreSQL is running and DATABASE_URL is correct.

### Issue: Gemini API Errors
**Solution:** Verify GEMINI_API_KEY is valid and has quota remaining.

---

## Best Practices

1. **Always test with valid session tokens**
2. **Use proper HTTP methods (GET, POST, PATCH, DELETE)**
3. **Include Content-Type header for JSON requests**
4. **Check response status codes**
5. **Validate response structure matches documentation**
6. **Test error scenarios**
7. **Monitor rate limits**
8. **Clean up test data after testing**
