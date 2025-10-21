# Data Log - Testing Guide

## Pre-Testing Setup

### 1. Database Setup
Ensure you have test data in the database:
```bash
npm run prisma:studio
```

Create at least 20-30 test inventory items with:
- Various item names
- Different batch numbers
- Different quantities (0-10000)
- Different reject values (0-1000)
- Both MAIS and FOZAN destinations
- Various categories
- Different dates
- Different users (if testing as admin)

### 2. User Accounts
Create test accounts with different roles:
- DATA_ENTRY user
- SUPERVISOR user
- ADMIN user

### 3. Browser Setup
Test in multiple browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Functional Testing

### Test 1: Page Load
**Steps:**
1. Navigate to `/data-log`
2. Verify authentication redirect if not logged in
3. Log in and navigate again

**Expected:**
- Page loads within 2 seconds
- Table displays with data
- Filters panel visible
- No console errors

**Status:** [ ]

---

### Test 2: Search Functionality
**Steps:**
1. Type "rice" in search bar
2. Wait 300ms
3. Verify results update
4. Clear search
5. Try searching by batch number

**Expected:**
- Results filter to matching items
- Debounce works (no request before 300ms)
- Clear button removes search
- Both item name and batch search work

**Status:** [ ]

---

### Test 3: Date Range Filter
**Steps:**
1. Click "Today" preset
2. Verify results show only today's items
3. Click "Last 7 Days"
4. Verify results update
5. Select custom date range
6. Click "Clear dates"

**Expected:**
- Presets work correctly
- Custom dates filter properly
- Clear removes date filter
- Date inputs accept valid dates

**Status:** [ ]

---

### Test 4: Destination Filter
**Steps:**
1. Check only MAIS
2. Verify only MAIS items shown
3. Check only FOZAN
4. Verify only FOZAN items shown
5. Check both
6. Uncheck both

**Expected:**
- Single destination filters work
- Multiple destinations work (OR logic)
- Unchecking all shows all items

**Status:** [ ]

---

### Test 5: Category Filter
**Steps:**
1. Check one category
2. Verify filtering works
3. Check multiple categories
4. Uncheck all

**Expected:**
- Single category filters work
- Multiple categories work (OR logic)
- Unchecking all shows all items

**Status:** [ ]

---

### Test 6: Reject Filter
**Steps:**
1. Select "No Rejects"
2. Verify only items with reject=0 shown
3. Select "Has Rejects"
4. Verify only items with reject>0 shown
5. Select "High Rejects (>10%)"
6. Verify only items with >10% shown
7. Select "All Items"

**Expected:**
- Each filter option works correctly
- Reject percentage calculated correctly
- All items shown when "All Items" selected

**Status:** [ ]

---

### Test 7: Entered By Filter (Admin/Supervisor)
**Steps:**
1. Log in as ADMIN or SUPERVISOR
2. Check one user
3. Verify only that user's items shown
4. Check multiple users
5. Uncheck all

**Expected:**
- Filter only visible to ADMIN/SUPERVISOR
- Single user filter works
- Multiple users work (OR logic)
- Unchecking all shows all items

**Status:** [ ]

---

### Test 8: Sort Functionality
**Steps:**
1. Sort by Date (ascending)
2. Verify oldest items first
3. Sort by Date (descending)
4. Verify newest items first
5. Sort by Item Name (ascending)
6. Verify alphabetical order
7. Sort by Quantity
8. Sort by Batch

**Expected:**
- All sort options work correctly
- Ascending/descending work
- Sort persists across page changes

**Status:** [ ]

---

### Test 9: Pagination
**Steps:**
1. Verify initial page is 1
2. Click "Next"
3. Verify page 2 loads
4. Click page number directly
5. Click "Previous"
6. Change items per page to 10
7. Verify page resets to 1
8. Change to 100

**Expected:**
- Navigation works correctly
- Page numbers update
- Items per page changes work
- Total count accurate
- Filters persist across pages

**Status:** [ ]

---

### Test 10: Table Selection
**Steps:**
1. Click checkbox in header
2. Verify all items selected
3. Click again to deselect all
4. Select individual items
5. Verify selection count

