import { isSupabaseConfigured } from "@/lib/env";
import { NextResponse } from "next/server";
import { getProduct } from "@/lib/data";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  if (!isSupabaseConfigured) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const { slug, progress } = await req.json().catch(() => ({}));
  const n = Number(progress);
  if (!slug || !Number.isInteger(n) || n < 0 || n > 100000) return NextResponse.json({ error: "bad input" }, { status: 400 });
  const sb = supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "login required" }, { status: 401 });
  const product = await getProduct(String(slug));
  if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });
  // RLS policy lets users update only their own purchase rows
  await sb.from("purchases").update({ progress: n }).eq("user_id", auth.user.id).eq("product_id", product.id);
  return NextResponse.json({ ok: true });
}
