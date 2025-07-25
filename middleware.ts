import { NextResponse, type NextRequest } from "next/server";
import { API_AUTH_PREFIX, DEFAULT_LOGIN_REDIRECT } from "./routes";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip authentication check for API auth routes
  const isApiAuth = pathname.startsWith(API_AUTH_PREFIX);
  if (isApiAuth) {
    return NextResponse.next();
  }

  // Check if user has a session cookie (basic check)
  // Better Auth typically uses these cookie names
  const sessionCookie = request.cookies.get('session') || 
                       request.cookies.get('better-auth.session') ||
                       request.cookies.get('auth.session');
  
  if (!sessionCookie) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url));
  }

  // Redirect logged-in users from /dashboard or /settings (root) to /settings/themes
  if (pathname === "/dashboard" || pathname === "/settings") {
    return NextResponse.redirect(new URL("/settings/themes", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/editor/theme/:themeId", "/dashboard", "/settings/:path*", "/success"],
};
