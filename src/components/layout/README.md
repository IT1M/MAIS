# Layout Components

This directory contains the layout components for the Saudi Mais Co. Inventory Management System.

## Components

### Header

The main header component that appears at the top of all authenticated pages.

**File:** `Header.tsx`

**Features:**
- Sticky positioning at the top of the page
- Hamburger menu button for mobile devices (< 768px)
- Dynamic breadcrumbs navigation
- Notification bell with dropdown
- Language switcher (English/Arabic)
- Theme toggle (Light/Dark mode)
- User menu with profile options

**Usage:**
```tsx
import { Header } from '@/components/layout';

function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div>
      <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      {/* Rest of layout */}
    </div>
  );
}
```

### Breadcrumbs

Dynamic breadcrumb navigation that shows the current page hierarchy.

**File:** `Breadcrumbs.tsx`

**Features:**
- Automatically generates breadcrumbs from URL pathname
- Supports internationalization (English/Arabic)
- RTL support for Arabic
- Truncates long breadcrumb trails (shows first, ellipsis, and last two)
- Clickable navigation to parent pages

**Behavior:**
- Hidden on mobile devices (< 768px)
- Reverses order for RTL languages
- Last breadcrumb is bold and not clickable

### NotificationBell

Notification dropdown component with unread count badge.

**File:** `NotificationBell.tsx`

**Features:**
- Bell icon with unread count badge
- Dropdown showing last 10 notifications
- Mark individual notifications as read
- Mark all notifications as read
- Empty state when no notifications
- Timestamp formatting with relative time
- Color-coded notification types (info, success, warning, error)

**Mock Data:**
Currently uses mock notifications. In production, this should fetch from an API endpoint.

### LanguageSwitcher

Language selection dropdown for switching between English and Arabic.

**File:** `LanguageSwitcher.tsx`

**Features:**
- Flag icons for visual language identification
- Dropdown with available languages
- Persists language preference
- Reloads page with new locale
- Loading state during transition

**Supported Languages:**
- English (en) 🇬🇧
- Arabic (ar) 🇸🇦

### ThemeToggle

Toggle button for switching between light and dark themes.

**File:** `ThemeToggle.tsx`

**Features:**
- Sun icon for light mode
- Moon icon for dark mode
- Smooth transition between themes
- Persists theme preference
- Respects system preference

### UserMenu

User profile dropdown menu with account actions.

**File:** `UserMenu.tsx`

**Features:**
- User avatar with initials
- User name and email display
- Role badge
- Menu items:
  - Profile
  - My Activity
  - Settings
  - Help
  - Logout (destructive action)
- Closes on outside click
- Handles logout with redirect

## Styling

All components use Tailwind CSS with the following design tokens:

- **Colors:** Uses CSS variables for theme support
- **Spacing:** Consistent padding and margins
- **Typography:** Inter (Latin), Tajawal (Arabic)
- **Transitions:** 150-300ms for smooth animations
- **Shadows:** Subtle shadows for depth

## Accessibility

All components follow accessibility best practices:

- Proper ARIA labels for icon-only buttons
- Keyboard navigation support
- Focus indicators
- Screen reader announcements
- Semantic HTML

## Internationalization

All text is internationalized using `next-intl`:

- Translation keys in `messages/en.json` and `messages/ar.json`
- RTL layout support for Arabic
- Locale-aware date/time formatting

## Responsive Design

Breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: ≥ 1024px

Mobile-specific features:
- Hamburger menu button
- Condensed header layout
- Hidden breadcrumbs
- Simplified user menu

## Future Enhancements

- Real-time notifications via WebSocket
- Notification preferences
- Advanced search in header
- Keyboard shortcuts (Cmd/Ctrl + K for search)
- User status indicator (online/offline)
