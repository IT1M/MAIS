# Deployment Checklist

## Pre-Deployment

### Code Quality
- [ ] Run `npm run type-check` - No TypeScript errors
- [ ] Run `npm run lint` - No linting errors
- [ ] Run `npm run validate-translations` - All translations in sync
- [ ] Run `npm run build` locally - Build succeeds
- [ ] Test all pages in both English and Arabic
- [ ] Test RTL layout in Arabic mode

### Database
- [ ] All Prisma migrations applied locally
- [ ] Test migrations on staging database
- [ ] Database backups configured
- [ ] Connection pooling enabled (PgBouncer)

### Environment Variables (Vercel Dashboard)
- [ ] `DATABASE_URL` - Production database URL with pooling
- [ ] `NEXTAUTH_URL` - Production domain URL
- [ ] `NEXTAUTH_SECRET` - Unique 32+ character secret
- [ ] `GEMINI_API_KEY` - Valid API key
- [ ] `GEMINI_MODEL` - Model name (gemini-1.5-pro)
- [ ] `NEXT_PUBLIC_APP_URL` - Production URL
- [ ] `NEXT_PUBLIC_ENABLE_AI_INSIGHTS` - true/false
- [ ] `NEXT_PUBLIC_ENABLE_AUTO_BACKUP` - true/false
- [ ] `EMAIL_SERVER` - SMTP server (optional)
- [ ] `EMAIL_FROM` - From email address (optional)
- [ ] `API_RATE_LIMIT_PER_MINUTE` - Rate limit value
- [ ] `LOG_LEVEL` - error (for production)

### Security
- [ ] NEXTAUTH_SECRET is unique and random
- [ ] All secrets marked as "Encrypted" in Vercel
- [ ] Security headers configured in vercel.json
- [ ] CORS settings reviewed
- [ ] Rate limiting configured

### Performance
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Lazy loading for heavy components
- [ ] API routes optimized
- [ ] Database queries indexed

## Deployment Steps

### 1. Connect Repository
- [ ] Link GitHub repository to Vercel
- [ ] Select main/production branch
- [ ] Enable automatic deployments

### 2. Configure Build Settings
- [ ] Framework preset: Next.js
- [ ] Build command: `npm run vercel-build`
- [ ] Output directory: `.next`
- [ ] Install command: `npm install`
- [ ] Node version: 20.x

### 3. Set Environment Variables
- [ ] Add all production environment variables
- [ ] Mark sensitive vars as "Encrypted"
- [ ] Verify all required vars are set

### 4. Run Database Migrations
```bash
# Pull environment variables
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy --schema=./src/db/schema.prisma
```

### 5. Deploy
- [ ] Push to main branch (triggers automatic deployment)
- [ ] Or manual deploy via Vercel dashboard
- [ ] Or via CLI: `vercel --prod`

### 6. Post-Deployment Verification
- [ ] Check deployment logs for errors
- [ ] Test homepage loads
- [ ] Test authentication flow
- [ ] Test data entry page
- [ ] Test analytics dashboard
- [ ] Test audit log
- [ ] Test backup functionality
- [ ] Verify database connectivity
- [ ] Validate Gemini AI integration
- [ ] Test language switching (EN/AR)
- [ ] Verify RTL layout in Arabic
- [ ] Test on mobile devices
- [ ] Check all API routes

## Custom Domain Setup

- [ ] Add domain in Vercel dashboard
- [ ] Update DNS records (A, CNAME)
- [ ] Enable automatic SSL certificate
- [ ] Set up redirects (www → non-www or vice versa)
- [ ] Update `NEXTAUTH_URL` to custom domain
- [ ] Update `NEXT_PUBLIC_APP_URL` to custom domain

## Monitoring Setup

### Vercel Analytics
- [ ] Enable Web Analytics in Vercel dashboard
- [ ] Monitor Core Web Vitals
- [ ] Set up performance alerts

### Error Tracking (Optional - Sentry)
- [ ] Install @sentry/nextjs
- [ ] Configure Sentry
- [ ] Test error reporting
- [ ] Set up alerts for critical errors

### Logging
- [ ] Verify Vercel logging is working
- [ ] Set up log drains (optional)
- [ ] Configure alerts for critical errors

## Performance Optimization

- [ ] Verify Image Optimization is enabled
- [ ] Check bundle size
- [ ] Test page load times
- [ ] Verify CDN caching
- [ ] Test API response times
- [ ] Run Lighthouse audit (score >90)

## Final Checks Before Going Live

- [ ] All features tested in staging
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Performance audit passed
- [ ] Security audit passed
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Load testing completed
- [ ] Backup and restore procedures documented
- [ ] User documentation created
- [ ] Support contact information added
- [ ] SSL certificate verified
- [ ] Monitoring and alerting configured
- [ ] Team trained on system usage

## Launch Day

- [ ] Announce to users
- [ ] Monitor error rates closely
- [ ] Be ready for quick fixes
- [ ] Collect user feedback
- [ ] Document issues and resolutions

## Rollback Plan

If deployment fails:
1. Click "Rollback" button in Vercel dashboard
2. Or redeploy previous commit from Git
3. For database issues, run: `npx prisma migrate resolve`
4. Notify users of any downtime

## Maintenance Mode

If maintenance is needed:
1. Create maintenance page at `/src/app/maintenance/page.tsx`
2. Route to maintenance page via middleware
3. Display estimated downtime
4. Provide contact information
