import { CONTACT_ERROR } from "@/lib/features";
import { NextResponse } from "next/server";
import { parseIdentity, sendCode } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = parseIdentity(body);
  if (!id) return NextResponse.json({ error: CONTACT_ERROR }, { status: 400 });
  const r = await sendCode(id);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status ?? 400 });
  return NextResponse.json({ ok: true, devCode: r.devCode });
}
