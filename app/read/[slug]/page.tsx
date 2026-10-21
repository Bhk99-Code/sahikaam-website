import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getUser, ownsProduct } from "@/lib/data";
import { supabaseServer } from "@/lib/supabase-server";
import { Reader } from "./Reader";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reader", robots: { index: false } };

export default async function ReadPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();
  const user = await getUser();
  if (!user) redirect(`/login?next=/read/${product.slug}`);
  if (!(await ownsProduct(user.id, product.id))) redirect(`/book/${product.slug}`);

  const { data } = await supabaseServer().from("purchases").select("progress").eq("user_id", user.id).eq("product_id", product.id).maybeSingle();
  const email = user.email ?? "";
  const masked = email.replace(/^(.{2}).*(@.*)$/, "$1•••$2");
  const watermark = `Licensed to ${masked} · ${user.id.slice(0, 8)}`;

  return <Reader slug={product.slug} title={product.title} startPage={Math.max(1, data?.progress || 1)} watermark={watermark} />;
}