**Expected:**
- Select all works
- Deselect all works
- Individual selection works
- Count accurate
- Bulk actions banner appears

**Status:** [ ]

---

### Test 11: Edit Item
**Steps:**
1. Click a table row
2. Verify modal opens with data
3. Modify item name
4. Click "Save Changes"
5. Verify success message
6. Verify table updates

**Expected:**
- Modal opens with correct data
- All fields editable
- Validation works
- Save updates database
- Table refreshes
- Audit log created

**Status:** [ ]

---

### Test 12: Edit Validation
**Steps:**
1. Open edit modal
2. Clear item name
3. Try to save
4. Enter reject > quantity
5. Try to save
6. Enter invalid batch format

**Expected:**
- Required field validation works
- Reject <= quantity validation works
- Batch format validation works
- Error messages clear

**Status:** [ ]

---

### Test 13: Delete Item (Supervisor)
**Steps:**
1. Log in as SUPERVISOR
2. Click three-dot menu
3. Click "Delete"
4. Verify confirmation dialog
5. Try to delete without checking box
6. Check confirmation box
7. Click "Delete Item"

**Expected:**
- Delete option visible to SUPERVISOR
- Confirmation required
- Cannot delete without checkbox
- Item deleted from database
- Table refreshes
- Success message shown
- Audit log created

**Status:** [ ]

---

### Test 14: Delete Item (Data Entry)
**Steps:**
1. Log in as DATA_ENTRY user
2. Click three-dot menu
3. Verify no delete option

**Expected:**
- Delete option not visible
- Role-based access working

**Status:** [ ]

---

### Test 15: Duplicate Item
**Steps:**
1. Click three-dot menu
2. Click "Duplicate"
3. Verify redirect to data entry
4. Verify form pre-filled
5. Verify batch has "-COPY" suffix

**Expected:**
- Redirects to /data-entry
- Form pre-filled with item data
- Batch number modified
- Can save as new item

**Status:** [ ]

---

### Test 16: Copy Batch Number
**Steps:**
1. Click three-dot menu
2. Click "Copy Batch"
3. Paste in text editor

**Expected:**
- Batch number copied to clipboard
- Success message shown (optional)

**Status:** [ ]

---

### Test 17: Bulk Delete
**Steps:**
1. Log in as SUPERVISOR
2. Select 3 items
3. Click "Delete Selected"
4. Confirm deletion
5. Verify items deleted

**Expected:**
- Bulk delete button visible
- Confirmation required
- All selected items deleted
- Table refreshes
- Success message with count

**Status:** [ ]

---

### Test 18: Export CSV
**Steps:**
1. Click "Export" button
2. Select "Export as CSV"
3. Verify file downloads
4. Open in Excel/spreadsheet app

**Expected:**
- File downloads automatically
- UTF-8 encoding with BOM
- Headers in first row
- All data present
- Formatted correctly
- Success toast with file size

**Status:** [ ]

---

### Test 19: Export JSON
**Steps:**
1. Click "Export" button
2. Select "Export as JSON"
3. Verify file downloads
4. Open in text editor

**Expected:**
- File downloads automatically
- Valid JSON format
- Includes metadata
- All data present
- Properly structured

**Status:** [ ]

---

### Test 20: Export Selected Items
**Steps:**
1. Select 5 items
2. Click "Export"
3. Verify count shows "5"
4. Export as CSV
5. Verify only 5 items in file

**Expected:**
- Export count accurate
- Only selected items exported
- File size appropriate

**Status:** [ ]

---

### Test 21: Auto-Refresh
**Steps:**
1. Check "Auto-refresh" checkbox
2. Wait 30 seconds
3. Verify data refreshes
4. Uncheck checkbox
5. Wait 30 seconds
6. Verify no refresh

**Expected:**
- Auto-refresh works every 30s
- Current page preserved
- Filters preserved
- Can be disabled

**Status:** [ ]

---

### Test 22: Manual Refresh
**Steps:**
1. Click refresh icon
2. Verify loading indicator
3. Verify data refreshes

**Expected:**
- Refresh icon shows loading
- Data updates
- Current page preserved
- Filters preserved

**Status:** [ ]

---

