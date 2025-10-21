# Data Log - Setup & Installation Guide

## Prerequisites

Before setting up the Data Log feature, ensure you have:

- ✅ Next.js 15.1.3 or higher
- ✅ Node.js 18+ installed
- ✅ PostgreSQL database configured
- ✅ Prisma ORM set up
- ✅ Authentication system (NextAuth) configured
- ✅ Existing inventory API endpoints

## Installation Steps

### Step 1: Verify Files

All necessary files should already be created. Verify they exist:

```bash
# Check page
ls src/app/[locale]/data-log/page.tsx

# Check components
ls src/components/filters/InventoryFilters.tsx
ls src/components/tables/InventoryTable.tsx
ls src/components/ui/Pagination.tsx
ls src/components/export/ExportButton.tsx
ls src/components/modals/EditInventoryModal.tsx
ls src/components/modals/DeleteConfirmDialog.tsx

# Check hooks
ls src/hooks/useDataLog.ts

# Check API routes
ls src/app/api/inventory/[id]/route.ts
ls src/app/api/inventory/bulk-delete/route.ts

# Check utilities
ls src/lib/date-presets.ts
ls src/lib/export-utils.ts

# Check types
ls src/types/data-log.ts
```

### Step 2: Verify Dependencies

All required dependencies should already be installed. Verify:

```bash
npm list next react react-dom next-auth @prisma/client zod react-hot-toast
```

If any are missing, install them:

```bash
npm install next@15.1.3 react@19 react-dom@19 next-auth@5.0.0-beta.25 @prisma/client@6.1.0 zod@3.24.1 react-hot-toast@2.4.1
```

### Step 3: Database Setup

The Data Log uses the existing `InventoryItem` model. No new migrations needed.

Verify your database schema:

```bash
npm run prisma:studio
```

Check that the `inventory_items` table exists with these fields:
- id (String, UUID)
- itemName (String)
- batch (String)
- quantity (Int)
- reject (Int)
- destination (Enum: MAIS, FOZAN)
- category (String, nullable)
- notes (Text, nullable)
- enteredBy (String, foreign key to users)
- createdAt (DateTime)
- updatedAt (DateTime)

### Step 4: Middleware Configuration

The middleware should already be updated. Verify:

```bash
grep "data-log" src/middleware.ts
```

Should show:
```typescript
const protectedRoutes = ['/dashboard', '/inventory', '/reports', '/users', '/settings', '/data-entry', '/data-log'];
```

### Step 5: Build & Test

Build the project to check for errors:

```bash
npm run build
```

If successful, start the development server:

```bash
npm run dev
```

### Step 6: Access the Page

1. Open your browser
2. Navigate to `http://localhost:3000/data-log` (or your locale path)
3. You should be redirected to login if not authenticated
4. Log in and verify the page loads

## Configuration

### Environment Variables

No new environment variables are required. Ensure these exist:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### Locale Configuration

If using internationalization, ensure your locale is configured:

```typescript
// next.config.ts or i18n config
locales: ['en', 'ar']
defaultLocale: 'en'
```

### Role Configuration

Ensure your user roles are set up correctly in the database:

```sql
-- Check user roles
SELECT id, email, name, role FROM users;

-- Update a user's role if needed
UPDATE users SET role = 'SUPERVISOR' WHERE email = 'user@example.com';
```

## Testing Setup

### Create Test Data

Create test inventory items for testing:

```bash
npm run prisma:studio
```

Or use the data entry page to create items manually.

### Test User Accounts

Create test accounts with different roles:

1. **DATA_ENTRY User**
   - Can view and edit own entries
   - Cannot delete

2. **SUPERVISOR User**
   - Can view and edit all entries
   - Can delete entries
   - Can see user filter

3. **ADMIN User**
   - Full access to all features
   - Can see user filter

### Sample Test Data

Create items with:
- Various item names (Rice, Corn, Wheat, Beans, etc.)
- Different batch numbers (B12345, B12346, etc.)
- Different quantities (100-10000)
- Different reject values (0-1000)
- Both MAIS and FOZAN destinations
- Various categories (Grains, Legumes, etc.)
- Different dates (past week, month, etc.)

## Verification Checklist

### Page Load
- [ ] Page loads without errors
- [ ] Table displays data
- [ ] Filters panel visible
- [ ] No console errors

### Filtering
- [ ] Search works
- [ ] Date range works
- [ ] Destination filter works
- [ ] Category filter works
- [ ] Reject filter works
- [ ] User filter works (admin/supervisor)
- [ ] Sort works

### Table Features
- [ ] Pagination works
- [ ] Selection works
- [ ] Row actions menu works
- [ ] Color coding correct

### Modals
- [ ] Edit modal opens
- [ ] Edit saves correctly
- [ ] Delete confirmation works
- [ ] Validation works

