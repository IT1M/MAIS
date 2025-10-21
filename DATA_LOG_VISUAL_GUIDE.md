# Data Log - Visual Guide

## Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  📊 Inventory Data Log                    🔄 Updated 5s ago  ⟳  📥 │
│  View and manage all inventory entries    [ ] Auto-refresh   Export│
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────────────────────────────────────┐
│                  │  ⚠️ 3 items selected  [Clear]  [Delete Selected] │
│  FILTERS         ├──────────────────────────────────────────────────┤
│  ━━━━━━━━        │                                                  │
│                  │  ┌────────────────────────────────────────────┐  │
│  🔍 Search       │  │ ☑ Item  Batch  Qty  Rej  %  Dest  Actions │  │
│  [Search...]     │  ├────────────────────────────────────────────┤  │
│                  │  │ ☐ Rice  B123   100  5   5%  MAIS   ⋮      │  │
│  📅 Date Range   │  │ ☑ Corn  B124   200  10  5%  FOZAN  ⋮      │  │
│  [Today] [7d]    │  │ ☑ Wheat B125   150  20  13% MAIS   ⋮      │  │
│  [30d] [Month]   │  │ ☐ Beans B126   300  0   0%  FOZAN  ⋮      │  │
│  From: [____]    │  │ ☐ Flour B127   250  15  6%  MAIS   ⋮      │  │
│  To:   [____]    │  └────────────────────────────────────────────┘  │
│                  │                                                  │
│  📍 Destination  │  ┌────────────────────────────────────────────┐  │
│  ☑ MAIS          │  │ Showing 1-50 of 1,234  [10▾] [1][2][3]... │  │
│  ☑ FOZAN         │  └────────────────────────────────────────────┘  │
│                  │                                                  │
│  🏷️ Category     │                                                  │
│  ☐ Grains        │                                                  │
│  ☐ Legumes       │                                                  │
│                  │                                                  │
│  ⚠️ Reject       │                                                  │
│  [All Items ▾]   │                                                  │
│                  │                                                  │
│  👤 Entered By   │                                                  │
│  ☐ John Doe      │                                                  │
│  ☐ Jane Smith    │                                                  │
│                  │                                                  │
│  🔄 Sort         │                                                  │
│  [Date ▾] [↓ ▾]  │                                                  │
│                  │                                                  │
│  [Reset All]     │                                                  │
└──────────────────┴──────────────────────────────────────────────────┘
```

## Filter Panel (Expanded)

```
┌─────────────────────────────────────┐
│ Filters                          ▼  │
├─────────────────────────────────────┤
│                                     │
│ Search                              │
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Search item name or batch... │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Date Range                          │
│ [Today] [Last 7 Days] [Last 30 Days]│
│ [This Month]                        │
│ ┌──────────────┬──────────────────┐ │
│ │ Start Date   │ End Date         │ │
│ │ [2024-01-01] │ [2024-01-31]     │ │
│ └──────────────┴──────────────────┘ │
│ Clear dates                         │
│                                     │
│ Destination                         │
│ ☑ MAIS                              │
│ ☑ FOZAN                             │
│                                     │
│ Category                            │
│ ☐ Grains                            │
│ ☐ Legumes                           │
│ ☐ Vegetables                        │
│                                     │
│ Reject Status                       │
│ ┌─────────────────────────────────┐ │
│ │ All Items                     ▾ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Entered By (Admin/Supervisor)       │
│ ☐ John Doe                          │
│ ☐ Jane Smith                        │
│ ☐ Bob Johnson                       │
│                                     │
│ Sort By                             │
│ ┌──────────────┬──────────────────┐ │
│ │ Date       ▾ │ Descending     ▾ │ │
│ └──────────────┴──────────────────┘ │
│                                     │
│ [Reset All]                         │
└─────────────────────────────────────┘
```

## Data Table (Desktop View)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ☑ │ Item Name │ Batch  │ Quantity │ Reject │ Reject % │ Dest  │ Category │ … │
├───┼───────────┼────────┼──────────┼────────┼──────────┼───────┼──────────┼───┤
│ ☐ │ Rice      │ B12345 │    1,000 │     50 │   🟢 5%  │ MAIS  │ Grains   │ ⋮ │
│ ☐ │ Corn      │ B12346 │    2,000 │    100 │   🟡 5%  │ FOZAN │ Grains   │ ⋮ │
│ ☐ │ Wheat     │ B12347 │    1,500 │    200 │   🔴 13% │ MAIS  │ Grains   │ ⋮ │
│ ☐ │ Beans     │ B12348 │    3,000 │      0 │   🟢 0%  │ FOZAN │ Legumes  │ ⋮ │
│ ☐ │ Flour     │ B12349 │    2,500 │    150 │   🟡 6%  │ MAIS  │ Grains   │ ⋮ │
└───┴───────────┴────────┴──────────┴────────┴──────────┴───────┴──────────┴───┘
```

