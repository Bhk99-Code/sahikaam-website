import { isSupabaseConfigured } from "@/lib/env";
import { NextResponse } from "next/server";
import { getProduct, getUser, ownsProduct } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase-server";

/** Returns a 10-minute signed URL for the ebook PDF — only to its owner. */
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  if (!isSupabaseConfigured) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "login required" }, { status: 401 });
  const product = await getProduct(params.slug);
  if (!product || !product.file_path) return NextResponse.json({ error: "file not found" }, { status: 404 });
  if (!(await ownsProduct(user.id, product.id))) return NextResponse.json({ error: "not purchased" }, { status: 403 });

  const { data, error } = await supabaseAdmin().storage.from("books").createSignedUrl(product.file_path, 600);
  if (error || !data) return NextResponse.json({ error: "file not available" }, { status: 500 });
  return NextResponse.json({ url: data.signedUrl }, { headers: { "Cache-Control": "no-store" } });
}
