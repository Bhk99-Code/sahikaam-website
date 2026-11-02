import "server-only";
import catalog from "@/content/products.json";
import { all, one, run } from "./db";
import type { Edition, Product } from "./types";

export { getUser } from "./auth";

/**
 * Products live in content/products.json (edit that file to add a book or change a price).
 * Each product's id is its slug.
 */
const THEME_ACCENT = "#FF6A3D";

const PRODUCTS: Product[] = (catalog.products as any[]).map((p) => {
  const editions: Edition[] = p.editions ?? [];
  const ready = editions.filter((e) => !e.coming_soon);
  return {
    subtitle: null, description: null, mrp: null, badge: null, cover_color: p.accent ?? "#FF6A00", cover_url: null,
    level: null, is_published: true, sort_order: 100, category: "manufacturing",
    ...p,
    // Navy + ivory + gold theme: one gold accent for every book (covers keep their own colours)
    accent: THEME_ACCENT,
    id: p.slug,
    pages: p.pages ?? (ready.length ? Math.max(...ready.map((e) => e.pages ?? 0)) || null : null),
    highlights: p.highlights ?? [],
    gallery: p.gallery ?? [],
    learn: p.learn ?? [],
    inside: p.inside ?? [],
    chapters: p.chapters ?? [],
    lessons: p.lessons ?? [],
    bundle_items: p.bundle_items ?? [],
    access_days: p.access_days ?? null,
    editions,
    bonus: p.bonus ?? [],
  };
});

// Bundles without an explicit MRP show the total of their books as the MRP.
for (const p of PRODUCTS) if (p.type === "bundle" && p.mrp == null) p.mrp = p.bundle_items.reduce((n, s) => n + (PRODUCTS.find((x) => x.slug === s)?.price ?? 0), 0) || null;

/** How many ebooks the All Access pass covers (used in titles and copy, so it never goes stale). */
export const ALL_ACCESS_COUNT: number = PRODUCTS.find((p) => p.slug === "all-access")?.bundle_items.length ?? 0;

/** The edition to open: the requested language if available, else the first available one. */
export function pickEdition(product: Product, lang?: string | null): Edition | null {
  const ready = product.editions.filter((e) => !e.coming_soon);
  return ready.find((e) => e.lang === lang) ?? ready[0] ?? null;
}

export async function getProducts(): Promise<Product[]> {
  return PRODUCTS.filter((p) => p.is_published && !p.variant_of).sort((a, b) => a.sort_order - b.sort_order);
}

export async function getProduct(slug: string): Promise<Product | null> {
  return PRODUCTS.find((p) => p.slug === slug && p.is_published) ?? null;
}

/** Any product by slug, published or not (used for items a buyer already owns). */
export function findProduct(slug: string): Product | null {
  return PRODUCTS.find((p) => p.slug === slug) ?? null;
}

/** All published plans of a product (the product and its variants), cheapest first. */
export function getPlans(product: Product): Product[] {
  const main = product.variant_of ?? product.slug;
  return PRODUCTS.filter((p) => p.is_published && (p.slug === main || p.variant_of === main)).sort((a, b) => a.price - b.price);
}

export type LibraryItem = { product: Product; progress: number; purchasedAt: number; expiresAt: number | null };

// A purchase counts while it has no expiry (lifetime) or the expiry is in the future.
const ACTIVE = "(expires_at IS NULL OR expires_at > ?)";

/**
 * An active pass covers every book now in its bundle_items, including books added after it was bought:
 * add any missing purchase rows with the pass's end date (and extend shorter ones).
 */
async function syncBundles(userId: string) {
  const bundles = PRODUCTS.filter((p) => p.bundle_items.length);
  if (!bundles.length) return;
  const passes = await all<{ product_slug: string; order_id: string | null; expires_at: number | null }>(
    `SELECT product_slug, order_id, expires_at FROM purchases WHERE user_id = ? AND product_slug IN (${bundles.map(() => "?").join(",")}) AND ${ACTIVE}`,
    [userId, ...bundles.map((b) => b.slug), Date.now()]);
  for (const pass of passes) {
    const end = pass.expires_at == null ? null : Number(pass.expires_at);
    for (const s of findProduct(pass.product_slug)?.bundle_items ?? []) {
      const row = await one<{ expires_at: number | null }>("SELECT expires_at FROM purchases WHERE user_id = ? AND product_slug = ?", [userId, s]);
      if (!row) {
        await run("INSERT INTO purchases (user_id, product_slug, order_id, progress, created_at, expires_at) VALUES (?, ?, ?, 0, ?, ?)",
          [userId, s, pass.order_id, Date.now(), end]).catch(() => { /* a parallel request inserted it first */ });
      } else if (row.expires_at != null && (end == null || end > Number(row.expires_at))) {
        await run("UPDATE purchases SET expires_at = ? WHERE user_id = ? AND product_slug = ?", [end, userId, s]);
      }
    }
  }
}

export async function getLibrary(userId: string): Promise<LibraryItem[]> {
  await syncBundles(userId);
  const rows = await all<{ product_slug: string; progress: number; created_at: number; expires_at: number | null }>(
    `SELECT product_slug, progress, created_at, expires_at FROM purchases WHERE user_id = ? AND ${ACTIVE} ORDER BY created_at DESC`, [userId, Date.now()]);
  return rows
    .map((r) => ({ product: findProduct(r.product_slug)!, progress: Number(r.progress), purchasedAt: Number(r.created_at), expiresAt: r.expires_at == null ? null : Number(r.expires_at) }))
    .filter((r) => r.product);
}

export async function ownsProduct(userId: string, slug: string) {
  await syncBundles(userId);
  return Boolean(await one(`SELECT 1 AS ok FROM purchases WHERE user_id = ? AND product_slug = ? AND ${ACTIVE}`, [userId, slug, Date.now()]));
}

export async function getProgress(userId: string, slug: string) {
  const r = await one<{ progress: number }>("SELECT progress FROM purchases WHERE user_id = ? AND product_slug = ?", [userId, slug]);
  return Number(r?.progress ?? 0);
}

/** Total price of a bundle's books if bought one by one (shown as the bundle's MRP). */
export function bundleValue(product: Product) {
  return product.bundle_items.reduce((n, s) => n + (findProduct(s)?.price ?? 0), 0);
}

/** Cover images of the books inside a bundle (for the fanned-out bundle cover). */
export function bundleCovers(product: Product): string[] {
  return product.bundle_items.map((s) => findProduct(s)?.cover_url).filter((c): c is string => Boolean(c));
}
