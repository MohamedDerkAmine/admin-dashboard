import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  readSignedSessionToken,
  sessionCookieName,
} from "@/lib/auth/session-cookie";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAuthRoute =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/api/onboarding") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/api/signup") ||
    pathname.startsWith("/invitations");
  const isIntegrationRoute =
    pathname.startsWith("/api/ai") ||
    pathname.startsWith("/api/email") ||
    pathname.startsWith("/api/stripe");
  const hasSignedSession = Boolean(
    readSignedSessionToken(request.cookies.get(sessionCookieName)?.value),
  );

  if (!hasSignedSession && !isAuthRoute && !isIntegrationRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (
    hasSignedSession &&
    (pathname.startsWith("/auth") || pathname.startsWith("/signup"))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
