import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";
import { addBook, setPublished, updateBook, updatePrice, type Pair } from "@/lib/adminBooks";

const MAX_PDF = 100 * 1024 * 1024;
const MAX_COVER = 5 * 1024 * 1024;
const COVER_EXT: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const lines = (v: FormDataEntryValue | null) => String(v ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
const pairs = (v: FormDataEntryValue | null): Pair[] =>
  lines(v).map((l) => { const i = l.indexOf("|"); return i < 0 ? { title: l, text: "" } : { title: l.slice(0, i).trim(), text: l.slice(i + 1).trim() }; }).filter((p) => p.title);
const num = (v: FormDataEntryValue | null) => (String(v ?? "").trim() === "" ? null : Number(v));

/** Owner-only: add a book, hide/show it, or change its price. Redirects back to /admin/books with a message. */
export async function POST(req: Request) {
  let to = "/admin/books";
  const back = (key: "ok" | "err", msg: string) =>
    new NextResponse(null, { status: 303, headers: { Location: `${to}?${key}=${encodeURIComponent(msg)}` } });
  if (!(await getAdmin())) return NextResponse.json({ error: "not allowed" }, { status: 403 });

  const form = await req.formData().catch(() => null);
  if (!form) return back("err", "Bad form.");
  const action = String(form.get("action") ?? "");
  const slug = String(form.get("slug") ?? "");

  if (action === "publish" || action === "hide") {
    const r = setPublished(slug, action === "publish");
    return r.ok ? back("ok", r.message) : back("err", r.error);
  }
  if (action === "price") {
    const r = updatePrice(slug, Number(form.get("price")), num(form.get("mrp")));
    return r.ok ? back("ok", r.message) : back("err", r.error);
  }
  if (action === "update") {
    to = `/admin/books/${encodeURIComponent(slug)}`;
    const image = async (v: FormDataEntryValue | null) => {
      if (!(v instanceof File) || v.size === 0) return null;
      const ext = COVER_EXT[v.type];
      if (!ext) throw new Error("Images must be JPG, PNG or WEBP.");
      if (v.size > MAX_COVER) throw new Error("An image is too large (max 5MB).");
      return { buf: Buffer.from(await v.arrayBuffer()), ext };
    };
    try {
      const galleryNew = (await Promise.all(form.getAll("gallery_new").map(image))).filter((x): x is NonNullable<typeof x> => Boolean(x));
      const editions = [];
      for (const lang of ["hi", "en"] as const) {
        const f = form.get(`pdf_${lang}`);
        if (f instanceof File && f.size > MAX_PDF) return back("err", "A PDF is too large (max 100MB).");
        editions.push({
          lang, pages: num(form.get(`pages_${lang}`)), comingSoon: form.get(`soon_${lang}`) === "on",
          pdf: f instanceof File && f.size > 0 ? Buffer.from(await f.arrayBuffer()) : null,
        });
      }
      const main = String(form.get("gallery_main") ?? "");
      const keep = form.getAll("gallery_keep").map(String);
      const r = updateBook(slug, {
        title: String(form.get("title") ?? ""), subtitle: String(form.get("subtitle") ?? ""),
        description: String(form.get("description") ?? ""), category: String(form.get("category") ?? ""),
        badge: String(form.get("badge") ?? ""), level: String(form.get("level") ?? ""),
        price: Number(form.get("price")), mrp: num(form.get("mrp")), sortOrder: num(form.get("sort_order")),
        published: form.get("published") === "on",
        highlights: pairs(form.get("highlights")), inside: pairs(form.get("inside")),
        learn: lines(form.get("learn")), chapters: lines(form.get("chapters")),
        galleryKeep: main && keep.includes(main) ? [main, ...keep.filter((k) => k !== main)] : keep,
        galleryNew, cover: await image(form.get("cover")), editions,
      });
      return r.ok ? back("ok", r.message) : back("err", r.error);
    } catch (e) {
      return back("err", e instanceof Error ? e.message : "Could not save.");
    }
  }
  if (action !== "add") return back("err", "Unknown action.");

  const pdf = form.get("pdf");
  const cover = form.get("cover");
  if (!(pdf instanceof File) || pdf.size === 0) return back("err", "Choose the book PDF.");
  if (pdf.size > MAX_PDF) return back("err", "PDF is too large (max 100MB).");
  let coverBuf: Buffer | null = null;
  let coverExt = "";
  if (cover instanceof File && cover.size > 0) {
    coverExt = COVER_EXT[cover.type] ?? "";
    if (!coverExt) return back("err", "Cover must be JPG, PNG or WEBP.");
    if (cover.size > MAX_COVER) return back("err", "Cover is too large (max 5MB).");
    coverBuf = Buffer.from(await cover.arrayBuffer());
  }

  const r = addBook({
    title: String(form.get("title") ?? ""), subtitle: String(form.get("subtitle") ?? ""),
    description: String(form.get("description") ?? ""), category: String(form.get("category") ?? ""),
    price: Number(form.get("price")), mrp: num(form.get("mrp")), badge: String(form.get("badge") ?? ""),
    lang: form.get("lang") === "en" ? "en" : "hi", pages: num(form.get("pages")),
    learn: lines(form.get("learn")), chapters: lines(form.get("chapters")),
    pdf: Buffer.from(await pdf.arrayBuffer()), cover: coverBuf, coverExt,
  });
  return r.ok ? back("ok", r.message) : back("err", r.error);
}
