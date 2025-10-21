# API Documentation

Complete REST API documentation for the Medical Inventory Management System.

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require authentication via NextAuth session cookies.

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword123",
  "role": "DATA_ENTRY" // optional, defaults to DATA_ENTRY
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "DATA_ENTRY",
    "createdAt": "2025-10-20T10:00:00Z"
  }
}
```

### Change Password
```http
POST /api/auth/change-password
Content-Type: application/json

{
  "oldPassword": "currentpassword",
  "newPassword": "newsecurepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

---

## Inventory Management

### List Inventory Items
```http
GET /api/inventory?page=1&limit=50&search=aspirin&destination=MAIS&sortBy=createdAt&sortOrder=desc
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 50, max: 200) - Items per page
- `search` (string) - Search by item name or batch
- `destination` (MAIS | FOZAN) - Filter by destination
- `category` (string) - Filter by category
- `startDate` (ISO date) - Filter from date
- `endDate` (ISO date) - Filter to date
- `sortBy` (string, default: createdAt) - Sort field
- `sortOrder` (asc | desc, default: desc) - Sort direction

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "itemName": "Aspirin 500mg",
        "batch": "BATCH-2025-001",
        "quantity": 1000,
        "reject": 5,
        "destination": "MAIS",
        "category": "Medication",
        "notes": "Store in cool place",
        "enteredBy": "user-uuid",
        "createdAt": "2025-10-20T10:00:00Z",
        "updatedAt": "2025-10-20T10:00:00Z",
        "user": {
          "id": "user-uuid",
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
}
```

### Create Inventory Item
```http
POST /api/inventory
Content-Type: application/json

{
  "itemName": "Aspirin 500mg",
  "batch": "BATCH-2025-001",
  "quantity": 1000,
  "reject": 5,
  "destination": "MAIS",
  "category": "Medication",
  "notes": "Store in cool place"
}
```

**Required Role:** DATA_ENTRY or higher

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "itemName": "Aspirin 500mg",
    "batch": "BATCH-2025-001",
    "quantity": 1000,
    "reject": 5,
    "destination": "MAIS",
    "category": "Medication",
    "notes": "Store in cool place",
    "enteredBy": "user-uuid",
    "createdAt": "2025-10-20T10:00:00Z",
    "updatedAt": "2025-10-20T10:00:00Z",
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Update Inventory Item
```http
PATCH /api/inventory/{id}
Content-Type: application/json

{
  "quantity": 950,
  "notes": "Updated quantity after recount"
}
```

**Required Role:** DATA_ENTRY or higher

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "itemName": "Aspirin 500mg",
    "quantity": 950,
    "notes": "Updated quantity after recount",
    ...
  }
}
```

### Delete Inventory Item
```http
DELETE /api/inventory/{id}
```

**Required Role:** SUPERVISOR or higher

**Response (204):** No content

### Batch Import
```http
POST /api/inventory/batch-import
Content-Type: application/json

{
  "items": [
    {
      "itemName": "Aspirin 500mg",
      "batch": "BATCH-001",
      "quantity": 1000,
      "reject": 5,
      "destination": "MAIS",
      "category": "Medication"
    },
    {
      "itemName": "Paracetamol 250mg",
      "batch": "BATCH-002",
      "quantity": 2000,
      "reject": 10,
      "destination": "FOZAN",
      "category": "Medication"
    }
  ]
}
```

**Required Role:** DATA_ENTRY or higher

**Response (200):**
```json
{
  "success": true,
  "data": {
    "success": 2,
    "failed": 0,
    "errors": []
  }
}
```

### Export Inventory
```http
GET /api/inventory/export?format=csv&destination=MAIS&startDate=2025-01-01&endDate=2025-12-31
```

**Query Parameters:**
- `format` (csv | json | excel, default: csv) - Export format
- `destination` (MAIS | FOZAN) - Filter by destination
- `startDate` (ISO date) - Filter from date
- `endDate` (ISO date) - Filter to date

**Response (200):** File download with appropriate headers

---

## Analytics

### Get Summary
```http
GET /api/analytics/summary
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalItems": 1500,
      "totalQuantity": 50000,
      "totalRejects": 250,
      "rejectRate": 0.5
    },
    "byDestination": [
      {
        "destination": "MAIS",
        "count": 800,
        "quantity": 30000,
        "rejects": 150
      },
      {
        "destination": "FOZAN",
        "count": 700,
        "quantity": 20000,
        "rejects": 100
      }
    ],
    "byCategory": [
      {
        "category": "Medication",
        "count": 1000,
        "quantity": 40000
      },
      {
        "category": "Supplies",
        "count": 500,
        "quantity": 10000
      }
    ],
    "monthlyTrend": [
      {
        "month": "2025-10",
        "count": 150,
        "quantity": 5000
      }
    ]
  }
}
```

### Get Trends
```http
GET /api/analytics/trends?period=30d&groupBy=day
```

**Query Parameters:**
- `period` (7d | 30d | 90d | 1y, default: 30d) - Time period
- `groupBy` (day | week | month, default: day) - Grouping interval

**Response (200):**
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "period": "2025-10-20",
        "count": 50,
        "quantity": 2000,
        "rejects": 10,
        "growthRate": 5.2
      }
    ],
    "peakPeriod": {
      "period": "2025-10-15",
      "quantity": 3000
    },
    "summary": {
      "totalPeriods": 30,
      "averageQuantity": 1800,
      "totalQuantity": 54000
    }
  }
}
```

