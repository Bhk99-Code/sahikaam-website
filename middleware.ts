import { NextResponse, type NextRequest } from "next/server";

// /checkout is NOT here: a first-time visitor with no session cookie at all must still reach it —
// that page renders its own guest checkout (single email/WhatsApp box, no login) when there's no
// signed-in user. This gate would otherwise bounce every brand-new customer to /login before the
// page ever got a chance to show that — the exact "logged-in-only" behavior guest checkout was
// built to remove. A signed-in checkout still works the same; the page checks getUser() itself.
const PROTECTED = ["/library", "/read", "/learn", "/account", "/admin"];

/** Quick gate: no session cookie → send to login. Pages still check the session in the database. */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!request.cookies.get("sk_session") && PROTECTED.some((p) => path === p || path.startsWith(p + "/"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "?next=" + encodeURIComponent(path + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  if (path === "/admin" || path.startsWith("/admin/")) {
    const headers = new Headers(request.headers);
    headers.set("x-admin-area", "1");
    return NextResponse.next({ request: { headers } });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/library/:path*", "/read/:path*", "/learn/:path*", "/checkout/:path*", "/account/:path*", "/admin/:path*"],
};
