import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getUser, ownsProduct } from "@/lib/data";
import { BookCover } from "@/components/BookCover";
import { Icon } from "@/components/Icon";
import { rupees, TYPE_LABEL } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProduct(params.slug);
  return p ? { title: p.title, description: p.subtitle ?? p.description ?? undefined } : {};
}

export default async function BookPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();
  const user = await getUser();
  const owned = user ? await ownsProduct(user.id, product.slug) : false;
  const openHref = product.type === "course" ? `/learn/${product.slug}` : `/read/${product.slug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-6 sm:px-6 md:pb-16 md:pt-10">
      <Link href="/books" className="mb-5 inline-flex items-center gap-1 text-[14px] font-semibold text-ink-3 hover:text-ink">
        <Icon name="back" size={18} /> Sab books
      </Link>
      <div className="grid gap-8 md:grid-cols-[380px_1fr]">
        <div className="md:sticky md:top-24 md:self-start">
          <div className="flex justify-center rounded-[24px] bg-brand-50 p-8">
            <BookCover product={product} size="lg" />
          </div>
          {/* Desktop buy box */}
          <div className="mt-4 hidden rounded-card border border-line bg-white p-5 md:block">
            <Price product={product} />
            <BuyButton owned={owned} slug={product.slug} openHref={openHref} free={product.price === 0} full />
            <SecureNote />
          </div>
        </div>

        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-3">
            {product.badge && <span className="self-start rounded-lg bg-brand-600 px-2.5 py-1 text-[12px] font-bold text-white">{product.badge}</span>}
            <h1 className="text-[26px] font-extrabold leading-tight tracking-tight md:text-[36px]">{product.title}</h1>
            {product.subtitle && <p className="text-[17px] text-ink-4">{product.subtitle}</p>}
            <p className="text-[14px] text-ink-5">
              by SahiKaam · {TYPE_LABEL[product.type]}{product.pages ? ` · ${product.pages} pages` : ""}{product.language ? ` · ${product.language}` : ""}
            </p>
          </div>

          {product.highlights.length > 0 && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {product.highlights.map((h) => (
                <div key={h.title + h.text} className="flex flex-col gap-1 rounded-2xl bg-white p-4 ring-1 ring-line">
                  <span className="text-[19px] font-extrabold">{h.title}</span>
                  <span className="text-[13px] text-ink-4">{h.text}</span>
                </div>
              ))}
            </div>
          )}

          {product.description && (
            <section>
              <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.18em] text-ink-3">About this {TYPE_LABEL[product.type].toLowerCase()}</h2>
              <p className="whitespace-pre-line text-[16px] leading-relaxed text-ink-2">{product.description}</p>
            </section>
          )}

          {(product.chapters.length > 0 || product.lessons.length > 0) && (
            <section id="inside" className="scroll-mt-24">
              <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.18em] text-ink-3">What&apos;s inside</h2>
              <ol className="overflow-hidden rounded-card border border-line bg-white">
                {(product.type === "course" ? product.lessons.map((l) => l.title) : product.chapters).map((t, i) => (
                  <li key={i} className="flex items-center gap-4 border-b border-[#EFEFF2] p-4 last:border-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[13px] font-extrabold text-brand-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[15px] font-semibold">{t}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <div className="md:hidden"><SecureNote /></div>
        </div>
      </div>

      {/* Mobile sticky buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-4 border-t border-line bg-white px-5 pb-6 pt-3 md:hidden">
        <div className="flex-1"><Price product={product} compact /></div>
        <BuyButton owned={owned} slug={product.slug} openHref={openHref} free={product.price === 0} />
      </div>
    </div>
  );
}

function Price({ product, compact }: { product: { price: number; mrp: number | null }; compact?: boolean }) {
  return (
    <div className={compact ? "" : "mb-4"}>
      <div className="flex items-baseline gap-2">
        <span className="text-[24px] font-extrabold">{rupees(product.price)}</span>
        {product.mrp && product.mrp > product.price && <span className="text-[14px] text-ink-5 line-through">{rupees(product.mrp)}</span>}
      </div>
      {product.price > 0 && <span className="text-[12px] text-ink-5">incl. all taxes</span>}
    </div>
  );
}

function BuyButton({ owned, slug, openHref, free, full }: { owned: boolean; slug: string; openHref: string; free: boolean; full?: boolean }) {
  const cls = `flex h-[54px] items-center justify-center rounded-full px-9 text-[17px] font-bold text-white ${full ? "w-full" : ""}`;
  if (owned) return <Link href={openHref} className={`${cls} bg-ink hover:bg-black`}>Padhna Shuru Karein</Link>;
  return (
    <Link href={`/checkout/${slug}`} className={`${cls} bg-brand-600 hover:bg-brand-700`}>
      {free ? "Free mein Paayein" : "Buy Now"}
    </Link>
  );
}

function SecureNote() {
  return (
    <p className="mt-4 flex items-start gap-3 rounded-2xl bg-mist p-4 text-[13px] leading-relaxed text-ink-3">
      <Icon name="shield" className="shrink-0 text-green-700" />
      Secure payment — UPI, card, net banking. Kharidte hi book aapki Library mein aa jayegi.
    </p>
  );
}
