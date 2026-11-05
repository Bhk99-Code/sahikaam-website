import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBookRaw } from "@/lib/adminBooks";
import { editorOptions } from "../editorData";
import { ProductEditor, type EditorProduct } from "../ProductEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Edit product", robots: { index: false } };

const pairs = (a: any): { title: string; text: string }[] => (Array.isArray(a) ? a.map((x) => ({ title: String(x.title ?? ""), text: String(x.text ?? "") })) : []);
const s = (v: unknown) => (v == null ? "" : String(v));

export default async function EditProductPage({ params, searchParams }: { params: { slug: string }; searchParams: { saved?: string; ok?: string; err?: string } }) {
  const p = getBookRaw(params.slug);
  if (!p) notFound();
  const ed = (lang: "hi" | "en") => {
    const e = (p.editions ?? []).find((x: any) => x.lang === lang);
    return { pages: s(e?.pages), soon: Boolean(e?.coming_soon), file: s(e?.file_path), parts: Boolean(e?.parts) };
  };
  const initial: EditorProduct = {
    slug: p.slug, type: s(p.type) || "ebook", title: s(p.title), subtitle: s(p.subtitle), description: s(p.description),
    category: s(p.category), badge: s(p.badge), level: s(p.level), price: s(p.price), mrp: s(p.mrp), sortOrder: s(p.sort_order),
    published: p.is_published !== false, highlights: pairs(p.highlights), inside: pairs(p.inside),
    learn: (p.learn ?? []).map(String), chapters: (p.chapters ?? []).map(String), cover: s(p.cover_url), gallery: (p.gallery ?? []).map(String),
    editions: { hi: ed("hi"), en: ed("en") },
    bonus: (p.bonus ?? []).map((b: any) => ({ title: s(b.title), text: s(b.text), file: s(b.file) })),
    bundleItems: (p.bundle_items ?? []).map(String), includeAll: p.include_all === true || p.slug === "all-access" || p.variant_of === "all-access", accessDays: s(p.access_days),
  };
  const { books, categories } = editorOptions(s(p.category));
  const flash = searchParams.saved ? "Product created." : searchParams.ok;
  return (
    <div>
      <h1 className="font-display text-[28px] font-extrabold text-cream">Edit product</h1>
      <p className="mb-6 mt-1 text-[14px] text-fog">Changes go live on the website as soon as you save.</p>
      {flash && <p role="status" className="mb-5 rounded-2xl bg-mint/10 p-3 text-[14px] text-cream">{flash}</p>}
      {searchParams.err && <p role="alert" className="mb-5 rounded-2xl bg-rosy/10 p-3 text-[14px] text-rosy">{searchParams.err}</p>}
      <ProductEditor key={p.slug} initial={initial} categories={categories} books={books} />
    </div>
  );
}