### Generate AI Insights
```http
POST /api/analytics/ai-insights
Content-Type: application/json

{
  "dataType": "inventory",
  "period": {
    "start": "2025-10-01T00:00:00Z",
    "end": "2025-10-31T23:59:59Z"
  }
}
```

**Data Types:**
- `inventory` - Analyze current inventory patterns
- `trends` - Predict future trends
- `comparison` - Compare periods

**Response (200):**
```json
{
  "success": true,
  "data": {
    "insights": [
      "Medication category shows 15% increase in October",
      "MAIS destination has higher reject rate (0.6%) compared to FOZAN (0.4%)"
    ],
    "recommendations": [
      "Consider increasing stock for high-demand items",
      "Review quality control processes for MAIS destination"
    ],
    "alerts": [
      "Aspirin 500mg approaching low stock threshold"
    ],
    "confidenceScore": 0.85
  }
}
```

---

## Audit Logs

### Get Audit Logs
```http
GET /api/audit/logs?page=1&limit=50&userId=uuid&action=CREATE&entityType=InventoryItem
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 50) - Items per page
- `userId` (uuid) - Filter by user
- `action` (CREATE | UPDATE | DELETE | LOGIN | LOGOUT | EXPORT) - Filter by action
- `entityType` (string) - Filter by entity type
- `startDate` (ISO date) - Filter from date
- `endDate` (ISO date) - Filter to date

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "userId": "user-uuid",
        "action": "CREATE",
        "entityType": "InventoryItem",
        "entityId": "item-uuid",
        "oldValue": null,
        "newValue": { "itemName": "Aspirin 500mg", ... },
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "timestamp": "2025-10-20T10:00:00Z",
        "user": {
          "id": "user-uuid",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "DATA_ENTRY"
        },
        "inventoryItem": {
          "id": "item-uuid",
          "itemName": "Aspirin 500mg",
          "batch": "BATCH-001"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 500,
      "totalPages": 10
    }
  }
}
```

### Get User Activity
```http
GET /api/audit/user-activity
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "activitySummary": [
      {
        "user": {
          "id": "uuid",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "DATA_ENTRY"
        },
        "actions": {
          "CREATE": 150,
          "UPDATE": 75,
          "DELETE": 5
        },
        "totalActions": 230
      }
    ],
    "recentLogins": [
      {
        "id": "uuid",
        "userId": "user-uuid",
        "action": "LOGIN",
        "timestamp": "2025-10-20T09:00:00Z",
        "ipAddress": "192.168.1.1",
        "user": {
          "id": "user-uuid",
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ]
  }
}
```

---

## Reports

### List Reports
```http
GET /api/reports?page=1&limit=50&type=MONTHLY&status=COMPLETED
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 50) - Items per page
- `type` (MONTHLY | YEARLY | CUSTOM | AUDIT) - Filter by type
- `status` (GENERATING | COMPLETED | FAILED) - Filter by status
- `startDate` (ISO date) - Filter from date
- `endDate` (ISO date) - Filter to date

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "title": "Monthly Report - October 2025",
        "type": "MONTHLY",
        "periodStart": "2025-10-01T00:00:00Z",
        "periodEnd": "2025-10-31T23:59:59Z",
        "generatedBy": "user-uuid",
        "fileUrl": "/api/reports/uuid/download",
        "dataSnapshot": { ... },
        "aiInsights": "October showed strong performance...",
        "status": "COMPLETED",
        "createdAt": "2025-10-20T10:00:00Z",
        "user": {
          "id": "user-uuid",
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 25,
      "totalPages": 1
    }
  }
}
```