### Export
- [ ] CSV export works
- [ ] JSON export works
- [ ] File downloads correctly

### Permissions
- [ ] DATA_ENTRY cannot delete
- [ ] SUPERVISOR can delete
- [ ] User filter only for admin/supervisor

## Troubleshooting

### Issue: Page Not Found (404)

**Solution:**
1. Verify file exists: `src/app/[locale]/data-log/page.tsx`
2. Check middleware includes `/data-log` in protected routes
3. Restart dev server

### Issue: Authentication Error

**Solution:**
1. Verify NextAuth is configured
2. Check session is valid
3. Clear cookies and log in again

### Issue: No Data Displayed

**Solution:**
1. Check database has inventory items
2. Verify API endpoint works: `GET /api/inventory`
3. Check browser console for errors
4. Verify user has permission to view data

### Issue: TypeScript Errors

**Solution:**
1. Run `npm run build` to see errors
2. Check all imports are correct
3. Verify types are defined
4. Run `npm install` to ensure dependencies

### Issue: Export Not Working

**Solution:**
1. Check browser allows downloads
2. Verify data exists to export
3. Check console for errors
4. Try different export format

### Issue: Filters Not Working

**Solution:**
1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Check console for errors
4. Verify API supports filter parameters

### Issue: Slow Performance

**Solution:**
1. Reduce items per page
2. Use more specific filters
3. Check database indexes
4. Monitor network requests

## Development Tips

### Hot Reload

The page supports hot reload. Changes to components will update automatically.

### Debug Mode

Enable debug logging:

```typescript
// In useDataLog.ts
console.log('Fetching data with filters:', filters);
console.log('Response:', result);
```

### Browser DevTools

Use React DevTools to inspect:
- Component state
- Props
- Re-renders

### Network Monitoring

Monitor API requests in Network tab:
- Request URL
- Request payload
- Response data
- Response time

## Customization

### Change Items Per Page Options

Edit `src/hooks/useDataLog.ts`:

```typescript
const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100, 200];
```

### Change Auto-Refresh Interval

Edit `src/app/[locale]/data-log/page.tsx`:

```typescript
const interval = setInterval(() => {
  refresh();
}, 30000); // Change to desired milliseconds
```

### Add New Filter

1. Add to `FilterState` type in `src/types/data-log.ts`
2. Add UI in `src/components/filters/InventoryFilters.tsx`
3. Add logic in `src/hooks/useDataLog.ts`
4. Update API to support new filter

### Customize Colors

Edit Tailwind classes in components:

```typescript
// Reject badge colors
const getRejectBadgeColor = (rejectPercent: number) => {
  if (rejectPercent === 0) return 'bg-green-100 text-green-800';
  // ... customize colors
};
```

## Production Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

Set production environment variables:

```env
DATABASE_URL="postgresql://production-db..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="production-secret-key"
```

### Performance Optimization

1. Enable caching
2. Use CDN for static assets
3. Optimize database queries
4. Enable compression

### Monitoring

Set up monitoring for:
- Page load time
- API response time
- Error rate
- User activity

## Maintenance

### Regular Tasks

1. **Weekly**
   - Review audit logs
   - Check error logs
   - Monitor performance

2. **Monthly**
   - Update dependencies
   - Review user feedback
   - Optimize queries

3. **Quarterly**
   - Security audit
   - Performance review
   - Feature planning

### Updates

To update the feature:

1. Make changes to components
2. Test locally
3. Run build
4. Deploy to production
5. Monitor for issues

## Support

### Documentation

- **User Guide:** `DATA_LOG_QUICK_START.md`
- **Technical Docs:** `DATA_LOG_DOCUMENTATION.md`
- **Testing Guide:** `DATA_LOG_TESTING_GUIDE.md`
- **Visual Guide:** `DATA_LOG_VISUAL_GUIDE.md`

### Getting Help

1. Check documentation
2. Review troubleshooting section
3. Check GitHub issues (if applicable)
4. Contact development team

## Next Steps

After setup:

1. ✅ Run through verification checklist
2. ✅ Create test data
3. ✅ Test all features
4. ✅ Review documentation
5. ✅ Train users
6. ✅ Deploy to production

## Success Criteria

Setup is complete when:

- [ ] Page loads without errors
- [ ] All filters work correctly
- [ ] Table displays data properly
- [ ] Edit and delete work
- [ ] Export functions work
- [ ] Permissions enforced correctly
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Documentation reviewed

## Quick Start Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations (if needed)
npm run prisma:migrate

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Open Prisma Studio
npm run prisma:studio
```

## Conclusion

The Data Log feature is now set up and ready to use. Follow the verification checklist to ensure everything works correctly, then proceed with testing and deployment.

For any issues, refer to the troubleshooting section or consult the comprehensive documentation.

---

**Setup Version:** 1.0.0
**Last Updated:** October 21, 2024
**Status:** Ready for Use
