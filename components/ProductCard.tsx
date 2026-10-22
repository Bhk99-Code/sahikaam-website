import Link from "next/link";
import type { Product } from "@/lib/types";
import { CATEGORY, percentOff, rupees } from "@/lib/format";
import { BookCover } from "./BookCover";

export function ProductCard({ product, covers = [], rank }: { product: Product; covers?: string[]; rank?: number }) {
  const off = percentOff(product.price, product.mrp);
  const langs = product.editions.map((e) => e.label + (e.coming_soon ? " (soon)" : ""));
  return (
    <Link href={`/book/${product.slug}`}
      className="group relative flex flex-col gap-4 rounded-card border border-ink/[0.08] bg-night-2 p-4 transition hover:-translate-y-1 hover:border-ink/20">
      {rank && (
        <span className="absolute left-3 top-3 z-20 flex h-8 min-w-8 items-center justify-center rounded-full bg-cream px-2 font-display text-[14px] font-extrabold text-night">#{rank}</span>
      )}
      {off > 0 && <span className="absolute right-3 top-3 z-20 rounded-full bg-rosy px-2.5 py-1 text-[11px] font-extrabold text-white">{off}% OFF</span>}
      <div className="flex justify-center px-6 pt-4"><BookCover product={product} covers={covers} /></div>
      <div className="flex flex-1 flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: product.accent }}>{CATEGORY[product.category]?.label ?? "Ebook"}</span>
        <span className="line-clamp-2 font-display text-[17px] font-bold leading-snug text-cream">{product.title}</span>
        {langs.length > 0 && <span className="text-[12px] text-fog">{langs.join(" · ")}</span>}
        <span className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-[18px] font-extrabold text-cream">{rupees(product.price)}</span>
          {off > 0 && <span className="text-[13px] text-fog-2 line-through">{rupees(product.mrp!)}</span>}
        </span>
      </div>
    </Link>
  );
}
