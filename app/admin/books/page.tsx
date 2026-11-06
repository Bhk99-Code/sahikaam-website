import Link from "next/link";
import type { Metadata } from "next";
import fs from "fs";
import { productsReadPath } from "@/lib/storage";
import { inr } from "@/lib/format";
import { categoryMap } from "@/lib/categories";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Products", robots: { index: false } };

type Row = { bundle_items?: string[]; include_all?: boolean; slug: string; title: string; price: number; mrp?: number; type: string; category?: string; cover_url?: string; is_published?: boolean; variant_of?: string; editions?: { label: string; file_path?: string; parts?: unknown[]; coming_soon?: boolean }[] };

export default async function AdminProducts({ searchParams }: { searchParams: { ok?: string; err?: string; q?: string; show?: string } }) {
  const all: Row[] = JSON.parse(fs.readFileSync(productsReadPath(), "utf8")).products.filter((p: Row) => (p.type === "ebook" || p.type === "bundle" || p.type === "download") && !p.variant_of);
  const q = (searchParams.q ?? "").trim().toLowerCase();
  const show = searchParams.show === "live" || searchParams.show === "hidden" ? searchParams.show : "";
  const live = all.filter((b) => b.is_published !== false).length;
  const books = all.filter((b) => (!q || b.title.toLowerCase().includes(q) || b.slug.includes(q)) && (!show || (show === "live") === (b.is_published !== false)));
  const tab = (v: string, label: string, n: number) => (
    <Link key={v} href={`/admin/books${v || q ? `?${new URLSearchParams({ ...(v ? { show: v } : {}), ...(q ? { q } : {}) })}` : ""}`} className={`rounded-full px-4 py-2 text-[13px] font-bold ${show === v ? "bg-saffron-500 text-white" : "bg-ink/[0.06] text-fog hover:text-cream"}`}>{label} ({n})</Link>
  );
  const act = (action: string, slug: string, label: string, cls = "btn-ghost") => (
    <form action="/api/admin/books" method="post" encType="multipart/form-data"><input type="hidden" name="action" value={action} /><input type="hidden" name="slug" value={slug} /><button className={`${cls} h-9 px-3 text-[13px]`}>{label}</button></form>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[30px] font-extrabold text-cream">Products</h1>
        <div className="flex gap-2">
          <Link href="/admin/books/new-download" className="btn-ghost h-11 px-5 text-[14px]">+ Add download</Link>
          <Link href="/admin/books/new-bundle" className="btn-ghost h-11 px-5 text-[14px]">+ Add bundle</Link>
          <Link href="/admin/books/new" className="btn-primary h-11 px-5 text-[14px]">+ Add product</Link>
        </div>
      </div>
      {searchParams.ok && <p role="status" className="mt-4 rounded-2xl bg-mint/10 p-3 text-[14px] text-cream">{searchParams.ok}</p>}
      {searchParams.err && <p role="alert" className="mt-4 rounded-2xl bg-rosy/10 p-3 text-[14px] text-rosy">{searchParams.err}</p>}
      <form className="mt-4 flex gap-2">
        {show && <input type="hidden" name="show" value={show} />}
        <input name="q" defaultValue={searchParams.q ?? ""} placeholder="Search products" className="field h-11 flex-1" />
        <button className="btn-ghost h-11 px-5">Search</button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">{tab("", "All", all.length)}{tab("live", "Visible", live)}{tab("hidden", "Hidden", all.length - live)}</div>

      <div className="mt-4 flex flex-col gap-2">
        {books.map((b) => {
          const hidden = b.is_published === false;
          const langs = (b.editions ?? []).map((e) => e.label + (e.coming_soon ? " (soon)" : ""));
          const noFile = b.type === "ebook" && !(b.editions ?? []).some((e) => e.file_path || e.parts);
          return (
            <div key={b.slug} className="card flex flex-wrap items-center gap-3 p-3">
              {b.cover_url ? <img src={b.cover_url} alt="" className="h-16 w-12 shrink-0 rounded-md object-cover ring-1 ring-ink/10" /> : <div className="h-16 w-12 shrink-0 rounded-md bg-ink/[0.06]" />}
              <div className="min-w-0 flex-1 basis-56">
                <Link href={`/admin/books/${b.slug}`} className="block truncate font-semibold text-cream hover:underline">{b.title}</Link>
                <p className="text-[12px] text-fog">{b.type === "download" ? "Download (landing page: /wallpaper/" + b.slug + ")" : b.type === "bundle" ? `Bundle · ${b.include_all || b.slug === "all-access" ? "every book" : `${(b.bundle_items ?? []).length} books`}` : categoryMap()[b.category ?? ""]?.label ?? b.category} · {inr(b.price)}{b.mrp ? ` (MRP ${inr(b.mrp)})` : ""} · {langs.join(" + ") || "no files"}</p>
                {noFile && !hidden && <p className="text-[12px] font-semibold text-rosy">Visible but has no PDF</p>}
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${hidden ? "bg-ink/[0.07] text-fog" : "bg-mint/10 text-mint"}`}>{hidden ? "Hidden" : "Visible"}</span>
              <Link href={`/admin/books/${b.slug}`} className="btn-primary h-9 px-3 text-[13px]">Edit</Link>
              <Link href={`/book/${b.slug}`} target="_blank" className="btn-ghost h-9 px-3 text-[13px]">View ↗</Link>
              {act("duplicate", b.slug, "Duplicate")}
              {act(hidden ? "publish" : "hide", b.slug, hidden ? "Show" : "Hide")}
            </div>
          );
        })}
        {books.length === 0 && <p className="text-fog">No products match.</p>}
      </div>
    </div>
  );
}