## Row Actions Menu

```
┌─────────────────────┐
│ Edit                │
│ Duplicate           │
│ Copy Batch Number   │
│ ─────────────────── │
│ Delete (Admin)      │
└─────────────────────┘
```

## Edit Modal

```
┌─────────────────────────────────────────────────────────┐
│ Edit Inventory Item                                  ✕  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Item Name *              Batch Number *                │
│  ┌──────────────────┐    ┌──────────────────┐          │
│  │ Rice             │    │ B12345           │          │
│  └──────────────────┘    └──────────────────┘          │
│                                                         │
│  Quantity *               Reject                        │
│  ┌──────────────────┐    ┌──────────────────┐          │
│  │ 1000             │    │ 50               │          │
│  └──────────────────┘    └──────────────────┘          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Reject Percentage: 5.00%                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Destination *            Category                      │
│  ┌──────────────────┐    ┌──────────────────┐          │
│  │ MAIS           ▾ │    │ Grains           │          │
│  └──────────────────┘    └──────────────────┘          │
│                                                         │
│  Notes                                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│  0/500 characters                                       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Created by: John Doe                            │   │
│  │ Created at: 21 Jan 2024, 10:30                  │   │
│  │ Last updated: 21 Jan 2024, 14:45                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                              [Cancel] [Save Changes]    │
└─────────────────────────────────────────────────────────┘
```

## Delete Confirmation Dialog

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️  Delete Inventory Item                            ✕  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Are you sure you want to delete this item?             │
│  This action cannot be undone.                          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Item: Rice                                      │   │
│  │ Batch: B12345                                   │   │
│  │ Quantity: 1000                                  │   │
│  │ Destination: MAIS                               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ☑ I understand this action cannot be undone           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                              [Cancel] [Delete Item]     │
└─────────────────────────────────────────────────────────┘
```

## Export Menu

```
┌─────────────────────────────┐
│ Export 3 items              │
├─────────────────────────────┤
│ 📄 Export as CSV            │
│ 📊 Export as Excel          │
│ 📑 Export as PDF            │
│ 💾 Export as JSON           │
└─────────────────────────────┘
```

## Pagination Bar

```
┌─────────────────────────────────────────────────────────────────────┐
│ Showing 1-50 of 1,234 items  Per page: [50 ▾]                      │
│                                                                     │
│                    [Previous] [1] [2] [3] ... [25] [Next]          │
└─────────────────────────────────────────────────────────────────────┘
```

## Bulk Actions Banner

```
┌─────────────────────────────────────────────────────────────────────┐
│ ℹ️ 3 items selected  [Clear selection]        [Delete Selected]     │
└─────────────────────────────────────────────────────────────────────┘
```

## Mobile View

```
┌─────────────────────────────┐
│ 📊 Inventory Data Log       │
│ View and manage entries     │
│                             │
│ 🔄 5s ago ⟳ [ ] Auto  📥    │
├─────────────────────────────┤
│ Filters                  ▼  │
├─────────────────────────────┤
│                             │
│ ┌─────────────────────────┐ │
│ │ 🔍 Search...            │ │
│ └─────────────────────────┘ │
│                             │
│ [Today] [7d] [30d] [Month]  │
│                             │
│ ☑ MAIS  ☑ FOZAN             │
│                             │
│ [All Items ▾]               │
│                             │
│ [Date ▾] [Desc ▾]           │
│                             │
│ [Reset All]                 │
├─────────────────────────────┤
│                             │
│ ┌─────────────────────────┐ │
│ │ Rice                    │ │
│ │ B12345 • MAIS           │ │
│ │ Qty: 1,000 • Rej: 50    │ │
│ │ 🟢 5%                   │ │
│ │                      ⋮  │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ Corn                    │ │
│ │ B12346 • FOZAN          │ │
│ │ Qty: 2,000 • Rej: 100   │ │
│ │ 🟡 5%                   │ │
│ │                      ⋮  │ │
│ └─────────────────────────┘ │
│                             │
│ [1] [2] [3] ... [25]        │
│ Showing 1-10 of 1,234       │
└─────────────────────────────┘
```

## Color Coding Reference

### Reject Percentage Badges
```
🟢 Green   0-5%     Good
🟡 Yellow  5-10%    Warning
🟠 Orange  10-15%   Caution
🔴 Red     >15%     Critical
```

### Destination Badges
```
🔵 Blue    MAIS
🟢 Green   FOZAN
```

## User Flow Diagrams

### Viewing Data Flow
```
User visits /data-log
    ↓
