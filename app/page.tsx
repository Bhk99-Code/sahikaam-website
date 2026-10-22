import Link from "next/link";
import { getProducts, getLibrary, getUser, bundleCovers, findProduct, getPlans } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";
import { BookCover } from "@/components/BookCover";
import { Icon } from "@/components/Icon";
import { accessLabel, CATEGORY, percentOff, rupees } from "@/lib/format";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

const PATHS = [
  { slug: "manufacturing-50", icon: "factory", q: "I have ₹10 lakh+ and want to build a factory" },
  { slug: "legal-business-andha-paisa", icon: "coins", q: "I want to start small, with little money" },
  { slug: "contractor-bano", icon: "hammer", q: "I'm an engineer and want my own contracting firm" },
  { slug: "krishi-kachra-se-kamaai", icon: "leaf", q: "I live near farms and want to earn from agriculture" },
  { slug: "pmegp-step-by-step", icon: "bank", q: "I need a business loan with a government subsidy" },
  { slug: "idea-test-karo", icon: "bulb", q: "I have an idea, but I'm not sure people will buy" },
];

const WHY = [
  { icon: "coins", title: "Real Indian numbers", text: "Investment, margins, loan amounts and 5-year profit — in rupees, not theory." },
  { icon: "shield", title: "Permissions made clear", text: "Every idea lists the registrations and licences you need before you start." },
  { icon: "bolt", title: "Funding that works", text: "Bank loans and government subsidies explained step by step." },
  { icon: "globe", title: "Hindi and English", text: "Read in the language you think in. One purchase, every edition." },
];

const FAQS = [
  { q: "How do I get the ebook after paying?", a: "It appears in your library the moment the payment succeeds. Sign in on any phone or computer and start reading — no app needed." },
  { q: "Do I get both Hindi and English?", a: "Yes. Every purchase includes every language edition of that book that we publish, now and later." },
  { q: "Can I download the PDF?", a: "Books open in the SahiKaam reader in your browser. Single ebooks are yours for life; the All Access Pass runs for its plan period. Your reading position is always saved." },
  { q: "Which payment methods work?", a: "UPI, debit and credit cards, net banking and wallets — handled securely by Razorpay." },
  { q: "What if something goes wrong?", a: "Write to us on WhatsApp or email. If you were charged twice or the book does not open, we refund you — see the refund policy." },
];

