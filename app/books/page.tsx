import Link from "next/link";
import type { Metadata } from "next";
import { getProducts } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "All Ebooks & Courses" };

const FILTERS = [
  { key: "", label: "All" },
  { key: "ebook", label: "Ebooks" },
  { key: "course", label: "Courses" },
  { key: "bundle", label: "Bundles" },
  { key: "free", label: "Free" },
];

export default async function Books({ searchParams }: { searchParams: { type?: string; q?: string } }) {
  const type = searchParams.type ?? "";
  const q = (searchParams.q ?? "").trim().toLowerCase();
  let products = await getProducts();
  if (type === "free") products = products.filter((p) => p.price === 0);
  else if (type) products = products.filter((p) => p.type === type);
  if (q) products = products.filter((p) => `${p.title} ${p.subtitle ?? ""}`.toLowerCase().includes(q));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-10">
      <h1 className="text-[26px] font-extrabold tracking-tight md:text-[34px]">Ebooks &amp; Courses</h1>
      <form action="/books" className="mt-4 flex gap-2">
        {type && <input type="hidden" name="type" value={type} />}
        <label htmlFor="q" className="sr-only">Search</label>
        <input id="q" name="q" defaultValue={q} placeholder="Book ya topic search karein…"
          className="h-12 min-w-0 flex-1 rounded-[14px] border border-line bg-white px-4 text-[15px] outline-none focus:border-brand-500" />
        <button className="h-12 rounded-[14px] bg-ink px-5 font-bold text-white">Search</button>
      </form>
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto" role="tablist">
        {FILTERS.map((f) => (
          <Link key={f.key} href={f.key ? `/books?type=${f.key}` : "/books"} role="tab" aria-selected={type === f.key}
            className={`flex h-10 shrink-0 items-center rounded-full px-5 text-[14px] ${type === f.key ? "bg-brand-500 font-bold text-white" : "border border-line bg-white font-medium text-ink-2"}`}>
            {f.label}
          </Link>
        ))}
      </div>
      <div className="mt-6">
        {products.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="rounded-card border border-line bg-white p-8 text-center text-ink-4">Is category mein abhi kuch nahi hai.</p>
        )}
      </div>
    </div>
  );
}
