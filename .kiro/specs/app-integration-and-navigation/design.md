# Design Document

## Overview

This design document outlines the architecture and implementation strategy for integrating all existing pages (Dashboard, Data Entry, Data Log, Analytics, Backup, Audit, Settings) into a cohesive web application with professional navigation, responsive sidebar, role-based routing, and production-ready polish.

The system will provide a consistent user experience across all pages with:
- **MainLayout component** wrapping all authenticated pages
- **Responsive sidebar navigation** with collapse/expand functionality
- **Top header** with breadcrumbs, notifications, language switcher, and user menu
- **Role-based access control** enforced at the routing level
- **Smooth transitions** and loading states
- **Comprehensive error handling** and success feedback
- **Full accessibility** support with keyboard navigation
- **RTL support** for Arabic language
- **Performance optimizations** for production deployment

## Architecture

### Component Hierarchy

```
MainLayout
├── Sidebar
│   ├── SidebarHeader (Logo + Collapse Button)
│   ├── SidebarNav (Navigation Items)
│   └── SidebarFooter (User Profile + Quick Actions)
├── Header
│   ├── HamburgerMenu (Mobile Only)
│   ├── Breadcrumbs
│   ├── GlobalSearch (Optional)
│   └── HeaderActions
│       ├── NotificationBell
│       ├── LanguageSwitcher
│       ├── ThemeToggle
│       └── UserMenu
├── MainContent
│   └── {children} (Page Content)
└── Footer (Optional)
```

### State Management Architecture

```
AppProvider (Context)
├── User Session State
├── Sidebar Collapsed State
├── Theme State (next-themes)
├── Locale State (next-intl)
└── Notifications State

NotificationProvider (Context)
├── Notifications Array
├── Unread Count
├── Mark as Read Function
└── Add Notification Function
```

### Routing Architecture

```
middleware.ts
├── Internationalization (next-intl)
├── Authentication Check (next-auth)
└── Role-Based Access Control

Protected Routes
├── /[locale]/dashboard (ALL roles)
├── /[locale]/data-entry (ADMIN, SUPERVISOR, DATA_ENTRY)
├── /[locale]/data-log (ADMIN, SUPERVISOR, MANAGER, DATA_ENTRY, AUDITOR)
├── /[locale]/analytics (ADMIN, SUPERVISOR, MANAGER, AUDITOR)
├── /[locale]/backup (ADMIN, MANAGER)
├── /[locale]/audit (ADMIN, AUDITOR)
└── /[locale]/settings (ALL roles, sub-pages restricted)
```

## Components and Interfaces

### 1. MainLayout Component

**File:** `/src/components/layout/MainLayout.tsx`

**Purpose:** Root layout wrapper for all authenticated pages

**Props Interface:**
```typescript
interface MainLayoutProps {
  children: React.ReactNode;
}
```

**State:**
```typescript
const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
```

**Key Features:**
- Responsive grid layout with sidebar and main content
- Persist sidebar state in localStorage
- Handle mobile menu overlay
- Provide layout context to child components


### 2. Sidebar Component

**File:** `/src/components/layout/Sidebar.tsx`

**Props Interface:**
```typescript
interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}
```

**Navigation Configuration:**
```typescript
interface NavigationItem {
  id: string;
  label: Record<string, string>; // { en: string, ar: string }
  icon: LucideIcon;
  href: string;
  roles: UserRole[];
  badge?: string | number;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: { en: 'Dashboard', ar: 'لوحة التحكم' },
    icon: LayoutDashboard,
    href: '/dashboard',
    roles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'DATA_ENTRY', 'AUDITOR']
  },
  {
    id: 'data-entry',
    label: { en: 'Data Entry', ar: 'إدخال البيانات' },
    icon: ClipboardEdit,
    href: '/data-entry',
    roles: ['ADMIN', 'SUPERVISOR', 'DATA_ENTRY'],
    badge: 'NEW'
  },
  // ... more items
];
```

**Styling:**
- Width: 280px (expanded), 72px (collapsed)
- Background: `bg-white dark:bg-slate-900`
- Border: `border-r border-gray-200 dark:border-gray-800`
- Transition: `transition-all duration-300 ease-in-out`

**Mobile Behavior:**
- Full-height overlay with backdrop
- Slide animation from left (LTR) or right (RTL)
- Close on backdrop click or navigation

