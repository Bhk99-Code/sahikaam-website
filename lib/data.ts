import "server-only";
import { isSupabaseConfigured } from "./env";
import { DEMO_PRODUCTS } from "./demo";
import { supabaseServer } from "./supabase-server";
import type { Product } from "./types";

function normalize(p: any): Product {
  return {
    ...p,
    highlights: p.highlights ?? [],
    chapters: p.chapters ?? [],
    lessons: p.lessons ?? [],
    bundle_items: p.bundle_items ?? [],
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return DEMO_PRODUCTS;
  const { data, error } = await supabaseServer()
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("getProducts", error.message);
    return [];
  }
  return (data ?? []).map(normalize);
}

export async function getProduct(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured) return DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
  const { data } = await supabaseServer()
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  return data ? normalize(data) : null;
}

export async function getUser() {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabaseServer().auth.getUser();
  return data.user ?? null;
}

export type LibraryItem = { product: Product; progress: number; purchasedAt: string };

export async function getLibrary(): Promise<LibraryItem[]> {
  if (!isSupabaseConfigured) return [];
  const sb = supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return [];
  const { data } = await sb
    .from("purchases")
    .select("progress, created_at, products(*)")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });
  return (data ?? [])
    .filter((r: any) => r.products)
    .map((r: any) => ({ product: normalize(r.products), progress: r.progress, purchasedAt: r.created_at }));
}

export async function ownsProduct(userId: string, productId: string) {
  const { data } = await supabaseServer()
    .from("purchases")
    .select("product_id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();
  return Boolean(data);
}
