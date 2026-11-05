import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAdmin } from "@/lib/admin";
import { PRODUCTS_FILE } from "@/lib/data";
import { CATEGORY, inr as rupees } from "@/lib/format";
import fs from "fs";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Books", robots: { index: false } };

type Row = { slug: string; title: string; price: number; mrp?: number; type: string; is_published?: boolean; variant_of?: string; editions?: { lang: string; label: string; file_path?: string; parts?: unknown[]; coming_soon?: boolean }[] };

/** Owner-only: add a book (PDF + cover + details) that goes live at once, and hide/show or reprice existing books. */
export default async function AdminBooksPage({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  if (!(await getAdmin())) notFound();
  const rows: Row[] = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8")).products;
  const books = rows.filter((p) => p.type === "ebook" && !p.variant_of);
  const cats = Object.entries(CATEGORY).filter(([k]) => k !== "bundle");

  return (
    <div>
      <h1 className="font-display text-[30px] font-extrabold text-cream">Books</h1>
      <p className="mt-1 text-[14px] text-fog">Add a new book here — it goes live on the site straight away, no deploy needed. Use the same title again to add the other language&apos;s PDF to an existing book.</p>
      {searchParams.ok && <p role="status" className="mt-4 rounded-2xl bg-mint/10 p-3 text-[14px] text-cream">{searchParams.ok}</p>}
      {searchParams.err && <p role="alert" className="mt-4 rounded-2xl bg-rosy/10 p-3 text-[14px] text-rosy">{searchParams.err}</p>}

      <form action="/api/admin/books" method="post" encType="multipart/form-data" className="card mt-6 grid gap-3 p-5 sm:grid-cols-2">
        <input type="hidden" name="action" value="add" />
        <h2 className="font-display text-[20px] font-bold text-cream sm:col-span-2">Add a book</h2>
        <input name="title" required placeholder="Title *" className="field h-11 sm:col-span-2" />
        <input name="subtitle" placeholder="Subtitle (one line)" className="field h-11 sm:col-span-2" />
        <textarea name="description" rows={3} placeholder="Description" className="field py-3 sm:col-span-2" />
        <select name="category" required className="field h-11" defaultValue="">
          <option value="" disabled>Category *</option>
          {cats.map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
        </select>
        <input name="badge" placeholder="Badge (e.g. New)" className="field h-11" />
        <input name="price" type="number" min="0" required placeholder="Price ₹ *" className="field h-11" />
        <input name="mrp" type="number" min="0" placeholder="MRP ₹ (struck-through)" className="field h-11" />
        <select name="lang" className="field h-11" defaultValue="hi">
          <option value="hi">PDF language: Hindi</option>
          <option value="en">PDF language: English</option>
        </select>
        <input name="pages" type="number" min="1" placeholder="Number of pages" className="field h-11" />
        <textarea name="learn" rows={4} placeholder={"What you'll learn — one point per line"} className="field py-3" />
        <textarea name="chapters" rows={4} placeholder={"Chapters — one per line"} className="field py-3" />
        <label className="text-[13px] text-fog">Book PDF *<input name="pdf" type="file" accept="application/pdf" required className="field mt-1 block w-full py-2" /></label>
        <label className="text-[13px] text-fog">Cover image (JPG/PNG/WEBP)<input name="cover" type="file" accept="image/jpeg,image/png,image/webp" className="field mt-1 block w-full py-2" /></label>
        <button className="btn-primary h-12 px-6 sm:col-span-2">Add book</button>
      </form>

      <h2 className="mt-10 font-display text-[20px] font-bold text-cream">All books ({books.length})</h2>
      <div className="mt-3 flex flex-col gap-2">
        {books.map((b) => {
          const hidden = b.is_published === false;
          return (
            <div key={b.slug} className="card flex flex-wrap items-center gap-3 p-3 text-[14px]">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-cream">{b.title}</p>
                <p className="text-[12px] text-fog">{b.slug} · {(b.editions ?? []).filter((e) => !e.coming_soon).map((e) => e.label).join(" + ") || "no file"} · {rupees(b.price)}{b.mrp ? ` (MRP ${rupees(b.mrp)})` : ""}</p>
              </div>
              <form action="/api/admin/books" method="post" encType="multipart/form-data" className="flex items-center gap-2">
                <input type="hidden" name="action" value="price" /><input type="hidden" name="slug" value={b.slug} />
                <input name="price" type="number" min="0" defaultValue={b.price} className="field h-10 w-24 py-0" aria-label="Price" />
                <input name="mrp" type="number" min="0" defaultValue={b.mrp ?? ""} placeholder="MRP" className="field h-10 w-24 py-0" aria-label="MRP" />
                <button className="btn-ghost h-10 px-3 text-[13px]">Save price</button>
              </form>
              <form action="/api/admin/books" method="post" encType="multipart/form-data">
                <input type="hidden" name="action" value={hidden ? "publish" : "hide"} /><input type="hidden" name="slug" value={b.slug} />
                <button className={`${hidden ? "btn-primary" : "btn-ghost"} h-10 px-3 text-[13px]`}>{hidden ? "Show on site" : "Hide"}</button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
