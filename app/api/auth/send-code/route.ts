import { NextResponse } from "next/server";
import { normalizeEmail, sendLoginCode } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  if (!email) return NextResponse.json({ error: "Sahi email address daalein" }, { status: 400 });
  const r = await sendLoginCode(email);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 429 });
  return NextResponse.json({ ok: true, devCode: r.devCode });
}