### Test 23: Filter Persistence
**Steps:**
1. Apply multiple filters
2. Refresh page
3. Verify filters still applied
4. Close browser
5. Reopen and navigate to page

**Expected:**
- Filters saved to localStorage
- Filters restored on page load
- Works across sessions

**Status:** [ ]

---

### Test 24: Reset Filters
**Steps:**
1. Apply multiple filters
2. Click "Reset All"
3. Verify all filters cleared

**Expected:**
- All filters reset to default
- Search cleared
- Dates cleared
- Checkboxes unchecked
- Sort reset to default

**Status:** [ ]

---

### Test 25: Empty State
**Steps:**
1. Apply filters that return no results
2. Verify empty state shown

**Expected:**
- Empty state illustration shown
- Helpful message displayed
- No errors in console

**Status:** [ ]

---

### Test 26: Error State
**Steps:**
1. Disconnect from network
2. Try to load data
3. Verify error state shown
4. Click "Retry"

**Expected:**
- Error message shown
- Retry button visible
- Retry attempts to reload
- No crashes

**Status:** [ ]

---

### Test 27: Loading State
**Steps:**
1. Slow down network (DevTools)
2. Load page
3. Verify loading skeleton

**Expected:**
- Loading skeleton shown
- No flash of empty state
- Smooth transition to data

**Status:** [ ]

## Responsive Testing

### Test 28: Mobile View (< 640px)
**Steps:**
1. Resize browser to 375px width
2. Verify layout adapts
3. Test filter panel collapse
4. Test table scrolling
5. Test all interactions

**Expected:**
- Filters collapsible
- Table scrolls horizontally
- Less important columns hidden
- Touch-friendly controls
- All features work

**Status:** [ ]

---

### Test 29: Tablet View (640-1024px)
**Steps:**
1. Resize browser to 768px width
2. Verify layout adapts
3. Test all features

**Expected:**
- Partial column hiding
- Responsive grid layout
- All features work

**Status:** [ ]

---

### Test 30: Desktop View (> 1024px)
**Steps:**
1. Resize browser to 1920px width
2. Verify full layout
3. Test all features

**Expected:**
- All columns visible
- Full table view
- Optimal spacing
- All features work

**Status:** [ ]

## Performance Testing

### Test 31: Large Dataset
**Steps:**
1. Create 1000+ items in database
2. Load page
3. Measure load time
4. Test filtering
5. Test pagination

**Expected:**
- Load time < 2 seconds
- Filtering < 500ms
- Pagination < 300ms
- No lag or freezing

**Status:** [ ]

---

### Test 32: Search Performance
**Steps:**
1. Type quickly in search
2. Verify debouncing works
3. Measure response time

**Expected:**
- Only one request after 300ms
- Results < 500ms
- No lag while typing

**Status:** [ ]

---

### Test 33: Export Performance
**Steps:**
1. Export 1000 items as CSV
2. Measure time
3. Export as JSON
4. Measure time

**Expected:**
- CSV export < 5 seconds
- JSON export < 5 seconds
- No browser freeze
- File size reasonable

**Status:** [ ]

## Security Testing

### Test 34: Authentication
**Steps:**
1. Log out
2. Try to access /data-log
3. Verify redirect to login

**Expected:**
- Redirect to login page
- Cannot access without auth
- Callback URL preserved

**Status:** [ ]

---

### Test 35: Authorization - Edit
**Steps:**
1. Log in as DATA_ENTRY
2. Try to edit another user's item
3. Verify permission check

**Expected:**
- Can edit own items
- Cannot edit others' items (unless SUPERVISOR+)
- Appropriate error message

**Status:** [ ]

---

### Test 36: Authorization - Delete
**Steps:**
1. Log in as DATA_ENTRY
2. Verify no delete option
3. Log in as SUPERVISOR
4. Verify delete option visible

**Expected:**
- Role-based access enforced
- UI reflects permissions
- API enforces permissions

**Status:** [ ]

---

### Test 37: Input Validation
**Steps:**
1. Try to edit with invalid data
2. Try SQL injection in search
3. Try XSS in notes field

**Expected:**
- Validation prevents invalid data
- SQL injection prevented
- XSS prevented
- No security vulnerabilities

**Status:** [ ]

---