export default async function Home() {
  const [products, user] = await Promise.all([getProducts(), getUser()]);
  const library = user ? await getLibrary(user.id) : [];
  const reading = library.find((l) => l.product.type === "ebook");
  const books = products.filter((p) => p.type === "ebook");
  const allAccess = products.find((p) => p.slug === "all-access");
  const covers = books.map((b) => b.cover_url).filter(Boolean) as string[];
  const totalPages = books.reduce((n, b) => n + (b.pages ?? 0), 0);

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-saffron-500/20 blur-[120px]" />
        <div className="container-x relative grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div className="flex flex-col items-start gap-6">
            <span className="chip"><Icon name="sparkle" size={14} className="text-sun" /> Now in Hindi + English</span>
            <h1 className="font-display text-[38px] font-extrabold leading-[1.02] tracking-tight min-[380px]:text-[42px] sm:text-[58px] lg:text-[62px] xl:text-[68px]">
              From <span className="text-gradient">₹10 lakh</span> to <span className="text-gradient">₹1,000 crore.</span><br />Step by step.
            </h1>
            <p className="max-w-xl text-[17px] leading-relaxed text-cream-2 md:text-[19px]">
              Practical business roadmaps for Indian founders, in Hindi and English — with the money, machinery, permissions and funding you need at every step.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/books" className="btn-primary h-14 px-8 text-[16px]">Browse ebooks <Icon name="arrow" size={18} strokeWidth={2.2} /></Link>
              {allAccess && <Link href="/book/all-access" className="btn-ghost h-14 px-7 text-[16px]">All Access · from {rupees(getPlans(allAccess)[0].price)}</Link>}
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-fog">
              <li className="flex items-center gap-2"><Icon name="check" size={16} className="text-mint" strokeWidth={2.4} /> {books.length} ebooks · {totalPages.toLocaleString("en-IN")}+ pages</li>
              <li className="flex items-center gap-2"><Icon name="check" size={16} className="text-mint" strokeWidth={2.4} /> Lifetime access on every ebook</li>
              <li className="flex items-center gap-2"><Icon name="check" size={16} className="text-mint" strokeWidth={2.4} /> UPI · cards · net banking</li>
            </ul>
          </div>
          <HeroStack books={books} />
        </div>
      </section>

      {reading && (
        <section className="container-x">
          <Link href={`/read/${reading.product.slug}`} className="card flex items-center gap-4 p-4 hover:border-ink/20">
            <BookCover product={reading.product} size="sm" />
            <div className="flex flex-1 flex-col gap-1">
              <span className="eyebrow">Continue reading</span>
              <span className="font-bold text-cream">{reading.product.title}</span>
            </div>
            <Icon name="chevron" className="text-fog" />
          </Link>
        </section>
      )}

      {/* Pick your path */}
      <section className="container-x py-14">
        <SectionTitle eyebrow="Not sure where to start?" title="Pick the line that sounds like you" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PATHS.map((p) => {
            const b = findProduct(p.slug);
            if (!b?.is_published) return null;
            const cat = CATEGORY[b.category];
            return (
              <Link key={p.slug} href={`/book/${b.slug}`}
                className="group relative overflow-hidden rounded-card border border-ink/[0.08] bg-night-2 p-6 transition hover:-translate-y-1"
                style={{ boxShadow: `inset 0 1px 0 ${cat.color}55` }}>
                <div aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-25 blur-3xl transition group-hover:opacity-40" style={{ background: cat.color }} />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${cat.color}22`, color: cat.color }}>
                  <Icon name={p.icon} size={24} strokeWidth={2} />
                </span>
                <p className="relative mt-5 font-display text-[20px] font-bold leading-snug text-cream">&ldquo;{p.q}&rdquo;</p>
                <p className="relative mt-4 text-[14px] text-fog">Read <b className="text-cream">{b.title}</b></p>
                <p className="relative mt-4 flex items-center gap-2 text-[14px] font-bold" style={{ color: cat.color }}>
                  {rupees(b.price)} <Icon name="arrow" size={16} strokeWidth={2.2} className="transition group-hover:translate-x-1" />
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="container-x py-6">
        <SectionTitle eyebrow="Readers' favourites" title="Bestselling ebooks" href="/books" />
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((p, i) => (
            <ProductCard key={p.id} product={p} covers={p.type === "bundle" ? bundleCovers(p) : []} rank={p.type === "ebook" ? i : undefined} />
          ))}
        </div>
      </section>

      {/* All Access plan */}
      {allAccess && books.length > 0 && <PlanSection allAccess={allAccess} cheapest={Math.min(...books.map((b) => b.price))} covers={covers} />}

      {/* How it works */}
      <section className="container-x py-14">
        <SectionTitle eyebrow="Simple" title="From payment to page one in 2 minutes" />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:[&>*:last-child]:col-span-2 lg:[&>*:last-child]:col-span-1">
          {[
            ["Choose your ebook", "Pick a single book or the All Access Pass."],
            ["Pay with UPI or card", "Secure checkout by Razorpay. Just your email — no long forms."],
            ["Start reading", "It's in your library instantly. Switch between Hindi and English anytime."],
          ].map(([t, d], i) => (
            <li key={t} className="card flex gap-4 p-6">
              <span className="font-display text-[44px] font-extrabold leading-none text-gradient">{i + 1}</span>
              <div>
                <p className="font-display text-[19px] font-bold text-cream">{t}</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-fog">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Why */}
      <section className="container-x py-6">
        <SectionTitle eyebrow="Why SahiKaam" title="Written for doers, not readers" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((w) => (
            <div key={w.title} className="card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-saffron-500/15 text-saffron-400"><Icon name={w.icon} strokeWidth={2} /></span>
              <p className="mt-4 font-display text-[18px] font-bold text-cream">{w.title}</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-fog">{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x max-w-3xl py-14">
        <SectionTitle eyebrow="Questions" title="Good to know" />
        <div className="card divide-y divide-ink/[0.07] overflow-hidden">
          {FAQS.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex min-h-[60px] cursor-pointer list-none items-center gap-3 px-5 py-4 text-[16px] font-semibold text-cream">
                <span className="flex-1">{f.q}</span>
                <Icon name="down" size={20} className="text-fog transition group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-5 text-[15px] leading-relaxed text-fog">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-x">
        <div className="relative overflow-hidden rounded-[28px] bg-brand-gradient p-8 text-night md:p-14">
          <h2 className="max-w-2xl font-display text-[32px] font-extrabold leading-tight md:text-[46px]">Your business plan starts with one good book.</h2>
          <p className="mt-3 max-w-xl text-[16px] font-medium opacity-80">Hindi and English. Read on any device. Yours for life.</p>
          <Link href="/books" className="btn mt-7 h-14 bg-night px-8 text-[16px] text-cream hover:bg-black">See all ebooks <Icon name="arrow" size={18} strokeWidth={2.2} /></Link>
        </div>
      </section>
    </div>
  );
}

function HeroStack({ books }: { books: Product[] }) {
  const pos = [
    "-left-[4%] top-[10%] w-[46%]",
    "left-[26%] -top-[2%] z-10 w-[52%]",
    "-right-[4%] top-[12%] w-[46%]",
  ];
  const lead = books[0];
  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-[460px] sm:max-w-[540px]">
      {books.slice(0, 3).map((b, i) => (
        <Link key={b.slug} href={`/book/${b.slug}`} className={`absolute transition hover:-translate-y-2 ${pos[i]}`} aria-label={b.title}>
          {b.gallery[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.gallery[0]} alt={`${b.title} — 3D book`} className="w-full drop-shadow-2xl" />
          ) : (
            <BookCover product={b} />
          )}
        </Link>
      ))}
      <div className="absolute bottom-[2%] left-[4%] z-20 flex items-center gap-3 rounded-2xl border border-ink/10 bg-night-3/90 px-4 py-3 shadow-lift backdrop-blur">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint/15 text-mint"><Icon name="globe" size={18} strokeWidth={2} /></span>
        <span className="text-[13px] leading-tight text-cream"><b>Hindi + English</b><br /><span className="text-fog">in every purchase</span></span>
      </div>
      {lead?.mrp && lead.mrp > lead.price && (
        <div className="absolute bottom-[14%] right-[3%] z-20 rounded-2xl bg-rosy px-4 py-2.5 text-white shadow-lift">
          <span className="block text-[11px] font-bold uppercase tracking-wider opacity-90">Launch price</span>
          <span className="font-display text-[20px] font-extrabold">{percentOff(lead.price, lead.mrp)}% off</span>
        </div>
      )}
    </div>
  );
}

function PlanSection({ allAccess, cheapest, covers }: { allAccess: Product; cheapest: number; covers: string[] }) {
  const save = (allAccess.mrp ?? 0) - allAccess.price;
  return (
    <section className="container-x py-14">
      <SectionTitle eyebrow="Best value" title={<>Get everything with <span className="text-gradient">All Access</span></>} />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <div className="card flex flex-col p-7">
          <p className="eyebrow">Single ebook</p>
          <p className="mt-3 font-display text-[36px] font-extrabold text-cream">from {rupees(cheapest)}</p>
          <ul className="mt-5 flex-1 space-y-3 text-[15px] text-cream-2">
            {["One ebook of your choice", "Every language edition we publish", "Lifetime access to that book"].map((t) => (
              <li key={t} className="flex gap-3"><Icon name="check" size={18} className="mt-0.5 shrink-0 text-mint" strokeWidth={2.4} />{t}</li>
            ))}
          </ul>
          <Link href="/books" className="btn-ghost mt-7 w-full">Choose a book</Link>
        </div>
        <div className="relative rounded-card bg-brand-gradient p-[1.5px]">
          <div className="relative flex h-full flex-col overflow-hidden rounded-[21px] bg-night-2 p-7">
            <span className="absolute right-5 top-5 rounded-full bg-sun px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-night">Most popular</span>
            <p className="eyebrow">All Access Pass</p>
            <p className="mt-3 flex items-baseline gap-3 font-display text-[44px] font-extrabold text-cream">
              {rupees(allAccess.price)}
              {allAccess.mrp && <span className="text-[18px] font-semibold text-fog-2 line-through">{rupees(allAccess.mrp)}</span>}
            </p>
            <p className="text-[14px] font-semibold text-cream-2">{accessLabel(allAccess.access_days)} · every book, every language{save > 0 && <span className="font-bold text-mint"> · save {rupees(save)}</span>}</p>
            {getPlans(allAccess).filter((p) => p.slug !== allAccess.slug).map((p) => (
              <p key={p.slug} className="mt-1 text-[14px] text-fog">or {accessLabel(p.access_days).replace(" access", "")} for <b className="text-cream">{rupees(p.price)}</b></p>
            ))}
            <div className="mt-5 grid flex-1 items-center gap-6 sm:grid-cols-[1fr_auto]">
              <ul className="space-y-3 text-[15px] text-cream-2">
                {allAccess.learn.map((t) => (
                  <li key={t} className="flex gap-3"><Icon name="check" size={18} className="mt-0.5 shrink-0 text-mint" strokeWidth={2.4} />{t}</li>
                ))}
              </ul>
              <div className="hidden sm:block"><BookCover product={allAccess} covers={covers} size="lg" /></div>
            </div>
            <Link href="/book/all-access" className="btn-primary mt-7 h-14 w-full text-[16px]">Choose your plan</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
