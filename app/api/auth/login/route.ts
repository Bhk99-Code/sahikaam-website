import { NextResponse } from "next/server";
import { ADMIN_EMAILS } from "@/lib/env";
import { loginWithPassword, parseSingleBoxIdentity } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = parseSingleBoxIdentity(body.identifier);
  if (!id) return NextResponse.json({ error: "Enter a valid email address or 10-digit mobile number." }, { status: 400 });
  const r = await loginWithPassword(id, String(body.password ?? ""));
  return r.ok ? NextResponse.json({ ok: true, admin: id.kind === "email" && ADMIN_EMAILS.includes(id.value) }) : NextResponse.json({ error: r.error }, { status: r.status ?? 400 });
}
