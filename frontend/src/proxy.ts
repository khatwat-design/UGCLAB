import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = {
  '/creator': 'creator',
  '/advertiser': 'advertiser',
  '/admin': 'admin',
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value || 
    request.headers.get('authorization')?.replace('Bearer ', '');

  const matchedRole = Object.entries(protectedPaths).find(([path]) =>
    pathname.startsWith(path)
  );

  if (matchedRole && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/creator/:path*', '/advertiser/:path*', '/admin/:path*'],
};
