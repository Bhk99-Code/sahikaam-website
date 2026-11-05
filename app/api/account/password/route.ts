import { NextResponse } from "next/server";
import { changePassword, getUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "login required" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const r = await changePassword(user.id, String(body.password ?? ""), body.current == null ? undefined : String(body.current));
  return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.error }, { status: r.status ?? 400 });
}
