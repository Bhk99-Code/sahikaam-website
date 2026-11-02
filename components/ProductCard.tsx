import Link from "next/link";
import type { Product } from "@/lib/types";
import { CATEGORY, percentOff, rupees } from "@/lib/format";
import { BookCover } from "./BookCover";
import { Icon } from "./Icon";

export function ProductCard({ product, covers = [], rank }: { product: Product; covers?: string[]; rank?: number }) {
  const off = percentOff(product.price, product.mrp);
  const langs = product.editions.map((e) => e.label + (e.coming_soon ? " (soon)" : ""));
  return (
    <Link href={`/book/${product.slug}`}
      className="group relative flex flex-col gap-3 rounded-card bg-night-2 p-3 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      {rank && (
        <span className="absolute left-5 top-5 z-20 flex h-7 min-w-7 items-center justify-center rounded-full bg-saffron-500 px-2 font-display text-[12px] font-bold text-white">#{rank}</span>
      )}
      {off > 0 && <span className="absolute right-5 top-5 z-20 rounded-full bg-[#FF4F1F] px-2.5 py-1 text-[11px] font-bold text-white">{off}% off</span>}
      <div className="relative flex justify-center overflow-hidden rounded-[18px] bg-gradient-to-b from-night-3 to-night-4 px-8 pb-5 pt-9">
        <div aria-hidden="true" className="absolute inset-x-6 bottom-0 h-1/2 rounded-full bg-[#FF4F1F]/10 blur-2xl" />
        <div className="relative w-full"><BookCover product={product} covers={covers} /></div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-2 pb-2">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#E8451A]">{CATEGORY[product.category]?.label ?? "Ebook"}</span>
        <span className="line-clamp-2 font-display text-[18px] font-bold leading-[1.2] text-cream">{product.title}</span>
        {langs.length > 0 && <span className="text-[12px] text-fog">{langs.join(" · ")}</span>}
        <span className="mt-auto flex items-center gap-2 pt-3">
          <span className="font-display text-[20px] font-bold text-cream">{rupees(product.price)}</span>
          {off > 0 && <span className="text-[13px] text-fog-2 line-through">{rupees(product.mrp!)}</span>}
          <span aria-hidden="true" className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-night-4 text-cream transition group-hover:bg-[#FF4F1F] group-hover:text-white"><Icon name="arrow" size={15} strokeWidth={2.2} /></span>
        </span>
      </div>
    </Link>
  );
}
