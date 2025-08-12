import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Protect all dashboard and resources routes (including subroutes)
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/resources/:path*',
  ],
};

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie
  const token = request.cookies.get('auth-token')?.value;
  let user = null;
  
  try {
    if (token) {
      const { payload } = await jwtVerify(token, secret);
      user = payload;
      // console.log(user, "user")
    }
  } catch (e) {
    user = null;
  }

  // Block access to protected routes if no valid auth-token
  if (
    (!token || !user) &&
    (pathname.startsWith('/dashboard/admin') || pathname.startsWith('/dashboard/user'))
  ) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based route protection
  const isAdminRoute = pathname.startsWith('/dashboard/admin');
  const isUserRoute = pathname.startsWith('/dashboard/user');

  if (user) {
    // Admin routes - only admin can access
    if (isAdminRoute && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/user', request.url));
    }
    
    // User routes - only users can access
    // if (isUserRoute && user.role !== 'user') {
    //   console.log("middleware user")
    //   return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    // }
  }

  // On login, redirect to correct dashboard for all roles
  if (pathname.startsWith("/login") && user) {
    if (user.role === "admin") {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    } else if (user.role === "user") {
      return NextResponse.redirect(new URL("/dashboard/user", request.url));
    }
  }

  return NextResponse.next();
}