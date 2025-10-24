# MainLayout Component

## Overview

The `MainLayout` component is the root layout wrapper for all authenticated pages in the Saudi Mais Co. inventory management application. It provides a consistent layout structure with a responsive sidebar, header, and main content area.

## Features

- ✅ **Responsive Design**: Adapts to mobile, tablet, and desktop screen sizes
- ✅ **Sidebar Integration**: Integrates with Sidebar component with collapse/expand functionality
- ✅ **Mobile Menu Overlay**: Full-screen overlay menu for mobile devices with backdrop
- ✅ **State Management**: Persists sidebar collapsed state to localStorage
- ✅ **Smooth Transitions**: 300ms animations for sidebar width changes
- ✅ **Accessibility**: Prevents body scroll when mobile menu is open
- ✅ **Hydration Safe**: Prevents hydration mismatches with mounted state

## Usage

### Basic Usage

```tsx
import { MainLayout } from '@/components/layout';

export default function MyPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <h1>My Page Content</h1>
        {/* Your page content here */}
      </div>
    </MainLayout>
  );
}
```

### In Next.js App Router

```tsx
// app/[locale]/my-page/page.tsx
import { MainLayout } from '@/components/layout';

export default function MyPage() {
  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">My Page</h1>
        {/* Page content */}
      </div>
    </MainLayout>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `React.ReactNode` | Yes | The page content to render in the main area |

## Layout Structure

```
MainLayout
├── Desktop Sidebar (hidden on mobile)
│   └── Sidebar component (collapsed/expanded)
├── Mobile Sidebar Overlay (visible when menu open)
│   ├── Backdrop (semi-transparent)
│   └── Sidebar component (always expanded)
└── Main Content Area
    ├── Header (with hamburger menu on mobile)
    └── Main content (scrollable)
```

## Responsive Behavior

### Desktop (≥1024px)
- Sidebar is always visible
- Width: 280px (expanded) or 72px (collapsed)
- No hamburger menu button
- Sidebar state persists across page loads

### Tablet (768px - 1023px)
- Sidebar is always visible
- Same behavior as desktop
- Collapsible sidebar

### Mobile (<768px)
- Sidebar is hidden by default
- Hamburger menu button in header
- Clicking hamburger opens full-screen overlay
- Backdrop closes menu when clicked
- Body scroll is prevented when menu is open

## State Management

The component uses the `useSidebarState` hook to manage sidebar state:

```typescript
const { collapsed, setCollapsed, mounted } = useSidebarState();
```

- **collapsed**: Boolean indicating if sidebar is collapsed
- **setCollapsed**: Function to update collapsed state
- **mounted**: Boolean to prevent hydration mismatches

State is automatically persisted to localStorage with key `sidebar-collapsed`.

## Styling

The component uses Tailwind CSS classes for styling:

- **Transitions**: `transition-all duration-300 ease-in-out`
- **Sidebar Width**: `w-[280px]` (expanded), `w-[72px]` (collapsed)
- **Mobile Overlay**: `fixed inset-0 z-40 bg-black/50`
- **Z-Index**: Backdrop (z-40), Mobile Sidebar (z-50)

## Accessibility

- Prevents body scroll when mobile menu is open
- Backdrop has `aria-hidden="true"`
- Hamburger button has proper `aria-label`
- Keyboard navigation supported through child components

## Integration with Other Components

### Sidebar Component

The MainLayout passes the following props to Sidebar:

```typescript
<Sidebar
  collapsed={collapsed}
  onCollapse={handleSidebarCollapse}
  mobileOpen={mobileMenuOpen}
  onMobileClose={handleMobileMenuClose}
/>
```

### Header Component

The MainLayout passes the mobile menu toggle handler:

```typescript
<Header onMobileMenuToggle={handleMobileMenuToggle} />
```

## Requirements Satisfied

This component satisfies the following requirements from the specification:

- **1.1**: Renders MainLayout with sidebar, header, and main content area
- **1.2**: Displays sidebar at 280px width on desktop (≥1024px)
- **1.3**: Collapsible sidebar with overlay behavior on tablet
- **1.4**: Hides sidebar on mobile with hamburger menu
- **1.5**: Animates sidebar width transition to 72px in 300ms

## Example: Complete Page Implementation

```tsx
import { MainLayout } from '@/components/layout';
import { useTranslations } from 'next-intl';

export default function AnalyticsPage() {
  const t = useTranslations('analytics');

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <button className="btn-primary">
            {t('generateReport')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Your content */}
        </div>
      </div>
    </MainLayout>
  );
}
```

## Notes

- The Sidebar component is currently a placeholder and will be fully implemented in task 2.1
- The component prevents hydration mismatches by checking the `mounted` state
- Mobile menu automatically closes when screen is resized to desktop size
- Body scroll is restored when mobile menu closes or component unmounts
