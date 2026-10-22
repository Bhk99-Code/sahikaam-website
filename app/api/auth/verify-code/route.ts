import { NextResponse } from "next/server";
import { normalizeEmail, verifyLoginCode } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  const code = String(body.code ?? "").replace(/\D/g, "");
  if (!email || code.length !== 6) return NextResponse.json({ error: "Code galat hai" }, { status: 400 });
  if (!(await verifyLoginCode(email, code))) {
    return NextResponse.json({ error: "Code galat hai ya expire ho gaya. Dobara try karein." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
