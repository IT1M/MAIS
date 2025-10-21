# Data Log - Quick Start Guide

## Accessing the Data Log

1. Navigate to `/data-log` in your browser
2. You must be logged in to access this page
3. All authenticated users can view the data log

## Basic Usage

### Viewing Data
- The table displays all inventory entries by default
- Scroll horizontally on mobile to see all columns
- Click any row to open the edit modal

### Searching
1. Type in the search bar at the top of the filters panel
2. Search works across item names and batch numbers
3. Results update automatically after 300ms

### Filtering by Date
1. Click a preset button (Today, Last 7 Days, etc.) for quick filtering
2. Or select custom dates using the date inputs
3. Click "Clear dates" to remove date filters

### Filtering by Destination
1. Check MAIS and/or FOZAN boxes
2. Uncheck to remove filter
3. Leave all unchecked to show all destinations

### Filtering by Reject Status
1. Open the "Reject Status" dropdown
2. Select:
   - **All Items** - Show everything
   - **No Rejects** - Only items with 0 rejects
   - **Has Rejects** - Only items with rejects > 0
   - **High Rejects** - Only items with >10% reject rate

### Sorting
1. Select sort field: Date, Item Name, Quantity, or Batch
2. Select sort order: Ascending or Descending
3. Results update immediately

### Resetting Filters
Click the "Reset All" button to clear all filters and return to default view

## Working with Items

### Editing an Item
1. Click on any row in the table
2. Or click the three-dot menu → "Edit"
3. Modify fields in the modal
4. Click "Save Changes"
5. Confirm if you try to close with unsaved changes

### Duplicating an Item
1. Click the three-dot menu on a row
2. Select "Duplicate"
3. You'll be redirected to the data entry page with pre-filled data
4. The batch number will have "-COPY" appended

### Copying Batch Number
1. Click the three-dot menu on a row
2. Select "Copy Batch"
3. The batch number is copied to your clipboard

### Deleting an Item
**Note: Requires SUPERVISOR or ADMIN role**

1. Click the three-dot menu on a row
2. Select "Delete"
3. Review the item details in the confirmation dialog
4. Check "I understand this action cannot be undone"
5. Click "Delete Item"

## Bulk Operations

### Selecting Multiple Items
1. Check the checkbox in the table header to select all visible items
2. Or check individual item checkboxes
3. A blue banner appears showing selection count

### Bulk Delete
**Note: Requires SUPERVISOR or ADMIN role**

1. Select items using checkboxes
2. Click "Delete Selected" in the blue banner
3. Confirm the deletion
4. All selected items will be deleted

### Clearing Selection
Click "Clear selection" in the blue banner

## Exporting Data

### Export Options
1. Click the green "Export" button in the header
2. Choose format:
   - **CSV** - For Excel and spreadsheet apps
   - **Excel** - Formatted spreadsheet (requires API)
   - **PDF** - Printable document (requires API)
   - **JSON** - For developers and data processing

### Export Selected Items
1. Select items using checkboxes
2. Click "Export"
3. The export will only include selected items
4. The button shows the count of selected items

### Export All Filtered Items
1. Don't select any items
2. Apply your desired filters
3. Click "Export"
4. All filtered items will be exported

## Pagination

### Changing Pages
- Click "Previous" or "Next" buttons
- Click specific page numbers
- Your filters are preserved when changing pages

### Items Per Page
1. Find the "Per page" dropdown in the pagination bar
2. Select: 10, 25, 50, 100, or 200
3. The page resets to 1 when changing this value

### Viewing Item Count
The pagination bar shows: "Showing 1-50 of 1,234 items"

## Auto-Refresh

### Enabling Auto-Refresh
1. Check the "Auto-refresh" checkbox in the header
2. Data will refresh every 30 seconds
3. Your current page and filters are preserved

### Manual Refresh
Click the refresh icon (circular arrow) in the header at any time

### Last Update Time
The header shows "Updated Xs ago" or "Updated Xm ago"

## Understanding the Table

### Column Meanings
- **Item Name** - Name of the inventory item
- **Batch** - Batch number (monospace font)
- **Quantity** - Total quantity
- **Reject** - Number of rejected items
- **Reject %** - Calculated percentage with color coding:
  - 🟢 Green: 0-5%
  - 🟡 Yellow: 5-10%
  - 🟠 Orange: 10-15%
  - 🔴 Red: >15%
- **Destination** - MAIS (blue) or FOZAN (green)
- **Category** - Item category (if set)
- **Entered By** - User who created the entry
- **Date Added** - When the entry was created

### Responsive Columns
On smaller screens, some columns are hidden:
- **Mobile**: Only shows Item, Batch, Quantity, Reject, Reject %, Destination, Actions
- **Tablet**: Also shows Category
- **Desktop**: Shows all columns

## Keyboard Shortcuts

