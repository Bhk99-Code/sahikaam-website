import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/library", "/read", "/learn", "/checkout", "/account", "/admin"];

/** Quick gate: no session cookie → send to login. Pages still check the session in the database. */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!request.cookies.get("sk_session") && PROTECTED.some((p) => path === p || path.startsWith(p + "/"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "?next=" + encodeURIComponent(path + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/library/:path*", "/read/:path*", "/learn/:path*", "/checkout/:path*", "/account/:path*", "/admin/:path*"],
};
