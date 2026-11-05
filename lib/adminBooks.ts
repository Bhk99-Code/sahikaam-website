import "server-only";
import fs from "fs";
import path from "path";
import { PRODUCTS_FILE } from "./data";
import { CATEGORY } from "./format";

// Same persistent-storage convention as BOOKS_DIR / BONUS_DIR / COUPONS_FILE / PRODUCTS_FILE: on the
// live server these env vars point outside the deploy's versioned build folder.
export const BOOKS_DIR = process.env.BOOKS_DIR || path.join(process.cwd(), "private", "books");
export const BONUS_DIR = process.env.BONUS_DIR || path.join(process.cwd(), "private", "bonus");
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

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
const safeName = (n: string) => n.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^\.+/, "").slice(-90) || "file";

export type Pair = { title: string; text: string };
export type Img = { buf: Buffer; ext: string };
export type GalleryItem = { kind: "url"; url: string } | { kind: "new"; img: Img };
export type BonusItem = { kind: "keep"; file: string; title: string; text: string } | { kind: "new"; name: string; buf: Buffer; title: string; text: string };
export type EditionInput = { lang: "hi" | "en"; pages: number | null; comingSoon: boolean; pdf: Buffer | null };
export type ProductInput = {
  title: string; subtitle: string; description: string; category: string; badge: string; level: string;
  price: number; mrp: number | null; sortOrder: number | null; published: boolean;
  highlights: Pair[]; inside: Pair[]; learn: string[]; chapters: string[];
  cover: Img | null; gallery: GalleryItem[]; editions: EditionInput[]; bonus: BonusItem[];
};

export function getBookRaw(slug: string): Record<string, any> | null {
  return readCatalog().products.find((p) => p.slug === slug) ?? null;
}

function saveImage(slug: string, tag: string, img: Img) {
  fs.mkdirSync(COVERS_DIR, { recursive: true });
  const name = `${slug}-${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}${img.ext}`;
  fs.writeFileSync(path.join(COVERS_DIR, name), img.buf);
  return `/api/covers/${name}`;
}

/**
 * Creates (slug = null) or updates a product with everything the public book page shows.
 * Empty optional text removes the field; files that are replaced or removed stay on disk (never deleted).
 */
