import Link from "next/link";
import { getProducts, getLibrary, getUser } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";
import { BookCover } from "@/components/BookCover";
import { Icon } from "@/components/Icon";
import { rupees } from "@/lib/format";

export const dynamic = "force-dynamic";

const CHIPS = [
  { label: "All", href: "/books", icon: "home" },
  { label: "Ebooks", href: "/books?type=ebook", icon: "book" },
  { label: "Courses", href: "/books?type=course", icon: "video" },
  { label: "Bundles", href: "/books?type=bundle", icon: "bundle" },
  { label: "Free", href: "/books?type=free", icon: "gift" },
];

const TILES = [
  { href: "/books?type=ebook", bg: "#C2410C", icon: "book", label: "Ebooks" },
  { href: "/books?type=course", bg: "#1E3A5F", icon: "video", label: "Video Courses" },
  { href: "/books?type=bundle", bg: "#5B2245", icon: "bundle", label: "Bundles" },
];

/** Hide a category chip when no product falls into it. */
function hasType(products: { type: string; price: number }[], href: string) {
  const t = new URL(href, "http://x").searchParams.get("type");
  if (!t) return true;
  return t === "free" ? products.some((p) => p.price === 0) : products.some((p) => p.type === t);
}

export default async function Home() {
  const [products, user] = await Promise.all([getProducts(), getUser()]);
  const library = user ? await getLibrary(user.id) : [];
  const hero = products[0];
  const reading = library.find((l) => l.product.type === "ebook");

  return (
    <div>
      {/* Category chips — Airtel style */}
      <div className="border-b border-line bg-white">
        <nav aria-label="Categories" className="no-scrollbar mx-auto flex max-w-6xl gap-3 overflow-x-auto px-4 pb-3 pt-4 sm:px-6">
          {CHIPS.filter((c) => hasType(products, c.href)).map((c, i) => (
            <Link key={c.label} href={c.href} className="flex min-w-[72px] flex-col items-center gap-2">
              <span className={`flex h-[62px] w-[62px] items-center justify-center rounded-[18px] ${i === 0 ? "bg-brand-500 text-white" : "bg-[#F1F2F5] text-ink-2"}`}>
                <Icon name={c.icon} size={26} />
              </span>
              <span className={`text-[13px] ${i === 0 ? "font-bold text-ink" : "font-medium text-ink-3"}`}>{c.label}</span>
              <span className={`h-[3px] w-7 rounded ${i === 0 ? "bg-brand-500" : "bg-transparent"}`} />
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-6 sm:px-6 md:py-10">
        {/* Hero */}
        {hero && (
          <section className="grid items-center gap-6 rounded-[24px] border border-line bg-white p-6 shadow-card md:grid-cols-[1fr_auto] md:p-10">
            <div className="flex flex-col gap-4">
              {hero.badge && <span className="self-start rounded-lg bg-brand-600 px-2.5 py-1 text-[12px] font-bold text-white">{hero.badge}</span>}
              <h1 className="text-[28px] font-extrabold leading-tight tracking-tight md:text-[42px]">{hero.title}</h1>
              {hero.subtitle && <p className="max-w-xl text-[16px] leading-relaxed text-ink-4 md:text-[18px]">{hero.subtitle}</p>}
              <div className="flex items-baseline gap-3">
                <span className="text-[26px] font-extrabold">{rupees(hero.price)}</span>
                {hero.mrp && hero.mrp > hero.price && <span className="text-ink-5 line-through">{rupees(hero.mrp)}</span>}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/book/${hero.slug}`} className="flex h-[52px] items-center rounded-[14px] bg-ink px-8 text-[16px] font-bold text-white hover:bg-black">
                  Abhi Kharidein
                </Link>
                <Link href={`/book/${hero.slug}#inside`} className="flex h-[52px] items-center rounded-[14px] border border-line px-6 text-[16px] font-semibold text-ink hover:bg-mist">
                  Andar kya hai?
                </Link>
              </div>
            </div>
            <div className="hidden justify-center rounded-[20px] bg-brand-50 p-10 md:flex">
              <BookCover product={hero} size="lg" />
            </div>
          </section>
        )}

        {/* Continue reading */}
        {reading && (
          <section>
            <SectionTitle>Continue Reading</SectionTitle>
            <Link href={`/read/${reading.product.slug}`} className="flex items-center gap-4 rounded-card border border-line bg-white p-4 hover:shadow-card">
              <BookCover product={reading.product} size="sm" />
              <div className="flex flex-1 flex-col gap-1.5">
                <span className="font-bold">{reading.product.title}</span>
                <span className="text-[13px] text-ink-5">{reading.progress ? `Page ${reading.progress} se aage padhein` : "Padhna shuru karein"}</span>
              </div>
              <Icon name="chevron" />
            </Link>
          </section>
        )}

        {/* Explore tiles */}
        <section>
          <SectionTitle>Explore SahiKaam</SectionTitle>
          <div className="grid grid-cols-2 gap-3 md:gap-5">
            {TILES.filter((t) => hasType(products, t.href)).map((t) => <Tile key={t.href} {...t} />)}
          </div>
        </section>

        {/* Products */}
        <section>
          <SectionTitle href="/books">Popular Ebooks</SectionTitle>
          {products.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <p className="rounded-card border border-line bg-white p-6 text-ink-4">Jald hi naye books aa rahe hain.</p>
          )}
        </section>

        {/* Trust strip */}
        <section className="grid gap-3 md:grid-cols-3">
          <Trust icon="shield" title="100% secure payment" text="UPI, card, net banking — Razorpay se" />
          <Trust icon="library" title="Turant access" text="Payment hote hi book aapki Library mein" />
          <Trust icon="chat" title="Hindi mein support" text="WhatsApp aur email par madad" />
        </section>
      </div>
    </div>
  );
}

function Tile({ href, bg, icon, label }: { href: string; bg: string; icon: string; label: string }) {
  return (
    <Link href={href} className="flex h-[150px] flex-col justify-between rounded-card p-4 text-white transition hover:-translate-y-0.5 md:h-[180px] md:p-6" style={{ background: bg }}>
      <Icon name={icon} size={30} />
      <span className="text-[15px] font-bold leading-tight md:text-[18px]">{label} →</span>
    </Link>
  );
}

function Trust({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="flex items-center gap-4 rounded-card border border-line bg-white p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Icon name={icon} /></span>
      <div>
        <p className="text-[15px] font-bold">{title}</p>
        <p className="text-[13px] text-ink-5">{text}</p>
      </div>
    </div>
  );
}