### 3. Header Component

**File:** `/src/components/layout/Header.tsx`

**Props Interface:**
```typescript
interface HeaderProps {
  onMobileMenuToggle: () => void;
}
```

**Layout:**
```typescript
<header className="sticky top-0 z-40 h-16 border-b bg-background">
  <div className="flex h-full items-center justify-between px-4">
    {/* Left Section */}
    <div className="flex items-center gap-4">
      <HamburgerButton /> {/* Mobile only */}
      <Breadcrumbs />
    </div>
    
    {/* Right Section */}
    <div className="flex items-center gap-3">
      <NotificationBell />
      <LanguageSwitcher />
      <ThemeToggle />
      <UserMenu />
    </div>
  </div>
</header>
```

### 4. Breadcrumbs Component

**File:** `/src/components/layout/Breadcrumbs.tsx`

**Interface:**
```typescript
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}
```

**Dynamic Generation:**
```typescript
function generateBreadcrumbs(pathname: string, locale: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: t('home'), href: `/${locale}/dashboard` }
  ];
  
  // Map segments to readable labels
  const labelMap: Record<string, Record<string, string>> = {
    'data-entry': { en: 'Data Entry', ar: 'إدخال البيانات' },
    'data-log': { en: 'Data Log', ar: 'سجل البيانات' },
    // ... more mappings
  };
  
  // Build breadcrumb trail
  // ...
  
  return breadcrumbs;
}
```

### 5. NotificationBell Component

**File:** `/src/components/layout/NotificationBell.tsx`

**State:**
```typescript
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

const [notifications, setNotifications] = useState<Notification[]>([]);
const [unreadCount, setUnreadCount] = useState(0);
const [dropdownOpen, setDropdownOpen] = useState(false);
```

**Dropdown UI:**
- Max height: 400px with scroll
- Show last 10 notifications
- "Mark all as read" button
- "View all" link to notifications page
- Empty state when no notifications

### 6. UserMenu Component

**File:** `/src/components/layout/UserMenu.tsx`

**Menu Items:**
```typescript
const menuItems = [
  { icon: User, label: { en: 'Profile', ar: 'الملف الشخصي' }, href: '/settings/profile' },
  { icon: Activity, label: { en: 'My Activity', ar: 'نشاطي' }, href: '/audit?user=me' },
  { icon: Settings, label: { en: 'Settings', ar: 'الإعدادات' }, href: '/settings' },
  { icon: HelpCircle, label: { en: 'Help', ar: 'المساعدة' }, href: '/help' },
  { type: 'divider' },
  { icon: LogOut, label: { en: 'Logout', ar: 'تسجيل الخروج' }, action: 'logout', variant: 'destructive' }
];
```

### 7. Dashboard Page

**File:** `/src/app/[locale]/dashboard/page.tsx`

**Layout Structure:**
```typescript
<MainLayout>
  <div className="space-y-6 p-6">
    {/* Welcome Card */}
    <WelcomeCard user={user} />
    
    {/* Quick Actions Grid */}
    <QuickActionsGrid role={user.role} />
    
    {/* Summary Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard title="Total Items" value={stats.totalItems} />
      <StatCard title="Reject Rate" value={stats.rejectRate} />
      <StatCard title="Active Users" value={stats.activeUsers} />
    </div>
    
    {/* Recent Activity */}
    <RecentActivityTimeline items={recentActivity} />
    
    {/* Mini Charts */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MiniTrendChart data={trendData} />
      <MiniDistributionChart data={distributionData} />
    </div>
  </div>
</MainLayout>
```

**Role-Based Content:**
```typescript
function getDashboardContent(role: UserRole) {
  switch (role) {
    case 'DATA_ENTRY':
      return {
        primaryAction: 'Add New Item',
        showRecentEntries: true,
        showTeamActivity: false,
        showAnalytics: false
      };
    case 'MANAGER':
      return {
        primaryAction: 'View Reports',
        showRecentEntries: false,
        showTeamActivity: true,
        showAnalytics: true
      };
    // ... more roles
  }
}
```

## Data Models

### AppContext State

```typescript
interface AppContextState {
  user: User | null;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  notifications: Notification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}
```

### Route Permission Configuration

