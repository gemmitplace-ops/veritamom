import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Redirect root to locale
  if (pathname === '/') {
    const acceptLanguage = request.headers.get('accept-language') || '';
    let locale = 'en';
    if (acceptLanguage.includes('zh')) locale = 'zh';
    else if (acceptLanguage.includes('ko')) locale = 'ko';
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
