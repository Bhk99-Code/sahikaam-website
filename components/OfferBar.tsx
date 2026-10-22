import Link from "next/link";
import { findProduct } from "@/lib/data";
import { accessLabel, rupees } from "@/lib/format";

/** Thin promo strip above the header. Shorter copy on small phones so it stays on one line. */
export function OfferBar() {
  const pass = findProduct("all-access");
  if (!pass?.is_published) return null;
  const books = pass.bundle_items.length;
  const save = (pass.mrp ?? 0) - pass.price;
  return (
    <Link href="/book/all-access" className="block bg-brand-gradient px-4 py-2 text-center text-[13px] font-bold text-white">
      <span className="sm:hidden">All {books} ebooks · {rupees(pass.price)} →</span>
      <span className="hidden sm:inline">
        All Access: all {books} ebooks in Hindi &amp; English for {rupees(pass.price)} ({accessLabel(pass.access_days).toLowerCase()}){save > 0 ? ` — save ${rupees(save)}` : ""} <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