```typescript
interface RoutePermission {
  path: string;
  roles: UserRole[] | 'ALL';
  requireAuth: boolean;
}

const routePermissions: RoutePermission[] = [
  { path: '/dashboard', roles: 'ALL', requireAuth: true },
  { path: '/data-entry', roles: ['ADMIN', 'SUPERVISOR', 'DATA_ENTRY'], requireAuth: true },
  { path: '/data-log', roles: ['ADMIN', 'SUPERVISOR', 'MANAGER', 'DATA_ENTRY', 'AUDITOR'], requireAuth: true },
  { path: '/analytics', roles: ['ADMIN', 'SUPERVISOR', 'MANAGER', 'AUDITOR'], requireAuth: true },
  { path: '/backup', roles: ['ADMIN', 'MANAGER'], requireAuth: true },
  { path: '/audit', roles: ['ADMIN', 'AUDITOR'], requireAuth: true },
  { path: '/settings', roles: 'ALL', requireAuth: true },
  { path: '/settings/users', roles: ['ADMIN'], requireAuth: true },
];
```

## Error Handling

### Error Boundary Component

**File:** `/src/components/ErrorBoundary.tsx`

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, ErrorBoundaryState> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service (e.g., Sentry)
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### API Error Handler

**File:** `/src/lib/api-error-handler.ts`

```typescript
interface APIError {
  status: number;
  message: string;
  code?: string;
}

function handleAPIError(error: APIError) {
  switch (error.status) {
    case 401:
      // Redirect to login
      window.location.href = '/login';
      break;
    case 403:
      // Show access denied
      toast.error('Access denied. You do not have permission.');
      break;
    case 404:
      toast.error('Resource not found.');
      break;
    case 500:
      toast.error('Server error. Please try again later.');
      break;
    default:
      toast.error(error.message || 'An error occurred.');
  }
}
```

### Form Validation Error Display

```typescript
interface FormErrors {
  [field: string]: string;
}

function displayFormErrors(errors: FormErrors, formRef: RefObject<HTMLFormElement>) {
  // Display inline errors
  Object.entries(errors).forEach(([field, message]) => {
    const fieldElement = formRef.current?.querySelector(`[name="${field}"]`);
    // Show error message below field
  });
  
  // Scroll to first error
  const firstErrorField = Object.keys(errors)[0];
  const element = formRef.current?.querySelector(`[name="${firstErrorField}"]`);
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  element?.focus();
}
```

## Testing Strategy

### Unit Tests

**Components to Test:**
1. Sidebar - collapse/expand, navigation filtering by role
2. Breadcrumbs - dynamic generation from pathname
3. NotificationBell - unread count, mark as read
4. UserMenu - dropdown open/close, logout action
5. ErrorBoundary - error catching and fallback display

**Test Framework:** Jest + React Testing Library

**Example Test:**
```typescript
describe('Sidebar', () => {
  it('should filter navigation items based on user role', () => {
    const { queryByText } = render(
      <Sidebar collapsed={false} onCollapse={jest.fn()} />,
      { user: { role: 'DATA_ENTRY' } }
    );
    
    expect(queryByText('Data Entry')).toBeInTheDocument();
    expect(queryByText('Audit')).not.toBeInTheDocument();
  });
  
  it('should persist collapsed state to localStorage', () => {
    const { getByRole } = render(<Sidebar collapsed={false} onCollapse={jest.fn()} />);
    const collapseButton = getByRole('button', { name: /collapse/i });
    
    fireEvent.click(collapseButton);
    
    expect(localStorage.getItem('sidebar-collapsed')).toBe('true');
  });
});
```

### Integration Tests

**Scenarios to Test:**
1. Navigation flow: Click sidebar item → page loads → breadcrumbs update
2. Authentication: Access protected route → redirect to login → login → redirect back
3. Role-based access: Non-admin user → try to access /settings/users → see access denied
4. Language switch: Click language switcher → page reloads → UI in new language
5. Theme toggle: Click theme button → theme changes → persists on reload

### E2E Tests (Optional)

**Tool:** Playwright or Cypress

**Critical Paths:**
1. Login → Dashboard → Add Item → View in Data Log
2. Login → Analytics → Click chart → Filter Data Log
3. Login → Settings → Change password → Logout → Login with new password


## UI/UX Design Specifications

### Design System

