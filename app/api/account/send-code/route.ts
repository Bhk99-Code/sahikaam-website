import { NextResponse } from "next/server";
import { phoneChannel } from "@/lib/env";
import { getUser, parseIdentity, sendCode } from "@/lib/auth";

/** Sends a code to a new email/phone the signed-in user wants to add to their account. */
export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = parseIdentity(body);
  if (!id) return NextResponse.json({ error: body.phone ? "Enter a valid 10-digit mobile number" : "Enter a valid email address" }, { status: 400 });
  if ((id.kind === "email" ? user.email : user.phone) === id.value) return NextResponse.json({ error: "This is already on your account" }, { status: 400 });
  const r = await sendCode(id, "link", user.id);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status ?? 400 });
  return NextResponse.json({ ok: true, devCode: r.devCode, channel: phoneChannel });
}
