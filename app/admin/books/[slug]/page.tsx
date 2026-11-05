import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBookRaw } from "@/lib/adminBooks";
import { CATEGORY } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Edit book", robots: { index: false } };

type Pair = { title: string; text: string };
const pairLines = (a?: Pair[]) => (a ?? []).map((h) => (h.text ? `${h.title} | ${h.text}` : h.title)).join("\n");
const lbl = "block text-[13px] font-semibold text-cream";
const hint = "mt-1 text-[12px] text-fog";

/** Edit everything the public book page shows (same order as the page): header, highlights, what you'll learn, about, inside, chapters, images, languages. */
export default async function EditBookPage({ params, searchParams }: { params: { slug: string }; searchParams: { ok?: string; err?: string } }) {
  const p = getBookRaw(params.slug);
  if (!p) notFound();
  const cats = Object.entries(CATEGORY);
  const gallery: string[] = p.gallery ?? [];
  const editions: any[] = p.editions ?? [];
  const bundle = p.type === "bundle";

  return (
    <div>
      <Link href="/admin/books" className="text-[14px] font-semibold text-fog hover:text-cream">← All books</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[28px] font-extrabold text-cream">Edit book page</h1>
        <Link href={`/book/${p.slug}`} target="_blank" className="btn-ghost h-10 px-4 text-[13px]">View live page ↗</Link>
      </div>
      <p className="mt-1 text-[14px] text-fog">Sections below follow the live page from top to bottom. Saving updates the website immediately.</p>
      {searchParams.ok && <p role="status" className="mt-4 rounded-2xl bg-mint/10 p-3 text-[14px] text-cream">{searchParams.ok}</p>}
      {searchParams.err && <p role="alert" className="mt-4 rounded-2xl bg-rosy/10 p-3 text-[14px] text-rosy">{searchParams.err}</p>}

      <form action="/api/admin/books" method="post" encType="multipart/form-data" className="mt-6 flex flex-col gap-5">
        <input type="hidden" name="action" value="update" /><input type="hidden" name="slug" value={p.slug} />

        <section className="card grid gap-3 p-5 sm:grid-cols-2">
          <h2 className="font-display text-[18px] font-bold text-cream sm:col-span-2">1 · Top of the page</h2>
          <label className={`${lbl} sm:col-span-2`}>Title<input name="title" required defaultValue={p.title} className="field mt-1 h-11 w-full" /></label>
          <label className={`${lbl} sm:col-span-2`}>Subtitle<input name="subtitle" defaultValue={p.subtitle ?? ""} className="field mt-1 h-11 w-full" /></label>
          <label className={lbl}>Category<select name="category" defaultValue={p.category} className="field mt-1 h-11 w-full">{cats.map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}</select></label>
          <label className={lbl}>Badge<input name="badge" defaultValue={p.badge ?? ""} placeholder="e.g. Bestseller" className="field mt-1 h-11 w-full" /></label>
          <label className={lbl}>Level<input name="level" defaultValue={p.level ?? ""} placeholder="e.g. Beginner to advanced" className="field mt-1 h-11 w-full" /></label>
          <label className={lbl}>Position in lists<input name="sort_order" type="number" defaultValue={p.sort_order ?? ""} className="field mt-1 h-11 w-full" /><span className={hint}>Smaller number shows first.</span></label>
          <label className={lbl}>Price ₹<input name="price" type="number" min="0" required defaultValue={p.price} className="field mt-1 h-11 w-full" /></label>
          <label className={lbl}>MRP ₹ (struck-through)<input name="mrp" type="number" min="0" defaultValue={p.mrp ?? ""} className="field mt-1 h-11 w-full" /></label>
          <label className="flex items-center gap-2 text-[14px] text-cream sm:col-span-2"><input type="checkbox" name="published" defaultChecked={p.is_published !== false} /> Visible on the website</label>
        </section>

        <section className="card grid gap-3 p-5">
          <h2 className="font-display text-[18px] font-bold text-cream">2 · Number highlights</h2>
          <label className={lbl}>One per line: Big text | small text<textarea name="highlights" rows={4} defaultValue={pairLines(p.highlights)} placeholder={"50 | Business ideas\nLifetime | Access"} className="field mt-1 w-full py-3" /></label>
        </section>

        <section className="card grid gap-3 p-5">
          <h2 className="font-display text-[18px] font-bold text-cream">3 · What you&apos;ll learn</h2>
          <label className={lbl}>One point per line<textarea name="learn" rows={6} defaultValue={(p.learn ?? []).join("\n")} className="field mt-1 w-full py-3" /></label>
        </section>

        <section className="card grid gap-3 p-5">
          <h2 className="font-display text-[18px] font-bold text-cream">4 · About this {bundle ? "bundle" : "ebook"}</h2>
          <label className={lbl}>Description<textarea name="description" rows={6} defaultValue={p.description ?? ""} className="field mt-1 w-full py-3" /></label>
        </section>

        <section className="card grid gap-3 p-5">
          <h2 className="font-display text-[18px] font-bold text-cream">5 · What&apos;s inside</h2>
          <label className={lbl}>One per line: Heading | short explanation<textarea name="inside" rows={7} defaultValue={pairLines(p.inside)} className="field mt-1 w-full py-3" /></label>
        </section>

        {!bundle && (
          <section className="card grid gap-3 p-5">
            <h2 className="font-display text-[18px] font-bold text-cream">6 · Chapters</h2>
            <label className={lbl}>One chapter per line<textarea name="chapters" rows={6} defaultValue={(p.chapters ?? []).join("\n")} className="field mt-1 w-full py-3" /></label>
          </section>
        )}

        <section className="card grid gap-3 p-5">
          <h2 className="font-display text-[18px] font-bold text-cream">7 · Images</h2>
          <label className={lbl}>Cover (shown in lists){p.cover_url && <img src={p.cover_url} alt="" className="mt-2 h-28 rounded-lg" />}<input name="cover" type="file" accept="image/jpeg,image/png,image/webp" className="field mt-2 block w-full py-2" /></label>
          <div>
            <p className={lbl}>Gallery on the book page <span className="font-normal text-fog">(first image is the main one)</span></p>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {gallery.map((g, i) => (
                <div key={g} className="rounded-xl bg-ink/[0.04] p-2 text-[12px]">
                  <img src={g} alt="" className="h-28 w-full rounded-lg object-contain" />
                  <label className="mt-2 flex items-center gap-1.5"><input type="checkbox" name="gallery_keep" value={g} defaultChecked /> Keep</label>
                  <label className="flex items-center gap-1.5"><input type="radio" name="gallery_main" value={g} defaultChecked={i === 0} /> Main</label>
                </div>
              ))}
              {gallery.length === 0 && <p className="col-span-full text-[13px] text-fog">No gallery images yet.</p>}
            </div>
            <label className={`${lbl} mt-3`}>Add images<input name="gallery_new" type="file" multiple accept="image/jpeg,image/png,image/webp" className="field mt-1 block w-full py-2" /></label>
          </div>
        </section>

        {!bundle && (
          <section className="card grid gap-4 p-5">
            <h2 className="font-display text-[18px] font-bold text-cream">8 · Languages &amp; PDF files</h2>
            {(["hi", "en"] as const).map((lang) => {
              const ed = editions.find((x) => x.lang === lang);
              return (
                <div key={lang} className="grid gap-2 rounded-2xl bg-ink/[0.04] p-3 sm:grid-cols-3">
                  <p className="font-bold text-cream sm:col-span-3">{lang === "hi" ? "Hindi" : "English"} <span className="font-normal text-[13px] text-fog">{ed?.parts ? "· chapter-wise files (managed outside this form)" : ed?.file_path ? `· ${ed.file_path}` : ed?.coming_soon ? "· coming soon" : "· not added"}</span></p>
                  <label className={lbl}>Pages<input name={`pages_${lang}`} type="number" min="1" defaultValue={ed?.pages ?? ""} disabled={Boolean(ed?.parts)} className="field mt-1 h-11 w-full" /></label>
                  <label className={`${lbl} sm:col-span-2`}>{ed?.file_path ? "Replace PDF" : "Upload PDF"}<input name={`pdf_${lang}`} type="file" accept="application/pdf" disabled={Boolean(ed?.parts)} className="field mt-1 block w-full py-2" /></label>
                  <label className="flex items-center gap-2 text-[13px] text-cream sm:col-span-3"><input type="checkbox" name={`soon_${lang}`} defaultChecked={Boolean(ed?.coming_soon)} disabled={Boolean(ed?.parts)} /> Show as “coming soon” (no PDF yet)</label>
                </div>
              );
            })}
          </section>
        )}

        <div className="sticky bottom-3 z-10"><button className="btn-primary h-12 w-full px-6 shadow-lg">Save changes</button></div>
      </form>
    </div>
  );
}
