import { NextResponse } from "next/server";
import { consumeMagicLink } from "@/lib/magicLink";
import { SESSION_COOKIE, userHasPassword } from "@/lib/auth";
import { isProduction, SITE_URL } from "@/lib/env";

/** The one-tap link sent after a guest checkout pays (lib/grant.ts). A Route Handler, not a page
 *  component, because setting the session cookie needs one. */
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const result = await consumeMagicLink(params.token);
  if (!result) return NextResponse.redirect(new URL("/login?expired=1", SITE_URL));

  // No password yet (a guest buyer): land on Profile with a prompt to set one for next time.
  const res = NextResponse.redirect(new URL((await userHasPassword(result.userId)) ? "/library" : "/account?welcome=1", SITE_URL));
  res.cookies.set(SESSION_COOKIE, result.sessionToken, {
    httpOnly: true, secure: isProduction, sameSite: "lax", path: "/", expires: result.expires,
  });
  return res;
}
