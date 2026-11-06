import "server-only";
import fs from "fs";
import path from "path";
import { booksDir, bonusDir, coversDir, productsReadPath, productsWritePath, uploadsDir } from "./storage";
import { getCategories } from "./categories";

// Same persistent-storage convention as BOOKS_DIR / BONUS_DIR / COUPONS_FILE / PRODUCTS_FILE: on the
// live server these env vars point outside the deploy's versioned build folder.

type Catalog = { _help?: string; products: Record<string, any>[] };
type Result = { ok: true; message: string } | { ok: false; error: string };

function readCatalog(): Catalog {
  return JSON.parse(fs.readFileSync(productsReadPath(), "utf8"));
}

function writeCatalog(c: Catalog) {
  const target = productsWritePath();
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const tmp = target + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(c, null, 2) + "\n");
  fs.renameSync(tmp, target);
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
const safeName = (n: string) => n.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^\.+/, "").slice(-90) || "file";

export type Pair = { title: string; text: string };
export type Img = { buf: Buffer; ext: string };
export type GalleryItem = { kind: "url"; url: string } | { kind: "new"; img: Img };
export type BonusItem = { kind: "keep"; file: string; title: string; text: string } | { kind: "new"; name: string; buf: Buffer; title: string; text: string } | { kind: "staged"; uploadId: string; name: string; title: string; text: string };
export type EditionInput = { lang: "hi" | "en"; pages: number | null; comingSoon: boolean; pdf: Buffer | null; uploadId?: string | null };
export type ProductInput = {
  type?: "ebook" | "bundle" | "download";
  /** Download products: coupons never apply (e.g. the ₹99 wallpaper). */
  noCoupon?: boolean;
  /** Bundles: slugs of the books inside; includeAll = every published book, now and later (All Access style). */
  bundleItems?: string[]; includeAll?: boolean; accessDays?: number | null;
  title: string; subtitle: string; description: string; category: string; badge: string; level: string;
  price: number; mrp: number | null; sortOrder: number | null; published: boolean;
  highlights: Pair[]; inside: Pair[]; learn: string[]; chapters: string[];
  cover: Img | null; gallery: GalleryItem[]; editions: EditionInput[]; bonus: BonusItem[];
};

export function getBookRaw(slug: string): Record<string, any> | null {
  return readCatalog().products.find((p) => p.slug === slug) ?? null;
}

function saveImage(slug: string, tag: string, img: Img) {
  fs.mkdirSync(coversDir(), { recursive: true });
  const name = `${slug}-${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}${img.ext}`;
  fs.writeFileSync(path.join(coversDir(), name), img.buf);
  return `/api/covers/${name}`;
}

/**
 * Creates (slug = null) or updates a product with everything the public book page shows.
 * Empty optional text removes the field; files that are replaced or removed stay on disk (never deleted).
 */
export function saveProduct(slug: string | null, e: ProductInput): Result & { slug?: string } {
  if (!e.title.trim()) return { ok: false, error: "Title is required." };
  const kind = slug ? readCatalog().products.find((x) => x.slug === slug)?.type : e.type;
  const wantsBundle = kind === "bundle";
  if (kind !== "download" && !wantsBundle && !getCategories().some((c) => c.key === e.category)) return { ok: false, error: "Pick a category." };
  if (wantsBundle && !e.includeAll && !(e.bundleItems ?? []).length) return { ok: false, error: "Choose at least one book for the bundle, or tick “every book”." };
  if (!Number.isFinite(e.price) || e.price < 0) return { ok: false, error: "Price must be a number." };
  if (e.mrp != null && (!Number.isFinite(e.mrp) || e.mrp < 0)) return { ok: false, error: "MRP must be a number." };
  const staged = (id?: string | null) => (id && /^[a-zA-Z0-9-]{8,64}$/.test(id) ? path.join(uploadsDir(), `${id}.bin`) : null);
  for (const ed of e.editions) {
    if (ed.pdf && ed.pdf.subarray(0, 4).toString() !== "%PDF") return { ok: false, error: "Book files must be PDFs." };
    const sp = staged(ed.uploadId);
    if (ed.uploadId && !(sp && fs.existsSync(sp))) return { ok: false, error: "The PDF upload did not finish. Please upload it again." };
    if (sp) {
      const head = Buffer.alloc(4); const fd = fs.openSync(sp, "r"); fs.readSync(fd, head, 0, 4, 0); fs.closeSync(fd);
      if (head.toString() !== "%PDF") return { ok: false, error: "That file is not a PDF." };
    }
  }

  const catalog = readCatalog();
  let p = slug ? catalog.products.find((x) => x.slug === slug) : null;
  if (slug && !p) return { ok: false, error: "Product not found." };
  if (!p) {
    let base = slugify(e.title) || "book", n = 2;
    slug = base;
    while (catalog.products.some((x) => x.slug === slug)) slug = `${base}-${n++}`;
    p = { slug, type: e.type === "bundle" ? "bundle" : e.type === "download" ? "download" : "ebook", accent: "#FF6A00", sort_order: Math.max(0, ...catalog.products.map((x) => Number(x.sort_order) || 0)) + 10 };
    catalog.products.push(p);
  }
  const id = p.slug as string;

  const setOrDrop = (key: string, v: unknown, empty: boolean) => { if (empty) delete p![key]; else p![key] = v; };
  p.title = e.title.trim();
  p.category = p.type === "bundle" ? "bundle" : p.type === "download" ? "download" : e.category;
  if (p.type === "download") p.no_coupon = Boolean(e.noCoupon);
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

  if (p.type === "bundle") {
    const all = new Set(readCatalog().products.filter((x) => x.type === "ebook").map((x) => x.slug));
    p.bundle_items = [...new Set(e.bundleItems ?? [])].filter((x) => all.has(x));
    p.include_all = Boolean(e.includeAll);
    if (e.accessDays && e.accessDays > 0) p.access_days = Math.round(e.accessDays); else delete p.access_days;
  }

  const editions: any[] = p.editions ?? [];
  for (const ed of p.type === "bundle" || p.type === "download" ? [] : e.editions) {
    const existing = editions.find((x) => x.lang === ed.lang);
    const label = ed.lang === "hi" ? "Hindi" : "English";
    const sp = staged(ed.uploadId);
    if (existing?.parts && !ed.pdf && !sp) continue; // chapter-wise files stay unless a single PDF is uploaded to replace them
    if (ed.pdf || sp) {
      const file = existing?.file_path ?? `${id}${ed.lang === "en" ? "-en" : ""}.pdf`;
      fs.mkdirSync(path.dirname(path.join(booksDir(), file)), { recursive: true });
      if (sp) { try { fs.renameSync(sp, path.join(booksDir(), file)); } catch { fs.copyFileSync(sp, path.join(booksDir(), file)); fs.rmSync(sp, { force: true }); } }
      else fs.writeFileSync(path.join(booksDir(), file), ed.pdf!);
      if (existing) delete existing.parts;
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
    fs.mkdirSync(path.dirname(path.join(bonusDir(), rel)), { recursive: true });
    if (b.kind === "staged") {
      const sp = path.join(uploadsDir(), `${b.uploadId.replace(/[^a-zA-Z0-9-]/g, "")}.bin`);
      if (!fs.existsSync(sp)) throw new Error(`The upload of "${b.title}" did not finish. Please upload it again.`);
      try { fs.renameSync(sp, path.join(bonusDir(), rel)); } catch { fs.copyFileSync(sp, path.join(bonusDir(), rel)); fs.rmSync(sp, { force: true }); }
    } else fs.writeFileSync(path.join(bonusDir(), rel), b.buf);
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
