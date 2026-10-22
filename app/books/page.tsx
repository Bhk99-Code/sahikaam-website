import Link from "next/link";
import type { Metadata } from "next";
import { getProducts, bundleCovers } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { Icon } from "@/components/Icon";
import { CATEGORY } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "All ebooks" };

export default async function Books({ searchParams }: { searchParams: { cat?: string; q?: string } }) {
  const all = await getProducts();
  const cat = searchParams.cat ?? "";
  const q = (searchParams.q ?? "").trim().toLowerCase();
  const cats = Object.entries(CATEGORY).filter(([key]) => all.some((p) => p.category === key));
  let products = cat ? all.filter((p) => p.category === cat) : all;
  if (q) products = products.filter((p) => `${p.title} ${p.subtitle ?? ""} ${p.description ?? ""}`.toLowerCase().includes(q));

  return (
    <div className="container-x py-10 md:py-14">
      <p className="eyebrow">The library</p>
      <h1 className="mt-2 font-display text-[36px] font-extrabold tracking-tight text-cream md:text-[48px]">All ebooks</h1>
      <form action="/books" className="mt-6 flex gap-2">
        {cat && <input type="hidden" name="cat" value={cat} />}
        <label htmlFor="q" className="sr-only">Search</label>
        <div className="flex h-[52px] min-w-0 flex-1 items-center gap-2 rounded-full border border-ink/10 bg-night-3 px-5 text-fog focus-within:border-saffron-500">
          <Icon name="search" size={18} />
          <input id="q" name="q" defaultValue={q} placeholder="Search by business, topic or title"
            className="w-full bg-transparent text-[15px] text-cream outline-none placeholder:text-fog-2" />
        </div>
        <button className="btn-primary h-[52px]">Search</button>
      </form>
      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto" role="tablist" aria-label="Categories">
        <Tab href="/books" active={!cat} color="#1C1424">All</Tab>
        {cats.map(([key, c]) => (
          <Tab key={key} href={`/books?cat=${key}`} active={cat === key} color={c.color}>{c.label}</Tab>
        ))}
      </div>
      <div className="mt-8">
        {products.length ? (
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} covers={p.type === "bundle" ? bundleCovers(p) : []} />)}
          </div>
        ) : (
          <div className="card p-10 text-center">
            <p className="font-display text-[20px] font-bold text-cream">No ebooks match that search</p>
            <Link href="/books" className="btn-ghost mt-5">Show all ebooks</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Tab({ href, active, color, children }: { href: string; active: boolean; color: string; children: React.ReactNode }) {
  return (
    <Link href={href} role="tab" aria-selected={active}
      className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-5 text-[14px] font-bold transition ${active ? "text-night" : "border border-ink/10 text-cream-2 hover:bg-ink/5"}`}
      style={active ? { background: color } : undefined}>
      {!active && <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: color }} />}
      {children}
    </Link>
  );
}
