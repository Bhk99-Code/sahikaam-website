import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";
import { addBook, setPublished, updatePrice } from "@/lib/adminBooks";

const MAX_PDF = 100 * 1024 * 1024;
const MAX_COVER = 5 * 1024 * 1024;
const COVER_EXT: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const lines = (v: FormDataEntryValue | null) => String(v ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
const num = (v: FormDataEntryValue | null) => (String(v ?? "").trim() === "" ? null : Number(v));

/** Owner-only: add a book, hide/show it, or change its price. Redirects back to /admin/books with a message. */
export async function POST(req: Request) {
  const back = (key: "ok" | "err", msg: string) =>
    new NextResponse(null, { status: 303, headers: { Location: `/admin/books?${key}=${encodeURIComponent(msg)}` } });
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
