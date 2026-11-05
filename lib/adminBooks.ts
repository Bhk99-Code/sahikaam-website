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

export type Pair = { title: string; text: string };
export type EditionEdit = { lang: "hi" | "en"; pages: number | null; comingSoon: boolean; pdf: Buffer | null };
export type BookEdit = {
  title: string; subtitle: string; description: string; category: string; badge: string; level: string;
  price: number; mrp: number | null; sortOrder: number | null; published: boolean;
  highlights: Pair[]; inside: Pair[]; learn: string[]; chapters: string[];
  galleryKeep: string[]; galleryNew: { buf: Buffer; ext: string }[];
  cover: { buf: Buffer; ext: string } | null;
  editions: EditionEdit[];
};

export function getBookRaw(slug: string): Record<string, any> | null {
  return readCatalog().products.find((p) => p.slug === slug) ?? null;
}

function saveImage(slug: string, tag: string, img: { buf: Buffer; ext: string }) {
  fs.mkdirSync(COVERS_DIR, { recursive: true });
  const name = `${slug}-${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}${img.ext}`;
  fs.writeFileSync(path.join(COVERS_DIR, name), img.buf);
  return `/api/covers/${name}`;
}

/** Edits everything the public book page shows. Empty optional text removes the field; old uploaded files are kept on disk. */
export function updateBook(slug: string, e: BookEdit): Result {
  if (!e.title.trim()) return { ok: false, error: "Title is required." };
  if (!(e.category in CATEGORY)) return { ok: false, error: "Pick a category." };
  if (!Number.isFinite(e.price) || e.price < 0) return { ok: false, error: "Price must be a number." };
  for (const ed of e.editions) if (ed.pdf && ed.pdf.subarray(0, 4).toString() !== "%PDF") return { ok: false, error: "The book file must be a PDF." };

  const catalog = readCatalog();
  const p = catalog.products.find((x) => x.slug === slug);
  if (!p) return { ok: false, error: "Book not found." };

  const setOrDrop = (key: string, v: unknown, empty: boolean) => { if (empty) delete p[key]; else p[key] = v; };
  p.title = e.title.trim();
  setOrDrop("subtitle", e.subtitle.trim(), !e.subtitle.trim());
  setOrDrop("description", e.description.trim(), !e.description.trim());
  setOrDrop("badge", e.badge.trim(), !e.badge.trim());
  setOrDrop("level", e.level.trim(), !e.level.trim());
  p.category = e.category;
  p.price = e.price;
  setOrDrop("mrp", e.mrp, e.mrp == null);
  if (e.sortOrder != null && Number.isFinite(e.sortOrder)) p.sort_order = e.sortOrder;
  p.is_published = e.published;
  setOrDrop("highlights", e.highlights, !e.highlights.length);
  setOrDrop("inside", e.inside, !e.inside.length);
  setOrDrop("learn", e.learn, !e.learn.length);
  setOrDrop("chapters", e.chapters, !e.chapters.length);

  if (e.cover) p.cover_url = saveImage(slug, "cover", e.cover);
  const gallery = [...e.galleryKeep, ...e.galleryNew.map((g) => saveImage(slug, "g", g))];
  setOrDrop("gallery", gallery, !gallery.length);

  const editions: any[] = p.editions ?? [];
  for (const ed of e.editions) {
    const existing = editions.find((x) => x.lang === ed.lang);
    if (existing?.parts) continue; // chapter-wise files are managed outside this form
    const label = ed.lang === "hi" ? "Hindi" : "English";
    if (ed.pdf) {
      const file = existing?.file_path ?? `${slug}${ed.lang === "en" ? "-en" : ""}.pdf`;
      fs.mkdirSync(BOOKS_DIR, { recursive: true });
      fs.writeFileSync(path.join(BOOKS_DIR, file), ed.pdf);
      const next = { lang: ed.lang, label, pages: ed.pages ?? existing?.pages, file_path: file };
      if (existing) Object.assign(existing, next, { coming_soon: undefined }); else editions.push(next);
      if (existing) delete existing.coming_soon;
    } else if (existing) {
      if (ed.pages != null) existing.pages = ed.pages; else delete existing.pages;
      if (ed.comingSoon) existing.coming_soon = true; else delete existing.coming_soon;
    } else if (ed.comingSoon) {
      editions.push({ lang: ed.lang, label, ...(ed.pages != null ? { pages: ed.pages } : {}), coming_soon: true });
    }
  }
  p.editions = editions;
  writeCatalog(catalog);
  return { ok: true, message: `Saved "${p.title}" — the live book page is updated.` };
}