### Generate Report
```http
POST /api/reports/generate
Content-Type: application/json

{
  "type": "MONTHLY",
  "periodStart": "2025-10-01T00:00:00Z",
  "periodEnd": "2025-10-31T23:59:59Z",
  "includeCharts": true,
  "includeAiInsights": true,
  "title": "October 2025 Monthly Report"
}
```

**Required Role:** SUPERVISOR or higher

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "October 2025 Monthly Report",
    "type": "MONTHLY",
    "status": "COMPLETED",
    "fileUrl": "/api/reports/uuid/download",
    ...
  }
}
```

### Download Report
```http
GET /api/reports/{id}/download
```

**Response (200):** File download (JSON or PDF)

---

## Backups

### Create Backup
```http
POST /api/backup/create
Content-Type: application/json

{
  "fileType": "JSON",
  "includeAudit": true
}
```

**Required Role:** ADMIN

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fileName": "backup-1729425600000.json",
    "fileSize": 1048576,
    "fileType": "JSON",
    "recordCount": 1500,
    "storagePath": "/backups",
    "status": "COMPLETED",
    "createdAt": "2025-10-20T10:00:00Z",
    "createdBy": "user-uuid",
    "user": {
      "id": "user-uuid",
      "name": "Admin User",
      "email": "admin@example.com"
    }
  }
}
```

### List Backups
```http
GET /api/backup/list?page=1&limit=50
```

**Required Role:** ADMIN

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "fileName": "backup-1729425600000.json",
        "fileSize": 1048576,
        "fileType": "JSON",
        "recordCount": 1500,
        "status": "COMPLETED",
        "createdAt": "2025-10-20T10:00:00Z",
        "user": {
          "id": "user-uuid",
          "name": "Admin User",
          "email": "admin@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

---

## Settings

### Get Settings
```http
GET /api/settings
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "general": [
      {
        "key": "app_name",
        "value": "Medical Inventory System",
        "updatedBy": "Admin User",
        "updatedAt": "2025-10-20T10:00:00Z"
      }
    ],
    "notifications": [
      {
        "key": "email_notifications",
        "value": true,
        "updatedBy": "Admin User",
        "updatedAt": "2025-10-20T10:00:00Z"
      }
    ]
  }
}
```

### Update Settings
```http
PATCH /api/settings
Content-Type: application/json

{
  "app_name": "MAIS Inventory System",
  "email_notifications": true,
  "low_stock_threshold": 100
}
```

**Required Role:** ADMIN

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "key": "app_name",
      "value": "MAIS Inventory System",
      "category": "general",
      "updatedBy": "user-uuid",
      "updatedAt": "2025-10-20T10:00:00Z"
    }
  ]
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "field": "email",
      "message": "Invalid email address"
    }
  }
}
```

### Error Codes
- `UNAUTHORIZED` (401) - Authentication required
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (400) - Invalid input data
- `BAD_REQUEST` (400) - Invalid request
- `RATE_LIMIT` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error

---

## Rate Limiting

- **Default:** 100 requests per minute per user
- **Response Header:** `X-RateLimit-Remaining`
- **Exceeded:** Returns 429 status code

---

## Security Features

1. **Authentication:** NextAuth session-based authentication
2. **Authorization:** Role-based access control (RBAC)
3. **Input Validation:** Zod schema validation on all inputs
4. **XSS Protection:** Input sanitization
5. **Audit Logging:** All actions logged with IP and user agent
6. **Rate Limiting:** Per-user request throttling
7. **CSRF Protection:** Built-in with NextAuth

---

## Role Hierarchy

1. **DATA_ENTRY** - Can create and view inventory
2. **AUDITOR** - Can view audit logs
3. **SUPERVISOR** - Can update and delete inventory
4. **MANAGER** - Can generate reports
5. **ADMIN** - Full system access including settings and backups
