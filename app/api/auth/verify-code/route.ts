import { NextResponse } from "next/server";
import { parseIdentity, verifyLogin } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = parseIdentity(body);
  const code = String(body.code ?? "").replace(/\D/g, "");
  if (!id || code.length !== 6) return NextResponse.json({ error: "Wrong code" }, { status: 400 });
  if (!(await verifyLogin(id, code))) {
    return NextResponse.json({ error: "That code is wrong or has expired. Please try again." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
