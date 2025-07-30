import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';


// Protect all dashboard and resources routes (including subroutes)
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/resources/:path*',
  ],
};

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie
  const token = request.cookies.get('auth-token')?.value;
  let user = null;
  // try {
  //   user = token ? JSON.parse(decodeURIComponent(token)) : null;
  // } catch {}
  try {
    if (token) {
      const { payload } = await jwtVerify(token, secret);
      user = payload;
    }
  } catch (e) {
    user = null;
  }
  // console.log("token", token)
  // console.log("user", user)

  // Block access to /dashboard/admin or /dashboard/team if no valid auth-token
  if (
    (!token) &&
    (pathname.startsWith('/dashboard/admin') || pathname.startsWith('/dashboard/team'))
  ) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based route protection
  const isAdminRoute = pathname.startsWith('/dashboard/admin');
  const isTeamRoute = pathname.startsWith('/dashboard/team');
  // const isUserRoute = pathname.startsWith('/dashboard/user');

  if (user) {
    // console.log(user.role)
    if (user.role === 'admin' && (isTeamRoute)) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
    // if (user.role === 'team' && (isAdminRoute || isUserRoute)) {
    //   return NextResponse.rewrite(new URL('/404', request.url));
    // }
    if (user.role !== 'admin' && (isAdminRoute)) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  // On login, redirect to correct dashboard for all roles
  if (pathname.startsWith("/login") && user) {
    if (user.role === "admin") {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
    else{
      return NextResponse.redirect(new URL("/dashboard/team", request.url));
    }
    // if (user.role === "user") {
    //   return NextResponse.redirect(new URL("/dashboard/user", request.url));
    // }
  }

  return NextResponse.next();
}
