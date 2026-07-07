import { NextRequest, NextResponse } from 'next/server';

const REQUIRED_ROLE = 'student';
const LOGIN_PATH = '/login';
const DEFAULT_PATH = '/dashboard';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === LOGIN_PATH;
  const isAuthenticated = request.cookies.get('eduspell_authenticated')?.value === '1';
  const role = request.cookies.get('eduspell_role')?.value;

  if (isLoginRoute && isAuthenticated && role === REQUIRED_ROLE) {
    return NextResponse.redirect(new URL(DEFAULT_PATH, request.url));
  }

  if (!isLoginRoute && (!isAuthenticated || role !== REQUIRED_ROLE)) {
    const redirectUrl = new URL(LOGIN_PATH, request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
