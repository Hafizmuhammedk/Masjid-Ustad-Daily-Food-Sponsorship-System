import { NextResponse, type NextRequest } from "next/server";
import { getTokenCookieName, verifyAdminToken } from "@/lib/auth";

const ADMIN_LOGIN_API_PATH = "/api/admin/login";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedApi = pathname.startsWith("/api/admin") && pathname !== ADMIN_LOGIN_API_PATH;
  const isProtectedPage = pathname.startsWith("/dashboard");
  if (!isProtectedApi && !isProtectedPage) {
    return NextResponse.next();
  }

  const token = request.cookies.get(getTokenCookieName())?.value;
  if (!token) {
    if (isProtectedApi) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const admin = await verifyAdminToken(token);
  if (!admin) {
    if (isProtectedApi) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/admin/:path*"]
};
