import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin/session";
import {
  RECRUITER_COOKIE,
  verifyRecruiterToken,
} from "@/lib/recruiter/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/recruiter")) {
    const isPublicAuth =
      pathname === "/recruiter" ||
      pathname === "/recruiter/login" ||
      pathname === "/recruiter/register";

    const token = request.cookies.get(RECRUITER_COOKIE)?.value;
    const session = token ? await verifyRecruiterToken(token) : null;

    if (
      session &&
      (pathname === "/recruiter/login" || pathname === "/recruiter/register")
    ) {
      return NextResponse.redirect(new URL("/recruiter/dashboard", request.url));
    }

    if (!isPublicAuth && !session) {
      const login = new URL("/recruiter/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }

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
  matcher: ["/admin", "/admin/:path*", "/recruiter", "/recruiter/:path*"],
};
