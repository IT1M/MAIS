# Design Document

## Overview

تصميم صفحة تسجيل الدخول الرئيسية لنظام إدارة المخزون الطبي لشركة السعودية مايس. الصفحة ستكون نقطة الدخول الأساسية للنظام وتستخدم NextAuth.js للمصادقة مع قاعدة بيانات PostgreSQL.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  Login Page     │
│  (Client)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  NextAuth API   │
│  /api/auth      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Auth Service   │
│  (Credentials)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Prisma Client  │
│  (Database)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PostgreSQL     │
│  (Users Table)  │
└─────────────────┘
```

### Technology Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js v5
- **Database**: PostgreSQL with Prisma ORM
- **Password Hashing**: bcryptjs
- **Internationalization**: next-intl
- **Form Handling**: React Hook Form (optional) or native form handling

## Components and Interfaces

### 1. Login Page Component

**Location**: `src/app/[locale]/login/page.tsx`

**Purpose**: صفحة تسجيل الدخول الرئيسية مع دعم اللغتين

**Props**: None (uses locale from URL params)

**State**:
```typescript
interface LoginFormState {
  email: string;
  password: string;
  showPassword: boolean;
  isLoading: boolean;
  error: string | null;
}
```

**Features**:
- نموذج تسجيل دخول مع حقول البريد الإلكتروني وكلمة المرور
- زر إظهار/إخفاء كلمة المرور
- رسائل خطأ واضحة
- مؤشر تحميل أثناء المصادقة
- دعم الإرسال عبر Enter key
- تصميم متجاوب

### 2. Login Form Component

**Location**: `src/components/auth/LoginForm.tsx`

**Purpose**: نموذج تسجيل الدخول القابل لإعادة الاستخدام

**Props**:
```typescript
interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  callbackUrl?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}
```

**Validation Rules**:
- Email: required, valid email format
- Password: required, minimum 6 characters

### 3. Database Seeding Script

**Location**: `src/db/seed-admin.ts`

**Purpose**: إنشاء حساب المدير الأعلى

**Function**:
```typescript
async function seedSuperAdmin() {
  const email = 'yazeed@mais.com';
  const password = 'Yazeed12345';
  const name = 'Yazeed';
  
  // Check if user exists
  // If not, create with hashed password
  // Set role to ADMIN
  // Set isActive to true
}
```

### 4. Enhanced Auth Service

**Location**: `src/services/auth.ts` (existing, needs enhancement)

**Enhancements**:
- Add audit logging for login attempts
- Add IP address and user agent tracking
- Add account status check (isActive)
- Add better error messages

**New Functions**:
```typescript
async function logLoginAttempt(
  userId: string | null,
  email: string,
  success: boolean,
  ipAddress: string,
  userAgent: string
): Promise<void>

