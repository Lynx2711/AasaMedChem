import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;

    if (path.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    if (path.startsWith('/seller') && role !== 'seller' && role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    if (path.startsWith('/buyer') && role !== 'buyer' && role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/seller/:path*', '/buyer/:path*'],
};