### Test 38: Audit Logging
**Steps:**
1. Create an item
2. Edit an item
3. Delete an item
4. Check audit logs in database

**Expected:**
- All actions logged
- User ID recorded
- Timestamp recorded
- Old/new values stored
- IP address recorded

**Status:** [ ]

## Accessibility Testing

### Test 39: Keyboard Navigation
**Steps:**
1. Use only keyboard
2. Tab through all elements
3. Press Enter on row
4. Press Escape in modal

**Expected:**
- All elements reachable
- Focus visible
- Enter opens modal
- Escape closes modal
- Logical tab order

**Status:** [ ]

---

### Test 40: Screen Reader
**Steps:**
1. Enable screen reader
2. Navigate page
3. Verify announcements

**Expected:**
- All elements announced
- Labels clear
- Context provided
- No confusion

**Status:** [ ]

---

### Test 41: Color Contrast
**Steps:**
1. Check all text colors
2. Verify contrast ratios
3. Test with color blindness simulator

**Expected:**
- All text meets WCAG AA
- Color not sole indicator
- Patterns/icons supplement color

**Status:** [ ]

## Browser Compatibility

### Test 42: Chrome
**Steps:**
1. Test all features in Chrome
2. Check console for errors

**Expected:**
- All features work
- No console errors
- Optimal performance

**Status:** [ ]

---

### Test 43: Firefox
**Steps:**
1. Test all features in Firefox
2. Check console for errors

**Expected:**
- All features work
- No console errors
- Good performance

**Status:** [ ]

---

### Test 44: Safari
**Steps:**
1. Test all features in Safari
2. Check console for errors

**Expected:**
- All features work
- No console errors
- Good performance

**Status:** [ ]

---

### Test 45: Edge
**Steps:**
1. Test all features in Edge
2. Check console for errors

**Expected:**
- All features work
- No console errors
- Good performance

**Status:** [ ]

## Integration Testing

### Test 46: API Integration
**Steps:**
1. Monitor network requests
2. Verify correct endpoints called
3. Verify request/response format

**Expected:**
- Correct API endpoints
- Proper request format
- Proper response handling
- Error handling works

**Status:** [ ]

---

### Test 47: Database Integration
**Steps:**
1. Create item via UI
2. Check database
3. Edit item via UI
4. Check database
5. Delete item via UI
6. Check database

**Expected:**
- All operations persist
- Data integrity maintained
- Relationships preserved
- Audit logs created

**Status:** [ ]

## Edge Cases

### Test 48: No Data
**Steps:**
1. Empty database
2. Load page

**Expected:**
- Empty state shown
- No errors
- Helpful message

**Status:** [ ]

---

### Test 49: Single Item
**Steps:**
1. Database with 1 item
2. Load page

**Expected:**
- Item displayed correctly
- Pagination shows 1 page
- All features work

**Status:** [ ]

---

### Test 50: Maximum Values
**Steps:**
1. Create item with max quantity
2. Create item with max reject
3. Test with 500 char notes

**Expected:**
- Large numbers handled
- No overflow issues
- Max length enforced

**Status:** [ ]

## Test Summary

Total Tests: 50
Passed: [ ]
Failed: [ ]
Skipped: [ ]

## Bug Report Template

```
Bug ID: 
Title: 
Severity: Critical / High / Medium / Low
Priority: P0 / P1 / P2 / P3

Steps to Reproduce:
1. 
2. 
3. 

Expected Result:


Actual Result:


Environment:
- Browser: 
- OS: 
- Screen Size: 
- User Role: 

Screenshots:


Console Errors:


Additional Notes:

```

## Performance Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Initial Load | < 2s | | |
| Filter Apply | < 500ms | | |
| Page Change | < 300ms | | |
| Search Response | < 500ms | | |
| Export (1000 items) | < 5s | | |

## Test Sign-off

- [ ] All functional tests passed
- [ ] All responsive tests passed
- [ ] All performance tests passed
- [ ] All security tests passed
- [ ] All accessibility tests passed
- [ ] All browser tests passed
- [ ] All integration tests passed
- [ ] All edge cases tested
- [ ] Documentation reviewed
- [ ] Ready for production

**Tested By:** _______________
**Date:** _______________
**Signature:** _______________
