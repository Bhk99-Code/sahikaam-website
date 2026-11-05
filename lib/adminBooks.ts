import "server-only";
import fs from "fs";
import path from "path";
import { PRODUCTS_FILE } from "./data";
import { CATEGORY } from "./format";

// Same persistent-storage convention as BOOKS_DIR / BONUS_DIR / COUPONS_FILE / PRODUCTS_FILE: on the
// live server these env vars point outside the deploy's versioned build folder.
export const BOOKS_DIR = process.env.BOOKS_DIR || path.join(process.cwd(), "private", "books");
export const COVERS_DIR = process.env.COVERS_DIR || path.join(process.cwd(), "private", "covers");

type Catalog = { _help?: string; products: Record<string, any>[] };
type Result = { ok: true; message: string } | { ok: false; error: string };

function readCatalog(): Catalog {
  return JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8"));
}

function writeCatalog(c: Catalog) {
  const tmp = PRODUCTS_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(c, null, 2) + "\n");
  fs.renameSync(tmp, PRODUCTS_FILE);
}

export type NewBook = {
  title: string; subtitle: string; description: string; category: string;
  price: number; mrp: number | null; badge: string; lang: "hi" | "en"; pages: number | null;
  learn: string[]; chapters: string[];
  pdf: Buffer; cover: Buffer | null; coverExt: string;
};

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

export function addBook(b: NewBook): Result & { slug?: string } {
  const slug = slugify(b.title);
  if (!slug) return { ok: false, error: "Title is required." };
  if (!(b.category in CATEGORY) || b.category === "bundle") return { ok: false, error: "Pick a category." };
  if (!Number.isFinite(b.price) || b.price < 0) return { ok: false, error: "Price must be a number." };
  if (b.pdf.length < 1000 || b.pdf.subarray(0, 4).toString() !== "%PDF") return { ok: false, error: "The book file must be a PDF." };

  const catalog = readCatalog();
  const existing = catalog.products.find((p) => p.slug === slug);
  const fileName = `${slug}${b.lang === "en" ? "-en" : ""}.pdf`;
  const edition = { lang: b.lang, label: b.lang === "hi" ? "Hindi" : "English", pages: b.pages ?? undefined, file_path: fileName };

  fs.mkdirSync(BOOKS_DIR, { recursive: true });
  fs.writeFileSync(path.join(BOOKS_DIR, fileName), b.pdf);

  let coverUrl: string | null = existing?.cover_url ?? null;
  if (b.cover) {
    fs.mkdirSync(COVERS_DIR, { recursive: true });
    const coverName = `${slug}-${Date.now()}${b.coverExt}`;
    fs.writeFileSync(path.join(COVERS_DIR, coverName), b.cover);
    coverUrl = `/api/covers/${coverName}`;
  }

  if (existing) {
    // Same title again = add/replace this language's file on the existing book, keep everything else.
    existing.editions = [...(existing.editions ?? []).filter((e: any) => e.lang !== b.lang), edition];
    if (coverUrl) existing.cover_url = coverUrl;
  } else {
    const maxSort = Math.max(0, ...catalog.products.map((p) => Number(p.sort_order) || 0));
    catalog.products.push({
      slug, type: "ebook", category: b.category, accent: "#FF6A00", title: b.title.trim(),
      subtitle: b.subtitle.trim() || undefined, description: b.description.trim() || undefined,
      price: b.price, mrp: b.mrp ?? undefined, badge: b.badge.trim() || undefined,
      cover_url: coverUrl ?? undefined, sort_order: maxSort + 10,
      learn: b.learn.length ? b.learn : undefined, chapters: b.chapters.length ? b.chapters : undefined,
      editions: [edition],
    });
  }
  writeCatalog(catalog);
  return { ok: true, slug, message: existing ? `Updated "${b.title}" (${edition.label} file added).` : `Added "${b.title}" — it is live now.` };
}

export function setPublished(slug: string, published: boolean): Result {
  const catalog = readCatalog();
  const p = catalog.products.find((x) => x.slug === slug);
  if (!p) return { ok: false, error: "Book not found." };
  p.is_published = published;
  writeCatalog(catalog);
  return { ok: true, message: `"${p.title}" is now ${published ? "visible" : "hidden"}.` };
}

export function updatePrice(slug: string, price: number, mrp: number | null): Result {
  if (!Number.isFinite(price) || price < 0) return { ok: false, error: "Price must be a number." };
  const catalog = readCatalog();
  const p = catalog.products.find((x) => x.slug === slug);
  if (!p) return { ok: false, error: "Book not found." };
  p.price = price;
  if (mrp != null) p.mrp = mrp; else delete p.mrp;
  writeCatalog(catalog);
  return { ok: true, message: `"${p.title}" price set to ₹${price}.` };
}