**Colors:**
- Primary: `hsl(var(--primary))` - Main brand color
- Secondary: `hsl(var(--secondary))` - Secondary actions
- Accent: `hsl(var(--accent))` - Highlights and hover states
- Destructive: `hsl(var(--destructive))` - Delete and error actions
- Muted: `hsl(var(--muted))` - Disabled states and backgrounds

**Typography:**
- Font Family: Inter (Latin), Tajawal (Arabic)
- Heading Sizes: text-3xl, text-2xl, text-xl, text-lg
- Body: text-base (16px)
- Small: text-sm (14px)
- Tiny: text-xs (12px)

**Spacing Scale:**
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

**Border Radius:**
- sm: 0.25rem (4px)
- md: 0.375rem (6px)
- lg: 0.5rem (8px)
- xl: 0.75rem (12px)

**Shadows:**
- sm: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
- md: `0 4px 6px -1px rgb(0 0 0 / 0.1)`
- lg: `0 10px 15px -3px rgb(0 0 0 / 0.1)`

### Animation Specifications

**Transitions:**
```css
/* Sidebar collapse/expand */
.sidebar {
  transition: width 300ms ease-in-out;
}

/* Hover effects */
.nav-item:hover {
  transition: background-color 150ms ease-in-out;
}

/* Modal open/close */
.modal {
  animation: modal-in 200ms ease-out;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Toast slide in */
.toast {
  animation: toast-in 300ms ease-out;
}

@keyframes toast-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Page transition */
.page-content {
  animation: fade-in 200ms ease-in;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

### Loading States

**Skeleton Loader Component:**
```typescript
// File: /src/components/ui/Skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-md bg-muted', className)} />
  );
}

// Usage examples:
<Skeleton className="h-12 w-full" /> // Table row
<Skeleton className="h-64 w-full" /> // Chart
<Skeleton className="h-32 w-full" /> // Card
```

**Button Loading State:**
```typescript
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

**Page Loading:**
```typescript
// File: /src/components/ui/PageLoader.tsx
export function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
```

### Empty States

**Empty State Component:**
```typescript
// File: /src/components/ui/EmptyState.tsx
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}
```

### Responsive Breakpoints

```typescript
// Tailwind breakpoints
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
};

// Usage in components:
// Mobile: default styles
// Tablet: md: prefix
// Desktop: lg: prefix
```

**Responsive Layout Examples:**
```tsx
// Sidebar
<aside className="
  fixed inset-y-0 left-0 z-50
  w-72 lg:w-72 lg:static
  transform lg:transform-none
  transition-transform duration-300
  {mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
">

// Grid layouts
<div className="
  grid grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  gap-4
">

// Header actions
<div className="
  flex items-center gap-2
  md:gap-3
">
```

### Accessibility Features

**Keyboard Navigation:**
```typescript
// Focus trap in modal
import { useFocusTrap } from '@/hooks/useFocusTrap';

function Modal({ isOpen, onClose, children }) {
  const modalRef = useFocusTrap(isOpen);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);
  
  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
```

**ARIA Labels:**
```tsx
// Icon-only buttons
<button aria-label="Close menu">
  <X className="h-5 w-5" />
</button>

// Navigation items
<nav aria-label="Main navigation">
  <ul role="list">
    <li>
      <a href="/dashboard" aria-current={isActive ? 'page' : undefined}>
        Dashboard
      </a>
    </li>
  </ul>
</nav>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {notifications.length} new notifications
</div>
```

**Focus Indicators:**
```css
/* Global focus styles */
*:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}

/* Custom focus ring for buttons */
.btn:focus-visible {
  ring: 2px;
  ring-color: hsl(var(--ring));
  ring-offset: 2px;
}
```

### RTL Support

**Layout Adjustments:**
```typescript
// File: /src/styles/rtl.css
[dir='rtl'] {
  /* Flip sidebar position */
  .sidebar {
    left: auto;
    right: 0;
  }
  
  /* Reverse flex layouts */
  .flex-row {
    flex-direction: row-reverse;
  }
  
  /* Flip borders */
  .border-l {
    border-left: none;
    border-right: 1px solid;
  }
  
  /* Flip text alignment */
  .text-left {
    text-align: right;
  }
  
  /* Flip icons */
  .chevron-right {
    transform: scaleX(-1);
  }
}
```

