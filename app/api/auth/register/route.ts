import { NextResponse } from "next/server";
import { parseSingleBoxIdentity, registerWithPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = parseSingleBoxIdentity(body.identifier);
  if (!id) return NextResponse.json({ error: "Enter a valid email address or 10-digit mobile number." }, { status: 400 });
  const r = await registerWithPassword(id, String(body.password ?? ""));
  return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.error }, { status: r.status ?? 400 });
}
