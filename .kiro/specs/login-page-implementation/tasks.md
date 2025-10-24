# Implementation Plan

- [ ] 1. Setup infrastructure and translation files
  - Create translation files for Arabic and English for login page
  - Add required translation keys in `messages/ar.json` and `messages/en.json`
  - _Requirements: 1.3, 4.1_

- [ ] 2. Create super admin account seeding script
  - Write script `src/db/seed-admin.ts` to create yazeed@mais.com account
  - Implement check for existing account before creation
  - Use bcrypt to hash password "Yazeed12345"
  - Set role to ADMIN and activate account
  - Add npm script command to run the seeding script
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3. Enhance authentication service
  - Update `src/services/auth.ts` to add account status check (isActive)
  - Add better error message handling with bilingual support
  - Improve authorize function to check isActive before allowing login
  - _Requirements: 2.3, 1.4_

- [ ] 4. Enhance audit logging service
  - Update `src/services/audit.ts` to add login attempt logging functions
  - Add `logLogin` function to log successful login attempts
  - Add `logLogout` function to log logout events
  - Add `logFailedLogin` function to log failed login attempts
  - Include IP address and user agent in logs
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 5. Create login form component
  - Create `src/components/auth/LoginForm.tsx`
  - Implement email and password fields with validation
  - Add show/hide password toggle button
  - Add loading indicator during authentication
  - Display error messages clearly
  - Support form submission via Enter key
  - _Requirements: 1.1, 1.4, 4.3, 4.4, 4.5_

- [ ] 6. Update login page
  - Update `src/app/[locale]/login/page.tsx` to use the new component
  - Add company title "Saudi Mais Co." and description
  - Implement authentication logic using NextAuth signIn
  - Add error handling and display to user
  - Implement redirect to dashboard after successful login
  - Support callbackUrl to return to requested page
  - _Requirements: 1.1, 1.2, 1.3, 2.5_

- [ ] 7. Configure root page to redirect to login
  - Update `src/app/[locale]/page.tsx` to redirect unauthenticated users to login
  - Redirect authenticated users directly to dashboard
  - Make login page the main entry point of the system
  - _Requirements: 2.5_

- [ ] 8. Enhance authentication API endpoint
  - Update `src/app/api/auth/[...nextauth]/route.ts` if needed
  - Ensure audit logging integration with authentication process
  - Add IP address and user agent extraction from request
  - Log successful and failed login attempts
  - _Requirements: 2.1, 2.2, 5.1, 5.2, 5.3_

- [ ] 9. Improve design and responsiveness
  - Apply responsive design that works on all devices
  - Add RTL support for Arabic language
  - Improve colors and overall appearance
  - Add smooth transitions and animations
  - Ensure accessibility (keyboard navigation, ARIA labels)
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 10. Update middleware for login page handling
  - Verify that `src/middleware.ts` handles /login correctly
  - Ensure authenticated users are redirected away from login page
  - Ensure unauthenticated users are redirected to login page
  - _Requirements: 2.5_

- [ ] 11. Test and document the system
  - Test login with super admin account
  - Test failed login attempts
  - Test account status check (isActive)
  - Verify event logging in database
  - Test design on different devices
  - Test bilingual support and RTL
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_
