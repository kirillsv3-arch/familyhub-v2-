import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  // Paths that don't require authentication
  if (pathname.startsWith("/auth") || pathname.startsWith("/api/auth")) {
    if (session && !pathname.startsWith("/api/auth/logout")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Paths that require authentication
  if (!session) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // More complex logic like checking familyId could be done here,
  // but it usually requires a DB call. To avoid overhead in middleware,
  // we might handle it in layouts or specific pages, or use a lightweight token claim.
  // For now, let's keep it simple and handle family-setup redirect in pages/layouts.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