**Logical Properties (Preferred):**
```css
/* Use logical properties for automatic RTL support */
.element {
  margin-inline-start: 1rem; /* margin-left in LTR, margin-right in RTL */
  margin-inline-end: 1rem;   /* margin-right in LTR, margin-left in RTL */
  padding-inline: 1rem;      /* padding-left and padding-right */
  border-inline-start: 1px solid; /* border-left in LTR, border-right in RTL */
}
```

## Performance Optimizations

### Code Splitting

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const AnalyticsCharts = dynamic(() => import('@/components/charts/AnalyticsCharts'), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false
});

const PDFViewer = dynamic(() => import('@/components/PDFViewer'), {
  loading: () => <PageLoader />,
  ssr: false
});
```

### Image Optimization

```typescript
import Image from 'next/image';

// Optimized images
<Image
  src="/logo.png"
  alt="Saudi Mais Co."
  width={200}
  height={60}
  priority // For above-the-fold images
/>

<Image
  src={userAvatar}
  alt={userName}
  width={40}
  height={40}
  loading="lazy" // For below-the-fold images
/>
```

### API Response Caching

```typescript
// File: /src/hooks/useDataFetch.ts
import useSWR from 'swr';

export function useDataFetch<T>(url: string, options?: SWRConfiguration) {
  return useSWR<T>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000, // 5 seconds
    ...options
  });
}

// Usage:
const { data, error, isLoading, mutate } = useDataFetch('/api/inventory');

// Invalidate cache after mutation
await createItem(newItem);
mutate(); // Refetch data
```

### Bundle Size Optimization

```javascript
// next.config.ts
const nextConfig = {
  // Enable SWC minification
  swcMinify: true,
  
  // Analyze bundle size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          // Common chunk
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      };
    }
    return config;
  }
};
```

## Security Considerations

### Authentication Flow

```typescript
// Middleware checks authentication
export async function middleware(request: NextRequest) {
  const session = await auth();
  
  if (!session && isProtectedRoute(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Check role-based permissions
  if (session && !hasPermission(session.user.role, pathname)) {
    return NextResponse.redirect(new URL('/access-denied', request.url));
  }
  
  return NextResponse.next();
}
```

### CSRF Protection

```typescript
// API routes with CSRF token validation
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Validate CSRF token from headers
  const csrfToken = request.headers.get('X-CSRF-Token');
  if (!validateCSRFToken(csrfToken, session)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }
  
  // Process request
}
```

### Rate Limiting

```typescript
// File: /src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
  
  if (!success) {
    throw new Error('Rate limit exceeded');
  }
  
  return { limit, reset, remaining };
}
```

### Security Headers

```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

## Deployment Strategy

### Environment Variables

```bash
# .env.production
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://mais-inventory.vercel.app"
NEXTAUTH_SECRET="..."
GEMINI_API_KEY="..."
```

### Build Process

```bash
# Build command
npm run build

# Vercel build (includes Prisma generation and migration)
npm run vercel-build
```

### Pre-deployment Checklist

- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings fixed
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] API routes tested
- [ ] Authentication flow verified
- [ ] Role-based access tested
- [ ] Responsive design verified
- [ ] Accessibility audit passed
- [ ] Performance metrics acceptable (Lighthouse > 90)
- [ ] Error tracking configured
- [ ] Analytics enabled

### Monitoring

```typescript
// Error tracking with Sentry (optional)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Log errors
Sentry.captureException(error);
```

## Future Enhancements

### Phase 2 Features

1. **Real-Time Collaboration**
   - WebSocket integration for live updates
   - Show online users indicator
   - Real-time notifications

2. **Advanced Search**
   - Full-text search across all entities
   - Search history and saved filters
   - Keyboard shortcut (Cmd/Ctrl + K)

3. **Mobile App**
   - React Native app for iOS/Android
   - Barcode scanning
   - Offline mode with sync

4. **Workflow Automation**
   - Approval workflows
   - Automatic alerts
   - Scheduled reports

5. **API for Third-Party Integration**
   - RESTful API documentation
   - API keys management
   - Webhooks for events

### Technical Debt

- Migrate to React Server Components where applicable
- Implement comprehensive E2E test suite
- Add Storybook for component documentation
- Set up automated visual regression testing
- Implement progressive web app (PWA) features

