import { NextResponse } from "next/server";
import { parseIdentity, sendCode } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = parseIdentity(body);
  if (!id) return NextResponse.json({ error: body.phone ? "Enter a valid 10-digit mobile number" : "Enter a valid email address" }, { status: 400 });
  const r = await sendCode(id);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status ?? 400 });
  return NextResponse.json({ ok: true, devCode: r.devCode });
}
