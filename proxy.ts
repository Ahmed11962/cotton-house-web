import { NextRequest, NextResponse } from 'next/server';
export function proxy(request: NextRequest) {
  const h = new Headers(request.headers);
  h.set('x-locale', request.nextUrl.pathname.startsWith('/ar') ? 'ar' : 'en');
  return NextResponse.next({ request: { headers: h } });
}
export const config = {
  matcher: ['/((?!api|_next|images|brand|favicon.ico).*)'],
};
