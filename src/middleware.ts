import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { auth } from './services/auth';
import { UserRole } from './types';

// Create the internationalization middleware
const intlMiddleware = createMiddleware(routing);

const publicRoutes = ['/login', '/register'];
const protectedRoutes = ['/dashboard', '/inventory', '/reports', '/users', '/settings', '/data-entry', '/data-log', '/analytics', '/audit', '/backup'];

// Route permissions configuration
interface RoutePermission {
  path: string;
  roles: UserRole[] | 'ALL';
}

const routePermissions: RoutePermission[] = [
  { path: '/dashboard', roles: 'ALL' },
  { path: '/data-entry', roles: ['ADMIN', 'SUPERVISOR', 'DATA_ENTRY'] },
  { path: '/data-log', roles: ['ADMIN', 'SUPERVISOR', 'MANAGER', 'DATA_ENTRY', 'AUDITOR'] },
  { path: '/analytics', roles: ['ADMIN', 'SUPERVISOR', 'MANAGER', 'AUDITOR'] },
  { path: '/backup', roles: ['ADMIN', 'MANAGER'] },
  { path: '/audit', roles: ['ADMIN', 'AUDITOR'] },
  { path: '/settings', roles: 'ALL' },
  { path: '/settings/users', roles: ['ADMIN'] },
];

/**
 * Check if a user has permission to access a specific route
 */
function hasPermission(userRole: UserRole, pathname: string): boolean {
  // Find the most specific matching route permission
  const matchingPermissions = routePermissions
    .filter((permission) => pathname.startsWith(permission.path))
    .sort((a, b) => b.path.length - a.path.length); // Sort by specificity (longest path first)

  if (matchingPermissions.length === 0) {
    // No specific permission defined, allow access
    return true;
  }

  const permission = matchingPermissions[0];

  if (permission.roles === 'ALL') {
    return true;
  }

  return permission.roles.includes(userRole);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle i18n routing first
  const response = intlMiddleware(request);

  // Extract locale from pathname (e.g., /en/dashboard -> en)
  const pathnameLocale = pathname.split('/')[1];
  const isValidLocale = routing.locales.includes(pathnameLocale as any);

  // Get the path without locale prefix
  const pathWithoutLocale = isValidLocale
    ? pathname.slice(pathnameLocale.length + 1)
    : pathname;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  );
  const isPublicRoute = publicRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  );

  if (isProtectedRoute) {
    const session = await auth();

    if (!session) {
      const locale = isValidLocale ? pathnameLocale : routing.defaultLocale;
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based permissions
    const userRole = session.user.role as UserRole;
    if (!hasPermission(userRole, pathWithoutLocale)) {
      const locale = isValidLocale ? pathnameLocale : routing.defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/access-denied`, request.url));
    }
  }

  if (isPublicRoute) {
    const session = await auth();

    if (session) {
      const locale = isValidLocale ? pathnameLocale : routing.defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
