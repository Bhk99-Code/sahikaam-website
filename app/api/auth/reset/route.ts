import { NextResponse } from "next/server";
import { parseSingleBoxIdentity, resetPasswordWithCode } from "@/lib/auth";

/** Step 2 of Forgot password (step 1 is /api/auth/send-code): code + new password. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = parseSingleBoxIdentity(body.identifier);
  const code = String(body.code ?? "").replace(/\D/g, "");
  if (!id || code.length !== 6) return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
  const r = await resetPasswordWithCode(id, code, String(body.password ?? ""));
  return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.error }, { status: r.status ?? 400 });
}
