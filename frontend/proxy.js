import { NextResponse } from "next/server";

export function proxy(req) {
  const { pathname } = req.nextUrl;

  // 1. Allow access to the admin login page itself
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    // middleware runs on the server, so we can only read cookies/headers (not localStorage).
    const adminToken = req.cookies.get("admin_token")?.value;

    // 2. If no admin token, redirect to ADMIN login (not user login)
    if (!adminToken) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login"; 
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
