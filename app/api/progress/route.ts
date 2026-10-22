import { NextResponse } from "next/server";
import { getUser } from "@/lib/data";
import { run } from "@/lib/db";

export async function POST(req: Request) {
  const { slug, progress } = await req.json().catch(() => ({}));
  const n = Number(progress);
  if (!slug || !Number.isInteger(n) || n < 0 || n > 100000) return NextResponse.json({ error: "bad input" }, { status: 400 });
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "login required" }, { status: 401 });
  await run("UPDATE purchases SET progress = ? WHERE user_id = ? AND product_slug = ?", [n, user.id, String(slug)]);
  return NextResponse.json({ ok: true });
}