Page loads with default filters
    ↓
Fetch data from API
    ↓
Display table with items
    ↓
User can:
    • Apply filters
    • Search items
    • Sort columns
    • Change pages
    • Select items
    • Export data
```

### Edit Item Flow
```
User clicks row or Edit button
    ↓
Edit modal opens with item data
    ↓
User modifies fields
    ↓
User clicks Save Changes
    ↓
Validate input
    ↓
Send PUT request to API
    ↓
Update database
    ↓
Log audit entry
    ↓
Close modal & refresh table
    ↓
Show success message
```

### Delete Item Flow
```
User clicks Delete (requires role)
    ↓
Confirmation dialog opens
    ↓
User reviews item details
    ↓
User checks confirmation box
    ↓
User clicks Delete Item
    ↓
Send DELETE request to API
    ↓
Delete from database
    ↓
Log audit entry
    ↓
Close dialog & refresh table
    ↓
Show success message
```

### Export Flow
```
User clicks Export button
    ↓
Export menu opens
    ↓
User selects format (CSV/JSON/Excel/PDF)
    ↓
Determine data to export:
    • Selected items (if any)
    • All filtered items (if none selected)
    ↓
Generate file:
    • CSV/JSON: Client-side
    • Excel/PDF: API call
    ↓
Download file
    ↓
Show success toast with file size
```

### Filter Flow
```
User applies filter
    ↓
Update filter state
    ↓
Save to localStorage
    ↓
Reset to page 1
    ↓
Fetch data with new filters
    ↓
Update table
    ↓
Show active filter count badge
```

## Keyboard Navigation

```
Tab         → Navigate between elements
Shift+Tab   → Navigate backwards
Enter       → Open edit modal (on row)
Escape      → Close modal
Space       → Toggle checkbox (on checkbox)
```

## Responsive Breakpoints

```
Mobile      < 640px     Card view, collapsed filters
Tablet      640-1024px  Simplified table, some columns hidden
Desktop     > 1024px    Full table, all columns visible
```

## State Persistence

```
localStorage Keys:
├── data-log-filters      → Filter state
├── data-log-columns      → Column preferences (future)
├── inventory-draft       → Draft for duplicate feature
├── recent-items          → Recent item names
└── last-destination      → Last selected destination
```

## API Request Examples

### GET /api/inventory
```
GET /api/inventory?page=1&limit=50&search=rice&destination=MAIS&sortBy=createdAt&sortOrder=desc
```

### PUT /api/inventory/[id]
```
PUT /api/inventory/abc123
{
  "itemName": "Rice",
  "batch": "B12345",
  "quantity": 1000,
  "reject": 50,
  "destination": "MAIS",
  "category": "Grains",
  "notes": "Updated notes"
}
```

### DELETE /api/inventory/[id]
```
DELETE /api/inventory/abc123
```

### POST /api/inventory/bulk-delete
```
POST /api/inventory/bulk-delete
{
  "ids": ["abc123", "def456", "ghi789"]
}
```

## Error States

### No Items Found
```
┌─────────────────────────────────────┐
│                                     │
│           📦                        │
│                                     │
│      No items found                 │
│                                     │
│  Try adjusting your filters or      │
│  add new inventory items.           │
│                                     │
└─────────────────────────────────────┘
```

### Loading State
```
┌─────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
└─────────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────┐
│ ⚠️ Failed to load inventory data    │
│                                     │
│ [Retry]                             │
└─────────────────────────────────────┘
```

## Success Messages

```
✅ Item updated successfully
✅ Item deleted successfully
✅ 3 items deleted successfully
✅ Exported 50 items (125 KB)
✅ Batch number copied to clipboard
```

## Icon Legend

```
🔍 Search
📅 Date/Calendar
📍 Location/Destination
🏷️ Category/Tag
⚠️ Warning/Reject
👤 User/Person
🔄 Refresh/Sync
📥 Export/Download
📊 Chart/Analytics
✕ Close
⋮ More options/Menu
☑ Checkbox checked
☐ Checkbox unchecked
▾ Dropdown
↓ Sort descending
↑ Sort ascending
```

This visual guide provides a comprehensive overview of the Data Log interface layout, components, and user interactions.