### Current Support
- **Tab** - Navigate between elements
- **Enter** - Open edit modal (when row is focused)
- **Escape** - Close modals

### Future Shortcuts (Planned)
- Arrow keys for table navigation
- Ctrl/Cmd + F for search focus
- Ctrl/Cmd + E for export
- Ctrl/Cmd + R for refresh

## Tips & Tricks

### Finding Specific Items
1. Use the search bar for item names or batch numbers
2. Combine search with filters for precise results
3. Sort by item name for alphabetical browsing

### Reviewing Recent Entries
1. Sort by Date (descending)
2. Select "Today" or "Last 7 Days" preset
3. Optionally filter by your user (if admin/supervisor)

### Finding Problem Items
1. Select "High Rejects (>10%)" in reject filter
2. Sort by Reject % (descending)
3. Review and edit as needed

### Exporting Reports
1. Apply date range (e.g., "This Month")
2. Apply any other needed filters
3. Export as CSV or Excel
4. Open in spreadsheet software for analysis

### Bulk Editing Destination
1. Filter by old destination
2. Select all items
3. Use bulk operations (future feature)
4. Or edit individually

### Sharing Filtered Views
1. Apply your filters
2. Copy the URL from your browser
3. Share with colleagues
4. They'll see the same filtered view

## Troubleshooting

### "No items found"
- Check your filters - you may have filtered out all items
- Click "Reset All" to clear filters
- Verify items exist in the database

### Search not working
- Wait 300ms for debounce
- Check for typos
- Try partial matches
- Clear and try again

### Export button disabled
- Ensure there are items to export
- Check that you're not in a loading state
- Try refreshing the page

### Can't delete items
- Verify you have SUPERVISOR or ADMIN role
- Check that the item exists
- Try refreshing the page

### Slow performance
- Reduce items per page to 25 or 10
- Use more specific filters
- Disable auto-refresh
- Clear browser cache

## Mobile Usage

### Filter Panel
- Tap the arrow icon to collapse/expand filters
- Filters appear as a panel on mobile
- Scroll within the filter panel

### Table Interaction
- Swipe horizontally to see all columns
- Tap a row to edit
- Tap the three-dot menu for actions
- Use two fingers to scroll the page

### Bulk Selection
- Tap checkboxes to select items
- The selection banner appears at the top
- Scroll to see all selected items

## Best Practices

### Regular Reviews
- Check the data log daily for new entries
- Review high reject items weekly
- Export monthly reports for records

### Data Quality
- Edit items immediately if you spot errors
- Add categories to items for better filtering
- Include notes for unusual entries

### Performance
- Use filters to narrow down large datasets
- Export in smaller batches for large datasets
- Close unused browser tabs

### Security
- Log out when finished
- Don't share your login credentials
- Report suspicious entries to administrators

## Getting Help

### In-App Help
- Hover over elements for tooltips (future feature)
- Check error messages for guidance
- Use the refresh button if something seems wrong

### Documentation
- Read the full documentation: `DATA_LOG_DOCUMENTATION.md`
- Check API documentation for developers
- Review the implementation summary

### Support
- Contact your system administrator
- Report bugs with screenshots
- Suggest features for future updates

## Next Steps

1. **Explore the interface** - Click around and get familiar
2. **Try filtering** - Apply different filters to see results
3. **Practice editing** - Edit a test item to learn the process
4. **Export data** - Try exporting in different formats
5. **Review documentation** - Read the full docs for advanced features

---

**Quick Reference Card**

| Action | How To |
|--------|--------|
| Search | Type in search bar (top of filters) |
| Filter by date | Click preset or select custom dates |
| Sort | Use sort dropdowns at bottom of filters |
| Edit item | Click row or three-dot menu → Edit |
| Delete item | Three-dot menu → Delete (requires role) |
| Select multiple | Check checkboxes in table |
| Export | Click green Export button in header |
| Refresh | Click refresh icon in header |
| Reset filters | Click "Reset All" button |
| Change page | Use pagination controls at bottom |

**Color Codes**

| Color | Meaning |
|-------|---------|
| 🟢 Green | Good (0-5% rejects) |
| 🟡 Yellow | Warning (5-10% rejects) |
| 🟠 Orange | Caution (10-15% rejects) |
| 🔴 Red | Critical (>15% rejects) |
| 🔵 Blue | MAIS destination |
| 🟢 Green | FOZAN destination |

**Role Requirements**

| Action | Required Role |
|--------|---------------|
| View data | Any authenticated user |
| Edit own entries | DATA_ENTRY or higher |
| Edit any entry | SUPERVISOR or ADMIN |
| Delete items | SUPERVISOR or ADMIN |
| Bulk delete | SUPERVISOR or ADMIN |
| Export data | Any authenticated user |
| View all users | ADMIN or SUPERVISOR |
