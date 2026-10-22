import { NextResponse } from "next/server";
import { getUser, signOutEverywhere } from "@/lib/auth";

/** "Sign out of all devices" (form post from /account). */
export async function POST(req: Request) {
  const user = await getUser();
  if (user) await signOutEverywhere(user.id);
  return NextResponse.redirect(new URL("/login?signedout=all", req.url), 303);
}
