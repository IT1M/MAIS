# Data Log Feature Documentation

## Overview
The Data Log feature provides a comprehensive interface for viewing, filtering, searching, and managing all inventory entries with advanced capabilities including export, bulk operations, and real-time updates.

## Route
- **Path**: `/[locale]/data-log`
- **Access**: All authenticated users
- **Layout**: Full-width with sidebar filters

## Features

### 1. Advanced Filtering

#### Search Bar
- Global search across item names and batch numbers
- Debounced input (300ms delay) for performance
- Clear button to reset search
- Real-time search indicator

#### Date Range Picker
- Quick presets: Today, Last 7 Days, Last 30 Days, This Month
- Custom date range selection
- Clear selection option
- Date validation

#### Destination Filter
- Multi-select checkboxes for MAIS and FOZAN
- Visual badges in table

#### Category Filter
- Dynamic list based on available categories
- Multi-select support
- Auto-populated from inventory data

#### Reject Filter
- All Items
- No Rejects (reject = 0)
- Has Rejects (reject > 0)
- High Rejects (>10%)

#### Entered By Filter (Admin/Supervisor Only)
- Multi-select user filter
- Shows all users who have entered data
- Role-based visibility

#### Sort Options
- Sort by: Date, Item Name, Quantity, Batch
- Sort order: Ascending, Descending
- Persistent across sessions

### 2. Data Table

#### Columns
1. **Checkbox** - Select individual items
2. **Item Name** - Sortable, sticky on scroll
3. **Batch Number** - Sortable, monospace font
4. **Quantity** - Right-aligned, formatted with commas
5. **Reject** - Right-aligned, formatted with commas
6. **Reject %** - Color-coded badge (green/yellow/orange/red)
7. **Destination** - Badge style (blue for MAIS, green for FOZAN)
8. **Category** - Hidden on mobile
9. **Entered By** - User name, hidden on tablet
10. **Date Added** - Formatted date/time, hidden on mobile
11. **Actions** - Dropdown menu

#### Row Actions
- **Edit** - Opens edit modal
- **Duplicate** - Creates copy with "-COPY" suffix
- **Copy Batch** - Copies batch number to clipboard
- **Delete** - Requires SUPERVISOR+ role, shows confirmation

#### Table Features
- Hover highlighting
- Click row to edit
- Loading skeleton during fetch
- Empty state with illustration
- Error state with retry button
- Responsive column hiding

### 3. Pagination

#### Controls
- Previous/Next buttons
- Page number buttons (shows 5 at a time)
- Current page indicator
- Items per page selector (10, 25, 50, 100, 200)
- Total count display

#### Features
- Preserves filters when changing pages
- URL query params for shareable links
- Browser back/forward support

### 4. Export Functionality

#### Export Formats
1. **CSV** - UTF-8 with BOM for Excel compatibility
2. **JSON** - Structured with metadata
3. **Excel** - Requires API endpoint (future)
4. **PDF** - Requires API endpoint (future)

#### Export Options
- Export all filtered data
- Export selected rows only
- Progress indicator
- Success toast with file size
- Auto-download

### 5. Bulk Operations

#### Bulk Actions Toolbar
Appears when items are selected:
- Shows selection count
- Clear selection button
- Bulk delete (SUPERVISOR+ only)
- Bulk export

#### Features
- Select all checkbox in header
- Individual row checkboxes
- Persistent selection across pages
- Confirmation dialogs

### 6. Edit Modal

#### Features
- Pre-populated with current values
- Real-time validation
- Reject percentage calculator
- Change history display
- Unsaved changes warning
- Audit trail information

#### Fields
- Item Name (required)
- Batch Number (required, uppercase)
- Quantity (required, min: 0)
- Reject (min: 0, max: quantity)
- Destination (required, dropdown)
- Category (optional)
- Notes (optional, max: 500 chars)

### 7. Delete Confirmation

#### Features
- Warning message with item details
- Confirmation checkbox
- Role requirement (SUPERVISOR+)
- Audit log entry on deletion
- Cannot be undone warning

### 8. Real-Time Updates

#### Auto-Refresh
- Optional 30-second auto-refresh
- Toggle in header
- Manual refresh button
- "Updated X seconds/minutes ago" indicator

#### Features
- Preserves current page and filters
- Shows loading indicator
- Handles errors gracefully

### 9. Performance Optimizations

#### Implemented
- Debounced search input (300ms)
- Memoized filter functions
- Abort controller for cancelled requests
- Local storage for filter persistence
- Efficient re-renders with React hooks

#### Future Enhancements
- Virtual scrolling for large datasets
- Lazy loading on scroll
- Cache filter results (5 minutes)
- WebSocket for real-time updates

### 10. Mobile Responsive Design

#### Breakpoints
- **Mobile** (<640px): Card list view, bottom sheet filters
- **Tablet** (640-1024px): Simplified columns
- **Desktop** (>1024px): Full table view

#### Features
- Collapsible filter panel
- Touch-friendly controls
- Swipe actions (future)
- Responsive column hiding

## File Structure

```
src/
├── app/
│   ├── [locale]/
│   │   └── data-log/
│   │       └── page.tsx                    # Main page component
│   └── api/
│       └── inventory/
│           ├── [id]/
│           │   └── route.ts                # GET, PUT, DELETE single item
│           └── bulk-delete/
│               └── route.ts                # POST bulk delete
├── components/
│   ├── filters/
│   │   └── InventoryFilters.tsx            # Filter panel component
│   ├── tables/
│   │   └── InventoryTable.tsx              # Data table component
│   ├── ui/
│   │   └── Pagination.tsx                  # Pagination component
│   ├── export/
│   │   └── ExportButton.tsx                # Export dropdown
│   └── modals/
│       ├── EditInventoryModal.tsx          # Edit modal
│       └── DeleteConfirmDialog.tsx         # Delete confirmation
├── hooks/
│   └── useDataLog.ts                       # Main data fetching hook
├── lib/
│   ├── date-presets.ts                     # Date utilities
│   └── export-utils.ts                     # Export functions
└── types/
    └── data-log.ts                         # TypeScript types
```

