import type { Metadata } from "next";
import fs from "fs";
import { getCategories } from "@/lib/categories";
import { productsReadPath } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Categories", robots: { index: false } };

export default function AdminCategories({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  const cats = getCategories();
  const products: { category?: string; type?: string }[] = JSON.parse(fs.readFileSync(productsReadPath(), "utf8")).products;
  const count = (key: string) => products.filter((p) => p.type === "ebook" && p.category === key).length;
  const post = (action: string, key: string, label: string) => (
    <form action="/api/admin/categories" method="post"><input type="hidden" name="action" value={action} /><input type="hidden" name="key" value={key} />
      <button className="btn-ghost h-9 px-3 text-[13px]">{label}</button></form>
  );
  return (
    <div>
      <h1 className="font-display text-[30px] font-extrabold text-cream">Categories</h1>
      <p className="mt-1 text-[14px] text-fog">Topics shown on the website and used when you add a book. Hiding a category removes it from the shop menu but keeps its books.</p>
      {searchParams.ok && <p role="status" className="mt-4 rounded-2xl bg-mint/10 p-3 text-[14px] text-cream">{searchParams.ok}</p>}
      {searchParams.err && <p role="alert" className="mt-4 rounded-2xl bg-rosy/10 p-3 text-[14px] text-rosy">{searchParams.err}</p>}

      <form action="/api/admin/categories" method="post" className="card mt-6 grid gap-3 p-5 sm:grid-cols-[1fr_2fr_auto]">
        <input type="hidden" name="action" value="add" />
        <input name="label" required placeholder="New category name *" className="field h-11" />
        <input name="blurb" placeholder="One short line shown under it (optional)" className="field h-11" />
        <button className="btn-primary h-11 px-6">Add category</button>
      </form>

      <div className="mt-6 flex flex-col gap-2">
        {cats.map((c, i) => (
          <div key={c.key} className="card flex flex-wrap items-center gap-2 p-3">
            <form action="/api/admin/categories" method="post" className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1fr_2fr_auto]">
              <input type="hidden" name="action" value="update" /><input type="hidden" name="key" value={c.key} />
              <input name="label" defaultValue={c.label} className="field h-10" aria-label="Name" />
              <input name="blurb" defaultValue={c.blurb} className="field h-10" aria-label="Short line" />
              <button className="btn-primary h-10 px-4 text-[13px]">Save</button>
            </form>
            <span className="text-[12px] text-fog">{count(c.key)} books</span>
            <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${c.hidden ? "bg-ink/[0.07] text-fog" : "bg-mint/10 text-mint"}`}>{c.hidden ? "Hidden" : "Visible"}</span>
            {i > 0 && post("up", c.key, "↑")}
            {i < cats.length - 1 && post("down", c.key, "↓")}
            {post("toggle", c.key, c.hidden ? "Show" : "Hide")}
          </div>
        ))}
      </div>
    </div>
  );
}
