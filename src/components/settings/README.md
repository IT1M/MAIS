# Settings Interface Documentation

## Overview

A comprehensive settings interface for managing user accounts, roles, permissions, system preferences, API configuration, and application customization.

## Features

### 1. Profile Settings
- Upload and manage profile picture with crop/resize
- Edit personal details (name, employee ID, department)
- Update contact information (phone, work location)
- Real-time validation and auto-save

### 2. Security Settings
- Change password with strength indicator
- View and manage active sessions
- Security audit log
- Multi-device session management
- Sign out all other sessions

### 3. User Management (Admin Only)
- Create, edit, and delete users
- Assign roles with granular permissions
- Bulk user operations
- Role permissions matrix
- User search and filtering
- Auto-generated secure passwords

### 4. Appearance Settings
- Theme selection (Light/Dark/System)
- Color scheme customization
- UI density options (Compact/Comfortable/Spacious)
- Font size adjustment
- Layout preferences (sidebar position, breadcrumbs)
- Live preview of changes

### 5. Notification Settings
- Email notification preferences
- In-app notification controls
- Desktop notification support
- Notification frequency settings
- Test notification functionality

### 6. API & Integrations (Admin Only)
- Gemini AI API key management
- AI features toggle (insights, predictive, NLQ)
- Model selection and configuration
- Usage statistics tracking
- Database status monitoring
- External integrations placeholder

### 7. System Preferences (Admin/Manager)
- Company information and branding
- Inventory settings and categories
- Automated backup configuration
- Data retention policies
- System limits and quotas
- Developer settings (debug mode, logging)

## File Structure

```
src/components/settings/
├── ProfileSettings.tsx          # User profile management
├── SecuritySettings.tsx         # Password and session management
├── UserManagement.tsx          # User CRUD and permissions
├── AppearanceSettings.tsx      # UI customization
├── NotificationSettings.tsx    # Notification preferences
├── APISettings.tsx             # API and integration config
├── SystemPreferences.tsx       # System-wide settings
└── README.md                   # This file

src/app/settings/
└── page.tsx                    # Main settings page with navigation

src/app/api/settings/
├── profile/route.ts            # Profile update endpoint
├── password/route.ts           # Password change endpoint
├── appearance/route.ts         # Appearance settings endpoint
├── notifications/route.ts      # Notification settings endpoint
└── system/route.ts             # System settings endpoint

src/app/api/users/
├── route.ts                    # User list and create endpoints
└── [id]/route.ts              # User update and delete endpoints

src/types/
└── settings.ts                 # TypeScript types for settings
```

## Usage

### Accessing Settings

Navigate to `/settings` in your application. The interface will automatically show sections based on user role.

### Role-Based Access

- **All Users**: Profile, Security, Appearance, Notifications
- **Admin Only**: User Management, API & Integrations
- **Admin/Manager**: System Preferences

### API Integration

All settings components use REST API endpoints for data persistence:

```typescript
// Example: Update profile
const response = await fetch('/api/settings/profile', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(profileData),
});
```

## Customization

### Adding New Settings Section

1. Create component in `src/components/settings/`
2. Add section to navigation in `src/app/settings/page.tsx`
3. Create API route if needed
4. Update types in `src/types/settings.ts`

### Styling

All components use Tailwind CSS with dark mode support. Customize colors in your Tailwind config.

## Security Considerations

- All API routes require authentication
- Role-based access control enforced server-side
- Password changes require current password verification
- Audit logging for sensitive operations
- Session management with device tracking

## Mobile Responsive

- Sidebar navigation becomes accordion on mobile
- Optimized forms for touch input
- Sticky save buttons
- Swipe gestures between sections

## Accessibility

- Keyboard navigation support
- Focus management in modals
- Screen reader announcements
- High contrast theme option
- ARIA labels and roles

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- React 19
- Next.js 15
- Tailwind CSS 4
- react-hot-toast (notifications)
- date-fns (date formatting)
- bcryptjs (password hashing)
- Prisma (database ORM)

## Future Enhancements

- Two-factor authentication
- OAuth integration
- Advanced audit log filtering
- Settings import/export
- Settings version history
- Real-time settings sync across devices