export function saveProduct(slug: string | null, e: ProductInput): Result & { slug?: string } {
  if (!e.title.trim()) return { ok: false, error: "Title is required." };
  if (!(e.category in CATEGORY) || e.category === "bundle") return { ok: false, error: "Pick a category." };
  if (!Number.isFinite(e.price) || e.price < 0) return { ok: false, error: "Price must be a number." };
  if (e.mrp != null && (!Number.isFinite(e.mrp) || e.mrp < 0)) return { ok: false, error: "MRP must be a number." };
  for (const ed of e.editions) if (ed.pdf && ed.pdf.subarray(0, 4).toString() !== "%PDF") return { ok: false, error: "Book files must be PDFs." };

  const catalog = readCatalog();
  let p = slug ? catalog.products.find((x) => x.slug === slug) : null;
  if (slug && !p) return { ok: false, error: "Product not found." };
  if (!p) {
    let base = slugify(e.title) || "book", n = 2;
    slug = base;
    while (catalog.products.some((x) => x.slug === slug)) slug = `${base}-${n++}`;
    p = { slug, type: "ebook", accent: "#FF6A00", sort_order: Math.max(0, ...catalog.products.map((x) => Number(x.sort_order) || 0)) + 10 };
    catalog.products.push(p);
  }
  const id = p.slug as string;

  const setOrDrop = (key: string, v: unknown, empty: boolean) => { if (empty) delete p![key]; else p![key] = v; };
  p.title = e.title.trim();
  p.category = e.category;
  p.price = e.price;
  setOrDrop("subtitle", e.subtitle.trim(), !e.subtitle.trim());
  setOrDrop("description", e.description.trim(), !e.description.trim());
  setOrDrop("badge", e.badge.trim(), !e.badge.trim());
  setOrDrop("level", e.level.trim(), !e.level.trim());
  setOrDrop("mrp", e.mrp, e.mrp == null);
  if (e.sortOrder != null && Number.isFinite(e.sortOrder)) p.sort_order = e.sortOrder;
  p.is_published = e.published;
  setOrDrop("highlights", e.highlights, !e.highlights.length);
  setOrDrop("inside", e.inside, !e.inside.length);
  setOrDrop("learn", e.learn, !e.learn.length);
  setOrDrop("chapters", e.chapters, !e.chapters.length);

  if (e.cover) p.cover_url = saveImage(id, "cover", e.cover);
  const gallery = e.gallery.map((g) => (g.kind === "url" ? g.url : saveImage(id, "g", g.img)));
  setOrDrop("gallery", gallery, !gallery.length);

  const editions: any[] = p.editions ?? [];
  for (const ed of e.editions) {
    const existing = editions.find((x) => x.lang === ed.lang);
    if (existing?.parts) continue; // chapter-wise files are managed outside this form
    const label = ed.lang === "hi" ? "Hindi" : "English";
    if (ed.pdf) {
      const file = existing?.file_path ?? `${id}${ed.lang === "en" ? "-en" : ""}.pdf`;
      fs.mkdirSync(BOOKS_DIR, { recursive: true });
      fs.writeFileSync(path.join(BOOKS_DIR, file), ed.pdf);
      if (existing) { Object.assign(existing, { label, file_path: file }); delete existing.coming_soon; if (ed.pages != null) existing.pages = ed.pages; }
      else editions.push({ lang: ed.lang, label, ...(ed.pages != null ? { pages: ed.pages } : {}), file_path: file });
    } else if (existing) {
      if (ed.pages != null) existing.pages = ed.pages; else delete existing.pages;
      if (ed.comingSoon) existing.coming_soon = true; else delete existing.coming_soon;
    } else if (ed.comingSoon) {
      editions.push({ lang: ed.lang, label, ...(ed.pages != null ? { pages: ed.pages } : {}), coming_soon: true });
    }
  }
  p.editions = editions;

  const bonus = e.bonus.map((b) => {
    if (b.kind === "keep") return { title: b.title, ...(b.text ? { text: b.text } : {}), file: b.file };
    const rel = `${id}/${safeName(b.name)}`;
    fs.mkdirSync(path.dirname(path.join(BONUS_DIR, rel)), { recursive: true });
    fs.writeFileSync(path.join(BONUS_DIR, rel), b.buf);
    return { title: b.title, ...(b.text ? { text: b.text } : {}), file: rel };
  });
  setOrDrop("bonus", bonus, !bonus.length);

  writeCatalog(catalog);
  return { ok: true, slug: id, message: `Saved "${p.title}" — the website is updated.` };
}

export function setPublished(slug: string, published: boolean): Result {
  const catalog = readCatalog();
  const p = catalog.products.find((x) => x.slug === slug);
  if (!p) return { ok: false, error: "Book not found." };
  p.is_published = published;
  writeCatalog(catalog);
  return { ok: true, message: `"${p.title}" is now ${published ? "visible" : "hidden"}.` };
}

/** Copy of a product's text content (no files), hidden until the owner finishes it. */
export function duplicateProduct(slug: string): Result & { slug?: string } {
  const catalog = readCatalog();
  const src = catalog.products.find((x) => x.slug === slug);
  if (!src) return { ok: false, error: "Product not found." };
  let n = 1, copy = `${slug}-copy`;
  while (catalog.products.some((x) => x.slug === copy)) copy = `${slug}-copy-${++n}`;
  const dup = JSON.parse(JSON.stringify(src));
  Object.assign(dup, { slug: copy, title: `${src.title} (Copy)`, is_published: false, editions: [], bonus: [], sort_order: Math.max(0, ...catalog.products.map((x) => Number(x.sort_order) || 0)) + 10 });
  delete dup.bundle_items; delete dup.variant_of;
  catalog.products.push(dup);
  writeCatalog(catalog);
  return { ok: true, slug: copy, message: `Duplicated — edit "${dup.title}" and publish when ready.` };
}