## API Endpoints

### GET /api/inventory
Fetch inventory items with filters and pagination.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)
- `search` - Search term
- `startDate` - Filter start date (ISO string)
- `endDate` - Filter end date (ISO string)
- `destination` - Filter by destination (MAIS/FOZAN)
- `category` - Filter by category
- `sortBy` - Sort field (createdAt/itemName/quantity/batch)
- `sortOrder` - Sort order (asc/desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1234,
      "totalPages": 25
    }
  }
}
```

### GET /api/inventory/[id]
Get single inventory item by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "itemName": "...",
    "batch": "...",
    "quantity": 100,
    "reject": 5,
    "destination": "MAIS",
    "category": "...",
    "notes": "...",
    "enteredBy": "...",
    "createdAt": "...",
    "updatedAt": "...",
    "user": {
      "id": "...",
      "name": "...",
      "email": "..."
    }
  }
}
```

### PUT /api/inventory/[id]
Update inventory item.

**Permissions:**
- Creator can edit their own entries
- SUPERVISOR and ADMIN can edit any entry

**Request Body:**
```json
{
  "itemName": "Updated Item",
  "batch": "BATCH123",
  "quantity": 150,
  "reject": 10,
  "destination": "FOZAN",
  "category": "Category A",
  "notes": "Updated notes"
}
```

### DELETE /api/inventory/[id]
Delete single inventory item.

**Permissions:** SUPERVISOR or ADMIN only

### POST /api/inventory/bulk-delete
Delete multiple inventory items.

**Permissions:** SUPERVISOR or ADMIN only

**Request Body:**
```json
{
  "ids": ["id1", "id2", "id3"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "3 items deleted successfully",
    "count": 3
  }
}
```

## State Management

### Filter State
Stored in `localStorage` with key `data-log-filters`:
```typescript
{
  search: string;
  startDate: string;
  endDate: string;
  destinations: string[];
  categories: string[];
  rejectFilter: 'all' | 'no-rejects' | 'has-rejects' | 'high-rejects';
  enteredBy: string[];
  sortBy: 'createdAt' | 'itemName' | 'quantity' | 'batch';
  sortOrder: 'asc' | 'desc';
}
```

### Column Preferences
Stored in `localStorage` with key `data-log-columns` (future feature):
```typescript
{
  columnOrder: string[];
  columnWidths: Record<string, number>;
  hiddenColumns: string[];
}
```

## Accessibility

### Keyboard Navigation
- Tab through interactive elements
- Enter to open edit modal
- Escape to close modals
- Arrow keys for table navigation (future)

### Screen Reader Support
- ARIA labels on all interactive elements
- Announcements for filter changes
- Focus management in modals
- Skip to content link

### Visual Accessibility
- High contrast colors
- Color-blind friendly badges
- Focus indicators
- Sufficient text size

## Security

### Authentication
- All routes require authentication
- Session validation on each request
- Automatic redirect to login if unauthenticated

### Authorization
- Role-based access control
- DELETE requires SUPERVISOR or ADMIN
- Edit restricted to creator or SUPERVISOR+
- Audit logging for all changes

### Data Protection
- Input validation on all forms
- SQL injection prevention (Prisma)
- XSS protection (React)
- CSRF protection (Next.js)

## Performance Metrics

### Target Metrics
- Initial load: <2 seconds
- Filter application: <500ms
- Page change: <300ms
- Export generation: <5 seconds (1000 items)

### Optimization Techniques
- Debounced search (300ms)
- Request cancellation (AbortController)
- Memoized components
- Lazy loading (future)
- Virtual scrolling (future)

## Browser Support

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features
- ES6+ JavaScript
- CSS Grid
- Flexbox
- LocalStorage
- Fetch API

## Future Enhancements

### Planned Features
1. Virtual scrolling for 10,000+ items
2. Advanced search with operators
3. Saved filter presets
4. Column customization (resize, reorder, hide)
5. Audit history view per item
6. Real-time updates via WebSocket
7. Keyboard shortcuts
8. Print view
9. Email export
10. Scheduled exports

### API Enhancements
1. Excel export endpoint
2. PDF export endpoint
3. Batch update endpoint
4. Advanced query builder
5. GraphQL support

## Troubleshooting

### Common Issues

#### Filters not working
- Check browser console for errors
- Clear localStorage: `localStorage.removeItem('data-log-filters')`
- Refresh the page

#### Export fails
- Check file size (large exports may timeout)
- Try exporting fewer items
- Check browser download settings

#### Slow performance
- Reduce items per page
- Clear browser cache
- Disable auto-refresh
- Use more specific filters

#### Items not updating
- Click manual refresh button
- Check network connection
- Verify authentication status

## Testing

### Manual Testing Checklist
- [ ] Search functionality
- [ ] All filter options
- [ ] Date range selection
- [ ] Pagination controls
- [ ] Sort options
- [ ] Edit modal
- [ ] Delete confirmation
- [ ] Bulk operations
- [ ] Export formats
- [ ] Mobile responsive
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

### Test Data
Use the data entry page to create test items with various:
- Item names
- Batch numbers
- Quantities
- Reject values
- Destinations
- Categories
- Dates

## Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Contact system administrator
4. Submit bug report with:
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
