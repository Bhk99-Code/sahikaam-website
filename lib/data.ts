import "server-only";
import catalog from "@/content/products.json";
import { all, one } from "./db";
import type { Edition, Product } from "./types";

export { getUser } from "./auth";

/**
 * Products live in content/products.json (edit that file to add a book or change a price).
 * Each product's id is its slug.
 */
const PRODUCTS: Product[] = (catalog.products as any[]).map((p) => {
  const editions: Edition[] = p.editions ?? [];
  const ready = editions.filter((e) => !e.coming_soon);
  return {
    subtitle: null, description: null, mrp: null, badge: null, cover_color: p.accent ?? "#E8590C", cover_url: null,
    level: null, is_published: true, sort_order: 100, category: "manufacturing", accent: "#E8590C",
    ...p,
    id: p.slug,
    pages: p.pages ?? (ready.length ? Math.max(...ready.map((e) => e.pages ?? 0)) || null : null),
    highlights: p.highlights ?? [],
    learn: p.learn ?? [],
    chapters: p.chapters ?? [],
    lessons: p.lessons ?? [],
    bundle_items: p.bundle_items ?? [],
    editions,
  };
});

/** The edition to open: the requested language if available, else the first available one. */
export function pickEdition(product: Product, lang?: string | null): Edition | null {
  const ready = product.editions.filter((e) => !e.coming_soon);
  return ready.find((e) => e.lang === lang) ?? ready[0] ?? null;
}

export async function getProducts(): Promise<Product[]> {
  return PRODUCTS.filter((p) => p.is_published).sort((a, b) => a.sort_order - b.sort_order);
}

export async function getProduct(slug: string): Promise<Product | null> {
  return PRODUCTS.find((p) => p.slug === slug && p.is_published) ?? null;
}

/** Any product by slug, published or not (used for items a buyer already owns). */
export function findProduct(slug: string): Product | null {
  return PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export type LibraryItem = { product: Product; progress: number; purchasedAt: number };

export async function getLibrary(userId: string): Promise<LibraryItem[]> {
  const rows = await all<{ product_slug: string; progress: number; created_at: number }>(
    "SELECT product_slug, progress, created_at FROM purchases WHERE user_id = ? ORDER BY created_at DESC", [userId]);
  return rows
    .map((r) => ({ product: findProduct(r.product_slug)!, progress: Number(r.progress), purchasedAt: Number(r.created_at) }))
    .filter((r) => r.product);
}

export async function ownsProduct(userId: string, slug: string) {
  return Boolean(await one("SELECT 1 AS ok FROM purchases WHERE user_id = ? AND product_slug = ?", [userId, slug]));
}

export async function getProgress(userId: string, slug: string) {
  const r = await one<{ progress: number }>("SELECT progress FROM purchases WHERE user_id = ? AND product_slug = ?", [userId, slug]);
  return Number(r?.progress ?? 0);
}

/** Cover images of the books inside a bundle (for the fanned-out bundle cover). */
export function bundleCovers(product: Product): string[] {
  return product.bundle_items.map((s) => findProduct(s)?.cover_url).filter((c): c is string => Boolean(c));
}
