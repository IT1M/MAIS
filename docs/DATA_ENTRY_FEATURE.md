# Data Entry Interface Documentation

## Overview
A comprehensive, accessible data entry interface for warehouse staff to efficiently input inventory data with real-time validation, autosave functionality, and mobile optimization.

## Features

### 🎯 Core Functionality
- **Real-time validation** with inline error messages
- **Autosave** to localStorage every 2 seconds
- **Draft recovery** on page reload
- **Keyboard shortcuts** for power users
- **Mobile-optimized** responsive design
- **Accessibility compliant** (WCAG 2.1 AA)

### 📝 Form Fields

1. **Item Name** (Required)
   - 2-100 characters
   - Autocomplete with recently entered items
   - Character count display
   - Debounced search

2. **Batch Number** (Required)
   - 3-50 characters
   - Alphanumeric only
   - Auto-uppercase transformation
   - Duplicate batch warning

3. **Quantity** (Required)
   - Integer: 1 - 1,000,000
   - Large text for readability
   - Number pad support

4. **Reject Quantity** (Optional)
   - Integer: 0 - quantity
   - Real-time percentage calculation
   - Color-coded indicators:
     - 🟢 Green: < 5%
     - 🟡 Yellow: 5-10%
     - 🔴 Red: > 10%

5. **Destination** (Required)
   - Options: Mais, Fozan
   - Large touch-friendly buttons
   - Remembers last selection

6. **Category** (Optional)
   - 2-50 characters
   - Autocomplete suggestions
   - Help text provided

7. **Notes** (Optional)
   - Max 500 characters
   - Auto-expanding textarea
   - Character count

### ⌨️ Keyboard Shortcuts
- `Ctrl/Cmd + S`: Save entry
- `Ctrl/Cmd + Enter`: Submit form
- `Esc`: Clear form (with confirmation)
- `Tab`: Navigate fields

### 💾 Autosave
- Saves draft every 2 seconds
- Persists in localStorage
- Shows "Draft saved" indicator with timestamp
- Restores on page reload
- Clears after successful submission
- Warns before leaving with unsaved changes

### 📊 Quick Stats Widget
- Today's entry count
- Recent items (last 5)
- Destination summary
- Click-to-copy batch numbers
- Auto-refreshes every 30 seconds

### 🎨 UI/UX Features
- Clean, modern design
- Dark mode support
- Loading states on all actions
- Toast notifications:
  - ✓ Success (green, 4s)
  - ✕ Error (red, 6s)
  - ℹ️ Info (blue, 4s)
  - ⚠️ Warning (yellow, 5s)
- Responsive breakpoints (sm, md, lg, xl)
- Touch-friendly (min 44x44px tap targets)

### ♿ Accessibility
- Proper ARIA labels and attributes
- Screen reader announcements
- Keyboard navigation
- Focus management
- High contrast support
- Error messages linked to fields
- Semantic HTML

### 📱 Mobile Optimization
- Single column layout
- Larger input fields
- Sticky submit button
- Prevents zoom on input focus
- Bottom sheet for selections
- Touch-optimized controls

## Routes

### Primary Route
- Path: `/[locale]/data-entry`
- Protected: Requires `DATA_ENTRY` role or higher

### Alternative Route
- Path: `/data-entry`
- Same functionality, no locale prefix

## API Integration

### POST /api/inventory
Creates new inventory item

**Request Body:**
```json
{
  "itemName": "string (2-100 chars)",
  "batch": "string (3-50 chars, alphanumeric, uppercase)",
  "quantity": "number (1-1000000)",
  "reject": "number (0-quantity)",
  "destination": "MAIS | FOZAN",
  "category": "string (optional, 2-50 chars)",
  "notes": "string (optional, max 500 chars)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "itemName": "string",
    "batch": "string",
    "quantity": number,
    "reject": number,
    "destination": "MAIS | FOZAN",
    "category": "string | null",
    "notes": "string | null",
    "enteredBy": "uuid",
    "createdAt": "ISO date",
    "updatedAt": "ISO date",
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string"
    }
  }
}
```

## File Structure

```
src/
├── app/
│   ├── [locale]/
│   │   └── data-entry/
│   │       └── page.tsx          # Locale-aware route
│   └── data-entry/
│       └── page.tsx               # Direct route
├── components/
│   ├── forms/
│   │   ├── DataEntryForm.tsx     # Main form component
│   │   └── MobileDataEntryForm.tsx
│   ├── pages/
│   │   └── DataEntryPage.tsx     # Page wrapper
│   ├── widgets/
│   │   └── QuickStatsWidget.tsx  # Stats sidebar
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Textarea.tsx
│       └── Toast.tsx
├── hooks/
│   └── useDataEntryForm.ts       # Form logic hook
└── lib/
    └── validation.ts              # Zod schemas
```

## Usage

### For Developers

1. **Import the page:**
```tsx
import { DataEntryPage } from '@/components/pages/DataEntryPage';
```

2. **Use the form component:**
```tsx
import { DataEntryForm } from '@/components/forms/DataEntryForm';

<DataEntryForm onSuccess={() => console.log('Saved!')} />
```

3. **Use the custom hook:**
```tsx
import { useDataEntryForm } from '@/hooks/useDataEntryForm';

const { formData, errors, handleSubmit } = useDataEntryForm();
```

### For Users

1. Navigate to `/data-entry`
2. Fill in required fields (marked with *)
3. Form auto-saves every 2 seconds
4. Use keyboard shortcuts for efficiency
5. Click "Save Entry" or press Ctrl/Cmd + S
6. View success message and continue

## Validation Rules

| Field | Required | Min | Max | Format |
|-------|----------|-----|-----|--------|
| Item Name | Yes | 2 | 100 | Text |
| Batch | Yes | 3 | 50 | Alphanumeric, uppercase |
| Quantity | Yes | 1 | 1,000,000 | Integer |
| Reject | No | 0 | quantity | Integer |
| Destination | Yes | - | - | MAIS or FOZAN |
| Category | No | 2 | 50 | Text |
| Notes | No | 0 | 500 | Text |

## Error Handling

### Client-side
- Field-level validation on blur
- Form-level validation on submit
- Visual error indicators
- Inline error messages
- Disabled submit when invalid

### Server-side
- Network errors: Show retry button
- Validation errors: Highlight fields
- Server errors: User-friendly messages
- Rate limiting: 429 response handling

## Performance

- Debounced autocomplete (300ms)
- Optimistic UI updates
- Lazy loading for stats
- Efficient re-renders with React hooks
- LocalStorage for offline capability

## Security

- Role-based access control (DATA_ENTRY+)
- Input sanitization
- XSS prevention
- CSRF protection via Next.js
- Rate limiting on API

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Testing Checklist

- [ ] All fields validate correctly
- [ ] Autosave works
- [ ] Draft recovery works
- [ ] Keyboard shortcuts work
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Accessibility (screen reader)
- [ ] Toast notifications appear
- [ ] API integration works
- [ ] Error handling works
- [ ] Stats widget updates
- [ ] Batch warning shows
- [ ] Reject percentage calculates
- [ ] Form clears after submit
- [ ] Destination persists

## Future Enhancements

- [ ] Barcode scanner integration
- [ ] Voice input support
- [ ] Offline mode with sync
- [ ] Bulk entry mode
- [ ] CSV import
- [ ] Photo attachment
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Custom field templates
- [ ] Integration with warehouse systems

## Support

For issues or questions:
- Check console for errors
- Verify user has DATA_ENTRY role
- Check network tab for API errors
- Clear localStorage if draft corrupted
- Verify database connection

## License

Internal use only - Saudi Mais Co.
