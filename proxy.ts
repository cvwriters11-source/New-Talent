import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin/session";
import {
  CANDIDATE_COOKIE,
  verifyCandidateToken,
} from "@/lib/interview/candidate-session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Candidate interview auth
  if (
    pathname.startsWith("/interview/dashboard") ||
    pathname.startsWith("/interview/session")
  ) {
    const token = request.cookies.get(CANDIDATE_COOKIE)?.value;
    const session = token ? await verifyCandidateToken(token) : null;
    if (!session) {
      const login = new URL("/interview", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  if (pathname === "/interview" || pathname.startsWith("/interview/")) {
    return NextResponse.next();
  }

  // Admin auth
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (token && (await verifyAdminToken(token))) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const session = token ? await verifyAdminToken(token) : null;
  if (!session) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/interview/dashboard",
    "/interview/dashboard/:path*",
    "/interview/session",
    "/interview/session/:path*",
  ],
};