async function checkUserStatus(userId: string): Promise<boolean>
```

### 5. Audit Logging Service

**Location**: `src/services/audit.ts` (existing, needs enhancement)

**New Functions**:
```typescript
async function logLogin(
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<void>

async function logLogout(
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<void>

async function logFailedLogin(
  email: string,
  reason: string,
  ipAddress: string,
  userAgent: string
): Promise<void>
```

## Data Models

### User Model (Existing)

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String
  password      String    // bcrypt hashed
  role          UserRole  @default(DATA_ENTRY)
  isActive      Boolean   @default(true)
  preferences   Json?     @default("{}")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### AuditLog Model (Existing)

```prisma
model AuditLog {
  id            String       @id @default(uuid())
  userId        String
  action        AuditAction  // LOGIN, LOGOUT
  entityType    String       // "AUTH"
  entityId      String?
  oldValue      Json?
  newValue      Json?
  ipAddress     String?
  userAgent     String?
  timestamp     DateTime     @default(now())
}
```

## User Interface Design

### Login Page Layout

```
┌─────────────────────────────────────┐
│                                     │
│         [Language Selector]         │
│                                     │
│     ┌─────────────────────────┐    │
│     │                         │    │
│     │   Saudi Mais Co.        │    │
│     │   Medical Products      │    │
│     │   Inventory Management  │    │
│     │                         │    │
│     │   ┌─────────────────┐   │    │
│     │   │ Email           │   │    │
│     │   └─────────────────┘   │    │
│     │                         │    │
│     │   ┌─────────────────┐   │    │
│     │   │ Password    [👁] │   │    │
│     │   └─────────────────┘   │    │
│     │                         │    │
│     │   [Error Message]       │    │
│     │                         │    │
│     │   ┌─────────────────┐   │    │
│     │   │  تسجيل الدخول   │   │    │
│     │   └─────────────────┘   │    │
│     │                         │    │
│     └─────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### Responsive Design

- **Desktop**: مركز في الشاشة، عرض 400-500px
- **Tablet**: مركز في الشاشة، عرض 90%
- **Mobile**: ملء الشاشة مع padding مناسب

### Color Scheme

- Primary: Blue (#3B82F6)
- Background: White/Dark mode support
- Error: Red (#EF4444)
- Success: Green (#10B981)

### RTL Support

- دعم كامل للغة العربية مع RTL
- تبديل تلقائي للاتجاه بناءً على اللغة المختارة
- استخدام next-intl للترجمة

## Error Handling

### Client-Side Errors

1. **Validation Errors**:
   - Email format invalid
   - Password too short
   - Empty fields

2. **Display Strategy**:
   - Inline error messages below fields
   - Red border on invalid fields
   - Clear error messages in user's language

### Server-Side Errors

1. **Authentication Errors**:
   - Invalid credentials
   - Account inactive
   - Account not found
   - Database connection error

2. **Error Messages** (Localized):
   ```typescript
   const errorMessages = {
     en: {
       invalidCredentials: 'Invalid email or password',
       accountInactive: 'Your account has been deactivated',
       serverError: 'An error occurred. Please try again',
     },
     ar: {
       invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
       accountInactive: 'تم تعطيل حسابك',
       serverError: 'حدث خطأ. يرجى المحاولة مرة أخرى',
     },
   };
   ```

### Audit Logging for Errors

- Log all failed login attempts
- Include email, IP address, timestamp
- Include reason for failure
- Do not log passwords

## Security Considerations

### Password Security

1. **Hashing**: bcryptjs with salt rounds = 10
2. **Storage**: Never store plain text passwords
3. **Transmission**: HTTPS only in production

### Session Security

1. **JWT Strategy**: Secure, httpOnly cookies
2. **Session Duration**: Configurable (default 7 days)
3. **Token Refresh**: Automatic on activity

### Rate Limiting

1. **Login Attempts**: Consider implementing rate limiting (future enhancement)
2. **IP-based**: Track failed attempts per IP
3. **Account-based**: Lock account after X failed attempts (future enhancement)

### CSRF Protection

- NextAuth.js handles CSRF tokens automatically
- Ensure proper configuration in production

## Testing Strategy

### Unit Tests

1. **LoginForm Component**:
   - Test form validation
   - Test submit handler
   - Test error display
   - Test loading state

2. **Auth Service**:
   - Test credential validation
   - Test password comparison
   - Test user lookup
   - Test audit logging

### Integration Tests

1. **Login Flow**:
   - Test successful login
   - Test failed login
   - Test redirect after login
   - Test session creation

2. **Database Operations**:
   - Test user query
   - Test audit log creation
   - Test super admin seeding

### E2E Tests (Optional)

1. **Complete Login Flow**:
   - Navigate to login page
   - Enter credentials
   - Submit form
   - Verify redirect to dashboard

## Internationalization

### Translation Keys

```json
{
  "login": {
    "title": "تسجيل الدخول",
    "email": "البريد الإلكتروني",
    "password": "كلمة المرور",
    "submit": "تسجيل الدخول",
    "showPassword": "إظهار كلمة المرور",
    "hidePassword": "إخفاء كلمة المرور"
  }
}
```

### Locale Detection

- Use URL parameter: `/ar/login` or `/en/login`
- Default to Arabic if not specified
- Store preference in cookie

## Performance Considerations

### Optimization Strategies

1. **Code Splitting**: Login page as separate chunk
2. **Image Optimization**: Use Next.js Image component for logos
3. **CSS**: Tailwind CSS with purging
4. **Bundle Size**: Minimize dependencies

### Loading States

1. **Initial Load**: Show page skeleton
2. **Form Submission**: Disable button, show spinner
3. **Redirect**: Show loading indicator

## Deployment Considerations

### Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key
```

### Database Migration

1. Run Prisma migrations
2. Run seed script for super admin
3. Verify user table structure

### Initial Setup Script

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed super admin
npm run seed:admin
```

## Future Enhancements

1. **Two-Factor Authentication**: Add 2FA support
2. **Password Reset**: Forgot password functionality
3. **Social Login**: Google, Microsoft authentication
4. **Remember Me**: Extended session option
5. **Login History**: Show user's recent login activity
6. **Account Lockout**: After multiple failed attempts
7. **Password Strength Meter**: Visual feedback on password strength
