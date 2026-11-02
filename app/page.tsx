import Link from "next/link";
import { getProducts, getLibrary, getUser, bundleCovers, findProduct, getPlans } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";
import { BookCover } from "@/components/BookCover";
import { Icon } from "@/components/Icon";
import { accessLabel, CATEGORY, rupees } from "@/lib/format";
import type { Product } from "@/lib/types";
import { HeroSearch, type SearchItem } from "@/components/HeroSearch";

export const dynamic = "force-dynamic";

const PATHS = [
  { slug: "manufacturing-50", icon: "factory", q: "I have ₹10 lakh+ and want to build a factory" },
  { slug: "legal-business-andha-paisa", icon: "coins", q: "I want to start small, with little money" },
  { slug: "contractor-bano", icon: "hammer", q: "I'm an engineer and want my own contracting firm" },
  { slug: "krishi-kachra-se-kamaai", icon: "leaf", q: "I live near farms and want to earn from agriculture" },
  { slug: "pmegp-step-by-step", icon: "bank", q: "I need a business loan with a government subsidy" },
  { slug: "idea-test-karo", icon: "bulb", q: "I have an idea, but I'm not sure people will buy" },
];

// Real pages from the books (public/samples), shown as a preview of what is inside
const SAMPLES = [
  { img: "/samples/fly-ash-bricks-p32.jpg", slug: "fly-ash-bricks", label: "Cost of one brick and the right price" },
  { img: "/samples/pmegp-step-by-step-p15.jpg", slug: "pmegp-step-by-step", label: "Your PMEGP subsidy, worked out" },
  { img: "/samples/government-tenders-p34.jpg", slug: "government-tenders", label: "Filling a tender rate, item by item" },
  { img: "/samples/food-processing-40-p18.jpg", slug: "food-processing-40", label: "Full working for 6 food businesses" },
  { img: "/samples/solar-business-p46.jpg", slug: "solar-business", label: "A 50 kW solar quote with margin" },
  { img: "/samples/save-peoples-time-p39.jpg", slug: "problem-solve-karo-paisa-kamao", label: "Break-even and a 3-year plan" },
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
  // Count every readable title, including books sold only inside a series
  const titles = allAccess ? allAccess.bundle_items.map((s) => findProduct(s)).filter((p): p is NonNullable<typeof p> => Boolean(p)) : books;
  const totalPages = titles.reduce((n, b) => n + (b.pages ?? 0), 0);
  const series = products.find((p) => p.slug === "problem-solve-karo-paisa-kamao");
  // Every bundle except the All Access pass, which has its own banner
  const packs = products.filter((p) => p.type === "bundle" && !p.access_days).slice(0, 12);
  const searchItems = buildSearch(products, series ?? null);
  const passPrice = allAccess ? rupees(getPlans(allAccess)[0].price) : "";
  const hero = ["manufacturing-50", "contractor-bano", "fly-ash-bricks"].map((s) => findProduct(s)?.gallery[0]).filter(Boolean) as string[];
  const cats = Object.entries(CATEGORY)
    .filter(([k]) => k !== "bundle")
    .map(([k, c]) => ({ key: k, ...c, count: titles.filter((t) => t.category === k && t.is_published).length }))
    .filter((c) => c.count > 0);
  const stats: [string, string][] = [[String(titles.length), "Ebooks"], ["500+", "Business ideas"], [`${(Math.floor(totalPages / 100) * 100).toLocaleString("en-IN")}+`, "Pages"], ["12", "Excel tools"], ["2", "Languages"]];

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(60%_60%_at_78%_20%,rgba(255,106,61,0.16),transparent_70%),radial-gradient(40%_50%_at_10%_0%,rgba(255,255,255,0.9),transparent_70%)]" />
        <div className="container-x relative grid items-center gap-10 pb-10 pt-8 lg:grid-cols-[1.08fr_1fr] lg:gap-6 lg:pb-16 lg:pt-14">
          <div className="flex flex-col items-start gap-6">
            <Link href="/books" className="inline-flex items-center gap-2 rounded-full bg-night-2 py-1.5 pl-1.5 pr-4 text-[13px] font-medium text-cream shadow-card transition hover:shadow-lift">
              <span className="tag-new">New</span> Livestock, recycling and home-building guides <Icon name="chevron" size={15} className="text-fog" />
            </Link>
            <h1 className="font-display text-[40px] font-extrabold leading-[1.02] text-cream min-[400px]:text-[46px] sm:text-[60px] lg:text-[68px]">
              Find the business you can start.<br />
              <span className="text-gradient">Then build it right.</span>
            </h1>
            <p className="max-w-xl text-[17px] leading-relaxed text-cream-2 sm:text-[18px]">
              {titles.length} ebooks and 500+ business ideas in Hindi and English — with the investment, licences, loans and 5-year numbers behind every idea.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/books" className="btn-primary h-14 w-full px-8 text-[16px] sm:w-auto">Browse all ebooks <Icon name="arrow" size={18} strokeWidth={2.2} /></Link>
              {allAccess && <Link href="/book/all-access" className="btn-ghost h-14 w-full px-7 text-[16px] sm:w-auto">All Access · {passPrice}</Link>}
            </div>
            <ul className="grid gap-2.5 text-[14.5px] font-medium text-cream-2">
              {["Project reports with Excel tools", "Real Indian numbers, not theory", "Read on any phone — no app needed"].map((x) => (
                <li key={x} className="flex items-center gap-2.5"><Icon name="check" size={17} strokeWidth={2.6} className="text-[#E8451A]" />{x}</li>
              ))}
            </ul>
            <div className="w-full pt-1"><HeroSearch items={searchItems} /></div>
          </div>

          {/* Right: floating books and fact cards */}
          <div className="relative mx-auto h-[360px] w-full max-w-[540px] sm:h-[480px]" aria-hidden="true">
            <div className="absolute inset-x-[8%] bottom-[6%] top-[14%] rounded-[36px] bg-gradient-to-br from-white to-night-4 shadow-card ring-1 ring-ink/[0.04]" />
            {hero[1] && /* eslint-disable-next-line @next/next/no-img-element */ <img src={hero[1]} alt="" className="absolute bottom-[8%] left-[-2%] w-[40%] -rotate-6 drop-shadow-[0_24px_30px_rgba(15,15,17,0.28)]" />}
            {hero[2] && /* eslint-disable-next-line @next/next/no-img-element */ <img src={hero[2]} alt="" className="absolute bottom-[10%] right-[-2%] w-[40%] rotate-6 drop-shadow-[0_24px_30px_rgba(15,15,17,0.28)]" />}
            {hero[0] && /* eslint-disable-next-line @next/next/no-img-element */ <img src={hero[0]} alt="" className="absolute bottom-[12%] left-1/2 z-10 w-[52%] -translate-x-1/2 drop-shadow-[0_30px_40px_rgba(15,15,17,0.35)]" />}
            <div className="absolute left-0 top-[4%] z-20 flex items-center gap-3 rounded-2xl bg-night-2 p-3 pr-5 shadow-lift sm:left-[-4%]">
              <span className="icon-tile h-10 w-10"><Icon name="layers" size={19} strokeWidth={2} /></span>
              <span><span className="block text-[13px] font-bold text-cream">Project report included</span><span className="block text-[11.5px] text-fog">5-year P&amp;L · loan &amp; DSCR</span></span>
            </div>
            <div className="absolute right-0 top-[18%] z-20 flex items-center gap-3 rounded-2xl bg-night-2 p-3 pr-5 shadow-lift sm:right-[-3%]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron-500 font-display text-[13px] font-bold text-white">35%</span>
              <span><span className="block text-[13px] font-bold text-cream">Subsidy explained</span><span className="block text-[11.5px] text-fog">PMEGP, step by step</span></span>
            </div>
            <div className="absolute bottom-[1%] right-[6%] z-20 flex items-center gap-2 rounded-full bg-night-2 py-2 pl-2 pr-4 shadow-lift">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1FA855] text-white"><Icon name="globe" size={14} strokeWidth={2.2} /></span>
              <span className="text-[12.5px] font-semibold text-cream">Hindi + English</span>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="container-x">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[24px] bg-ink/[0.06] shadow-card sm:grid-cols-5">
          {stats.map(([v, k], i) => (
            <div key={k} className={`bg-night-2 px-5 py-5 text-center ${i === stats.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}>
              <dd className="font-display text-[30px] font-extrabold leading-none text-cream sm:text-[34px]">{v}</dd>
              <dt className="mt-1.5 text-[12.5px] font-medium text-fog">{k}</dt>
            </div>
          ))}
        </dl>
      </section>

      {reading && (
        <section className="container-x pt-8">
          <Link href={`/read/${reading.product.slug}`} className="card flex items-center gap-4 p-4 transition hover:shadow-lift">
            <BookCover product={reading.product} size="sm" />
            <div className="flex flex-1 flex-col gap-1">
              <span className="eyebrow">Continue reading</span>
              <span className="font-semibold text-cream">{reading.product.title}</span>
            </div>
            <Icon name="chevron" className="text-fog" />
          </Link>
        </section>
      )}

      {/* All Access banner */}
      {allAccess && (
        <section className="container-x pt-8">
          <Link href="/book/all-access" className="on-navy group relative flex flex-col items-start gap-5 overflow-hidden rounded-[28px] bg-night p-7 shadow-lift sm:flex-row sm:items-center sm:justify-between sm:p-9">
            <div aria-hidden="true" className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#FF4F1F]/30 blur-3xl" />
            <span className="relative">
              <span className="eyebrow !text-[#FF8A5E]">All Access Pass · {accessLabel(getPlans(allAccess)[0].access_days)}</span>
              <span className="mt-3 block font-display text-[28px] font-extrabold leading-[1.05] text-cream sm:text-[38px]">All {titles.length} ebooks, one pass — <span className="text-gradient">{passPrice}</span></span>
              <span className="mt-2 block text-[15px] text-cream-2">Hindi + English · 500+ business ideas · 12 Excel tools · new books included</span>
            </span>
            <span className="btn-primary relative h-14 shrink-0 px-8 text-[16px]">Get the pass <Icon name="arrow" size={18} strokeWidth={2.2} className="transition group-hover:translate-x-1" /></span>
          </Link>
        </section>
      )}

      {/* Bestsellers: single books only */}
      <section className="container-x pt-16">
        <SectionTitle eyebrow="Most loved" title="Bestselling ebooks" href="/books" linkText="All ebooks" />
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
          {books.slice(0, 8).map((p, i) => (
            <ProductCard key={p.id} product={p} rank={i + 1} />
          ))}
        </div>
      </section>

      {/* Themed bundles */}
      {packs.length > 0 && (
        <section className="container-x pt-16">
          <SectionTitle eyebrow="Buy together, save more" title="Bundles by topic — every book in one line" href="/books?cat=bundle" linkText="All bundles" />
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
            {packs.map((p) => (
              <ProductCard key={p.id} product={p} covers={bundleCovers(p)} />
            ))}
          </div>
        </section>
      )}

      {/* "You are lucky": the decision is the visitor's */}
      <section className="on-navy relative mt-16 overflow-hidden bg-night">
        <div aria-hidden="true" className="absolute left-1/2 top-0 h-64 w-[700px] -translate-x-1/2 rounded-full bg-[#FF4F1F]/20 blur-[100px]" />
        <div className="container-x relative flex flex-col items-center gap-5 py-16 text-center">
          <span className="chip !bg-white/10 !text-white !shadow-none">One minute before you scroll</span>
          <h2 className="max-w-3xl font-display text-[34px] font-extrabold leading-[1.05] sm:text-[48px]">
            You&apos;re <span className="serif-accent text-gradient text-[1.1em]">lucky</span> — because you want to build a business.
          </h2>
          <p className="max-w-2xl text-[17px] leading-relaxed text-cream-2 md:text-[19px]">
            Most people spend their whole lives only thinking about it. In front of you: {titles.length} ebooks, 500+ business ideas and a step-by-step roadmap for each — what it costs, where to start and how to grow.
          </p>
          <p className="max-w-2xl text-[15px] italic text-fog">
            If you don&apos;t want to build a business, you can leave without buying anything. The decision is yours.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link href="/books" className="btn-primary h-14 px-8 text-[16px]">Yes, I want to start a business <Icon name="arrow" size={18} strokeWidth={2.2} /></Link>
            {allAccess && <Link href="/book/all-access" className="btn-ghost h-14 px-7 text-[16px]">All ebooks · {passPrice}</Link>}
          </div>
        </div>
      </section>

      {/* Start is easy, growth is the real work */}
      <section className="container-x pt-16">
        <SectionTitle eyebrow="Starting is easy. Growing is the real work." title="Everyone starts a business. We teach you to grow it." />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["search", "Pick the right idea", "Matched to your budget — what it costs and what it can earn, before you begin."],
            ["tag", "Get your first customers", "Where the first 10, then the first 100 customers come from."],
            ["layers", "Take it to the next level", "Team, systems, a second branch, a new city — from a small shop to a bigger brand."],
            ["coins", "Maximise your profit", "Right pricing, lower costs, repeat customers, loans and subsidies."],
          ].map(([icon, t, d], i) => (
            <li key={t} className="card relative overflow-hidden p-6">
              <span aria-hidden="true" className="absolute right-5 top-3 select-none font-display text-[64px] font-extrabold leading-none text-[#FF4F1F] [text-shadow:2px_2px_0_#B8330F,4px_4px_0_rgba(15,15,17,0.12)]">{i + 1}</span>
              <span className="icon-tile"><Icon name={icon} size={20} strokeWidth={2} /></span>
              <p className="mt-5 font-display text-[21px] font-bold leading-tight text-cream">{t}</p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-fog">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 flex items-center gap-3 text-[15px] text-cream-2"><span className="hairline" />Every book covers the whole road — from starting to growing — with real numbers.</p>
      </section>

      {/* Browse by category */}
      <section className="container-x pt-16">
        <SectionTitle eyebrow="Choose your line" title="A book for every kind of business" href="/books" linkText="All ebooks" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {cats.map((c) => (
            <Link key={c.key} href={`/books?cat=${c.key}`} className="card group flex flex-col gap-1 p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
              <span className="font-display text-[18px] font-bold leading-snug text-cream">{c.label}</span>
              <span className="text-[13px] leading-snug text-fog">{c.blurb}</span>
              <span className="mt-3 text-[13px] font-semibold text-[#E8451A]">{c.count} {c.count === 1 ? "ebook" : "ebooks"} →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* The 135-idea series */}
      {series && <SeriesBand series={series} />}

      {/* Pick your path */}
      <section className="container-x py-16">
        <SectionTitle eyebrow="Not sure where to start?" title="Pick the line that sounds like you" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PATHS.map((p) => {
            const b = findProduct(p.slug);
            if (!b?.is_published) return null;
            return (
              <Link key={p.slug} href={`/book/${b.slug}`} className="card group relative overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-lift">
                <div aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#FF4F1F] opacity-10 blur-3xl transition group-hover:opacity-25" />
                <span className="icon-tile relative h-12 w-12"><Icon name={p.icon} size={22} strokeWidth={2} /></span>
                <p className="relative mt-5 font-display text-[21px] font-bold leading-snug text-cream">&ldquo;{p.q}&rdquo;</p>
                <p className="relative mt-4 text-[14px] text-fog">Read <b className="font-semibold text-cream">{b.title}</b></p>
                <p className="relative mt-4 flex items-center gap-2 text-[14px] font-semibold text-[#E8451A]">
                  {rupees(b.price)} <Icon name="arrow" size={16} strokeWidth={2.2} className="transition group-hover:translate-x-1" />
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* A look inside */}
      <section className="py-4">
        <div className="container-x">
          <SectionTitle eyebrow="A look inside" title="Not theory — real workings, real numbers" />
        </div>
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-6 sm:scroll-px-[max(1.5rem,calc((100vw_-_72rem)/2_+_1.5rem))] sm:px-[max(1.5rem,calc((100vw_-_72rem)/2_+_1.5rem))]">
          {SAMPLES.map((p) => (
            <Link key={p.img} href={`/book/${p.slug}`} className="group w-[220px] shrink-0 snap-start sm:w-[250px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt={`Sample page: ${p.label}`} loading="lazy" className="aspect-[420/595] w-full rounded-xl bg-white object-cover shadow-card transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lift" />
              <p className="mt-3 text-[14px] font-semibold leading-snug text-cream">{p.label}</p>
            </Link>
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
              <span className="font-display text-[48px] font-extrabold leading-none text-[#FF4F1F] [text-shadow:2px_2px_0_#B8330F]">{i + 1}</span>
              <div>
                <p className="font-display text-[20px] font-bold text-cream">{t}</p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-fog">{d}</p>
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
              <span className="icon-tile"><Icon name={w.icon} size={20} strokeWidth={2} /></span>
              <p className="mt-4 font-display text-[19px] font-bold text-cream">{w.title}</p>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-fog">{w.text}</p>
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
        <div className="on-navy relative overflow-hidden rounded-[32px] bg-night p-8 md:p-14">
          <div aria-hidden="true" className="absolute -right-20 -top-28 h-96 w-96 rounded-full bg-[#FF4F1F]/35 blur-3xl" />
          <h2 className="relative max-w-2xl font-display text-[36px] font-extrabold leading-[1.02] md:text-[56px]">One book today. <span className="serif-accent text-gradient text-[1.08em]">Your own business</span> tomorrow.</h2>
          <p className="relative mt-4 max-w-xl text-[16px] text-cream-2">Luck favours the people who start. Hindi and English, on any phone, for good.</p>
          <Link href="/books" className="btn-primary relative mt-8 h-14 px-8 text-[16px]">See all ebooks <Icon name="arrow" size={18} strokeWidth={2.2} /></Link>
        </div>
      </section>
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
            <span className="absolute right-5 top-5 rounded-full bg-[#FF4F1F] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Most popular</span>
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

/** Everything the hero search can find: published books and bundles, plus books sold only inside the series. */
function buildSearch(products: Product[], series: Product | null): SearchItem[] {
  const item = (p: Product, href: string, price: string, note: string): SearchItem => ({
    href, title: p.title, note, price, cover: p.cover_url,
    text: `${p.title} ${p.subtitle ?? ""} ${p.description ?? ""} ${CATEGORY[p.category]?.label ?? ""}`.toLowerCase(),
  });
  const list = products.map((p) => item(p, `/book/${p.slug}`, rupees(p.price), p.subtitle ?? CATEGORY[p.category]?.label ?? ""));
  if (series) {
    for (const s of series.bundle_items) {
      const b = findProduct(s);
      if (b && !b.is_published) list.push(item(b, `/book/${series.slug}`, `Series ${rupees(series.price)}`, b.subtitle ?? series.title));
    }
  }
  return list;
}

function SeriesBand({ series }: { series: Product }) {
  const covers = series.bundle_items.slice(0, 5).map((s) => findProduct(s)?.gallery[0]).filter(Boolean) as string[];
  return (
    <section className="on-navy relative mt-16 overflow-hidden bg-night">
      <div aria-hidden="true" className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[#FF4F1F]/20 blur-3xl" />
      <div className="container-x relative grid items-center gap-10 py-16 lg:grid-cols-2">
        <div className="relative mx-auto h-[260px] w-full max-w-[520px] sm:h-[320px]">
          {covers.map((c, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={c} src={c} alt="" className="absolute top-0 w-[38%] drop-shadow-2xl"
              style={{ left: `${i * 15.5}%`, transform: `translateY(${Math.abs(i - 2) * 14}px)`, zIndex: 10 - Math.abs(i - 2) }} />
          ))}
        </div>
        <div className="flex flex-col items-start gap-5">
          <span className="chip !bg-white/10 !text-white !shadow-none">Full series · {series.bundle_items.length} books</span>
          <h2 className="font-display text-[34px] font-extrabold leading-[1.04] md:text-[46px]">
            <span className="text-gradient">Small problems, big businesses.</span><br />Solve people&apos;s problems, build a business.
          </h2>
          <p className="text-[17px] leading-relaxed text-cream-2">
            Every book takes one big problem — time, money, health, education, power, waste, transport — and shows how to turn it into a business: 5 small ideas, 4 big ideas, full costs and a 90-day plan.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href={`/book/${series.slug}`} className="btn-primary h-14 px-8 text-[16px]">See the full series <Icon name="arrow" size={18} strokeWidth={2.2} /></Link>
            <span className="text-[15px] text-fog"><b className="font-display text-[26px] text-cream">{rupees(series.price)}</b>{series.mrp ? <s className="ml-2">{rupees(series.mrp)}</s> : null}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
