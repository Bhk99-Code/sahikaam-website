import Link from "next/link";
import type { Product } from "@/lib/types";
import { rupees, TYPE_LABEL } from "@/lib/format";
import { BookCover } from "./BookCover";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/book/${product.slug}`}
      className="group flex flex-col gap-3 rounded-card border border-line bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-card">
      <BookCover product={product} />
      <div className="flex flex-col gap-1 px-1 pb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-5">{TYPE_LABEL[product.type]}</span>
        <span className="line-clamp-2 text-[14px] font-semibold leading-snug text-ink">{product.title}</span>
        <span className="flex items-baseline gap-2">
          <span className="text-[16px] font-extrabold text-ink">{rupees(product.price)}</span>
          {product.mrp && product.mrp > product.price && <span className="text-[12px] text-ink-5 line-through">{rupees(product.mrp)}</span>}
        </span>
      </div>
    </Link>
  );
}
