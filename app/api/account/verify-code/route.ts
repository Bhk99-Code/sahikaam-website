import { NextResponse } from "next/server";
import { getUser, linkIdentity, parseIdentity } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = parseIdentity(body);
  const code = String(body.code ?? "").replace(/\D/g, "");
  if (!id || code.length !== 6) return NextResponse.json({ error: "Wrong code" }, { status: 400 });
  const r = await linkIdentity(user, id, code);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
