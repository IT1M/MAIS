import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { auth } from './services/auth';

// Create the internationalization middleware
const intlMiddleware = createMiddleware(routing);

const publicRoutes = ['/login', '/register'];
const protectedRoutes = ['/dashboard', '/inventory', '/reports', '/users', '/settings', '/data-entry', '/data-log', '/analytics', '/audit', '/backup'];

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
