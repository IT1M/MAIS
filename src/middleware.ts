import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './services/auth';

const publicRoutes = ['/login', '/register'];
const protectedRoutes = ['/dashboard', '/inventory', '/reports', '/users', '/settings', '/data-entry'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    const session = await auth();
    
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  if (isPublicRoute) {
    const session = await auth();
    
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
