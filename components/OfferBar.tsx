import Link from "next/link";

/** Thin promo strip above the header. Shorter copy on small phones so it stays on one line. */
export function OfferBar() {
  return (
    <Link href="/book/all-access" className="block bg-brand-gradient px-4 py-2 text-center text-[13px] font-bold text-white">
      <span className="sm:hidden">All ebooks, Hindi + English · ₹5,999 →</span>
      <span className="hidden sm:inline">Launch offer: every ebook in Hindi &amp; English for ₹5,999 — save ₹2,998 <span aria-hidden="true">→</span></span>
    </Link>
  );
}
