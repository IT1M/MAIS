# Implementation Plan

- [x] 1. Set up authentication components structure
  - Create `src/components/auth/` directory for authentication-related components
  - This establishes the foundation for all authentication UI components
  - _Requirements: 10.1_

- [x] 2. Create Home Login Form component
  - [x] 2.1 Implement HomeLoginForm client component
    - Create `src/components/auth/HomeLoginForm.tsx` with form state management
    - Implement email and password input fields using existing Input component
    - Add form validation logic for email format and password presence
    - Implement handleSubmit function with NextAuth signIn integration
    - Add loading state management during authentication
    - Display error messages for validation and authentication failures
    - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 3. Update Home Page with authentication
  - [x] 3.1 Modify app/page.tsx to implement authentication check
    - Import auth function from NextAuth service
    - Check for existing session on page load
    - Redirect authenticated users to /en/dashboard
    - Render HomeLoginForm for unauthenticated users
    - _Requirements: 1.1, 1.3, 1.5_

- [x] 4. Create Login Page component
  - [x] 4.1 Implement LoginForm client component
    - Create `src/components/auth/LoginForm.tsx` with enhanced features
    - Accept callbackUrl and error props for URL parameter handling
    - Implement form with email and password fields
    - Add "Forgot password?" link to forgot password page
    - Handle authentication with NextAuth signIn
    - Display error messages from URL params or authentication failures
    - Implement callback URL redirect after successful login
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 4.4, 4.5, 4.6, 4.8_
  
  - [x] 4.2 Update src/app/[locale]/login/page.tsx
    - Import auth function and check for existing session
    - Extract locale, callbackUrl, and error from params and searchParams
    - Redirect authenticated users to dashboard
    - Render LoginForm with callbackUrl and error props
    - Add Card wrapper with branding (Saudi Mais Co. title and subtitle)
    - _Requirements: 4.1, 4.2, 4.3, 4.7_

- [-] 5. Create Forgot Password functionality
  - [x] 5.1 Implement ForgotPasswordForm client component
    - Create `src/components/auth/ForgotPasswordForm.tsx`
    - Implement email input field with validation
    - Add form submission handler that calls forgot password API
    - Display success message after submission
    - Show error message for invalid email or API errors
    - Add "Back to login" link
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [x] 5.2 Create forgot password page
    - Create `src/app/[locale]/forgot-password/page.tsx`
    - Check for existing session and redirect if authenticated
    - Render ForgotPasswordForm component
    - Add Card wrapper with "Reset Your Password" title and instructions
    - _Requirements: 5.1, 5.6_
  
  - [x] 5.3 Implement forgot password API route
    - Create `src/app/api/auth/forgot-password/route.ts`
    - Implement POST handler for password reset requests
    - Validate email format using validation utilities
    - Query database to check if user exists with Prisma
    - Return success message without revealing if email exists (security)
    - Handle database errors gracefully
    - _Requirements: 5.2, 5.3, 5.4, 6.1, 6.2, 6.5_

- [x] 6. Create and seed admin user in database
  - [x] 6.1 Update database seed script
    - Modify `src/db/seed.ts` to include admin user creation
    - Check if admin user (yazeed@mais.com) already exists
    - Hash password "Yazeed12345" using bcryptjs with 12 salt rounds
    - Create admin user with ADMIN role if not exists
    - Log success or skip message
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2, 6.3_
  
  - [x] 6.2 Run database seed command
    - Execute `npm run prisma:seed` to create admin user
    - Verify admin user exists in database
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 7. Implement form validation utilities
  - [-] 7.1 Create validation helper functions
    - Add validateEmail function to check email format
    - Add validatePassword function to check password requirements
    - Export validation functions for reuse across components
    - _Requirements: 2.4, 2.5, 7.3_

- [ ] 8. Add responsive styling and UI polish
  - [ ] 8.1 Ensure responsive design for all auth pages
    - Apply responsive Tailwind classes to all auth components
    - Test layouts on mobile (< 640px), tablet (640-1024px), and desktop (> 1024px)
    - Ensure touch targets are minimum 44px on mobile
    - Verify card width constraints (max-w-md) work across devices
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ] 8.2 Add loading states and transitions
    - Implement loading spinner on submit buttons during authentication
    - Add disabled state to form inputs during submission
    - Ensure smooth transitions between states
    - _Requirements: 7.5_

- [ ] 9. Integrate with existing authentication system
  - [ ] 9.1 Verify NextAuth configuration
    - Confirm `src/services/auth.ts` is properly configured
    - Verify Credentials provider is set up correctly
    - Ensure session callback includes user role
    - Confirm login page path is set to '/login'
    - _Requirements: 1.5, 10.5_
  
  - [ ] 9.2 Test middleware integration
    - Verify middleware redirects unauthenticated users to login
    - Test that authenticated users are redirected from login to dashboard
    - Confirm callbackUrl parameter works correctly
    - _Requirements: 10.3_

- [ ] 10. Add audit logging for authentication events
  - [ ] 10.1 Implement login audit logging
    - Add audit log creation after successful login in NextAuth authorize callback
    - Log LOGIN action with user ID, IP address, and user agent
    - Handle audit logging errors gracefully without blocking login
    - _Requirements: 6.1, 6.2_

- [ ]* 11. Testing and validation
  - [ ]* 11.1 Manual testing checklist
    - Test home page redirect for authenticated users
    - Test login with valid admin credentials (yazeed@mais.com)
    - Test login with invalid credentials shows error
    - Test email validation on all forms
    - Test password validation on login forms
    - Test forgot password form submission
    - Test responsive design on mobile device
    - Test all navigation links between pages
    - _Requirements: All_
  
  - [ ]* 11.2 Verify security measures
    - Confirm passwords are hashed in database
    - Verify session cookies are httpOnly
    - Test CSRF protection is active
    - Confirm no sensitive data in client-side code
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
