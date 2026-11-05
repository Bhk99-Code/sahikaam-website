import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";
import { saveProduct, type BonusItem, type GalleryItem, type Img, type Pair } from "@/lib/adminBooks";

const MAX_PDF = 100 * 1024 * 1024;
const MAX_IMG = 5 * 1024 * 1024;
const MAX_BONUS = 25 * 1024 * 1024;
const IMG_EXT: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const str = (v: unknown) => String(v ?? "");
const list = (v: unknown) => (Array.isArray(v) ? v.map((x) => str(x).trim()).filter(Boolean) : []);
const pairs = (v: unknown): Pair[] => (Array.isArray(v) ? v.map((x) => ({ title: str(x?.title).trim(), text: str(x?.text).trim() })).filter((x) => x.title) : []);
const num = (v: unknown) => (v === "" || v == null ? null : Number(v));

class Bad extends Error {}

async function image(f: FormDataEntryValue | null): Promise<Img | null> {
  if (!(f instanceof File) || f.size === 0) return null;
  const ext = IMG_EXT[f.type];
  if (!ext) throw new Bad("Images must be JPG, PNG or WEBP.");
  if (f.size > MAX_IMG) throw new Bad("An image is too large (max 5MB).");
  return { buf: Buffer.from(await f.arrayBuffer()), ext };
}

/** Owner-only: create or update a product. multipart form: "payload" (JSON text fields) + files (cover, gallery_N, pdf_hi, pdf_en, bonus_N). */
export async function POST(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ ok: false, error: "not allowed" }, { status: 403 });
  try {
    const form = await req.formData();
    const d = JSON.parse(str(form.get("payload")));
    const gallery: GalleryItem[] = [];
    for (const g of Array.isArray(d.gallery) ? d.gallery : []) {
      if (g.kind === "url" && typeof g.url === "string") gallery.push({ kind: "url", url: g.url });
      else if (g.kind === "new") { const img = await image(form.get(`gallery_${g.i}`)); if (img) gallery.push({ kind: "new", img }); }
    }
    const bonus: BonusItem[] = [];
    for (const b of Array.isArray(d.bonus) ? d.bonus : []) {
      if (!str(b.title).trim()) continue;
      if (b.kind === "keep") bonus.push({ kind: "keep", file: str(b.file), title: str(b.title).trim(), text: str(b.text).trim() });
      else if (b.kind === "new") {
        const f = form.get(`bonus_${b.i}`);
        if (!(f instanceof File) || f.size === 0) throw new Bad(`Choose a file for the bonus "${str(b.title)}".`);
        if (f.size > MAX_BONUS) throw new Bad("A bonus file is too large (max 25MB).");
        bonus.push({ kind: "new", name: f.name, buf: Buffer.from(await f.arrayBuffer()), title: str(b.title).trim(), text: str(b.text).trim() });
      }
    }
    const editions = [];
    for (const lang of ["hi", "en"] as const) {
      const f = form.get(`pdf_${lang}`);
      if (f instanceof File && f.size > MAX_PDF) throw new Bad("A PDF is too large (max 100MB).");
      editions.push({ lang, pages: num(d.editions?.[lang]?.pages), comingSoon: Boolean(d.editions?.[lang]?.soon), pdf: f instanceof File && f.size > 0 ? Buffer.from(await f.arrayBuffer()) : null, uploadId: str(d.editions?.[lang]?.uploadId) || null });
    }
    const r = saveProduct(str(d.slug) || null, {
      type: d.type === "bundle" ? "bundle" : "ebook",
      bundleItems: Array.isArray(d.bundleItems) ? d.bundleItems.map(String) : [], includeAll: Boolean(d.includeAll),
      accessDays: num(d.accessDays),
      title: str(d.title), subtitle: str(d.subtitle), description: str(d.description), category: str(d.category),
      badge: str(d.badge), level: str(d.level), price: Number(d.price), mrp: num(d.mrp), sortOrder: num(d.sortOrder),
      published: Boolean(d.published), highlights: pairs(d.highlights), inside: pairs(d.inside),
      learn: list(d.learn), chapters: list(d.chapters), cover: await image(form.get("cover")), gallery, editions, bonus,
    });
    return NextResponse.json(r, { status: r.ok ? 200 : 400 });
  } catch (e) {
    if (e instanceof Bad) return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    console.error("save product", e);
    return NextResponse.json({ ok: false, error: "Could not save. Please try again." }, { status: 500 });
  }
}
