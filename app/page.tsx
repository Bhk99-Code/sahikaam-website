import Link from "next/link";
import { getProducts, getLibrary, getUser, bundleCovers, findProduct, getPlans } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";
import { BookCover } from "@/components/BookCover";
import { Icon } from "@/components/Icon";
import { accessLabel, CATEGORY, rupees } from "@/lib/format";
import type { Product } from "@/lib/types";
import { HeroSearch, type SearchItem } from "@/components/HeroSearch";
import { TopCarousel, type Slide } from "@/components/TopCarousel";

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
  const packs = products.filter((p) => p.type === "bundle" && !p.access_days).slice(0, 8);
  const searchItems = buildSearch(products, series ?? null);
  const slides = buildSlides(allAccess ?? null, series ?? null, titles.length);
  const cats = Object.entries(CATEGORY)
    .filter(([k]) => k !== "bundle")
    .map(([k, c]) => ({ key: k, ...c, count: titles.filter((t) => t.category === k && t.is_published).length }))
    .filter((c) => c.count > 0);

  return (
    <div className="overflow-x-hidden">
      {/* Featured slider: All Access first, then the strongest books */}
      <TopCarousel slides={slides} />

      {/* All Access: always visible right under the slider */}
      {allAccess && (
        <section className="container-x pt-8">
          <Link href="/book/all-access" className="on-navy group flex flex-col items-start gap-4 rounded-card bg-night p-6 shadow-lift sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <span>
              <span className="eyebrow text-saffron-300">All Access Pass · {accessLabel(getPlans(allAccess)[0].access_days)}</span>
              <span className="mt-2 block font-display text-[24px] font-extrabold leading-tight text-cream sm:text-[30px]">Saari {titles.length} books, ek pass mein — <span className="text-gradient">{rupees(getPlans(allAccess)[0].price)}</span></span>
              <span className="mt-1 block text-[15px] text-cream-2">Hindi + English · 500+ business ideas · 9 Excel tools · nayi books bhi free</span>
            </span>
            <span className="btn-primary h-14 shrink-0 px-8 text-[16px]">Pass lo <Icon name="arrow" size={18} strokeWidth={2.2} className="transition group-hover:translate-x-1" /></span>
          </Link>
        </section>
      )}

      {/* Bestsellers: single books only */}
      <section className="container-x pt-12">
        <SectionTitle eyebrow="Sabse zyada pasand ki gayi" title="Bestselling books" href="/books" linkText="Saari books" />
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
          {books.slice(0, 8).map((p, i) => (
            <ProductCard key={p.id} product={p} rank={i + 1} />
          ))}
        </div>
      </section>

      {/* Themed bundles */}
      {packs.length > 0 && (
        <section className="container-x pt-14">
          <SectionTitle eyebrow="Saath lo, zyada bachao" title="Topic wale bundles — ek line ki saari books" href="/books?cat=bundle" linkText="Saare bundles" />
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
            {packs.map((p) => (
              <ProductCard key={p.id} product={p} covers={bundleCovers(p)} />
            ))}
          </div>
        </section>
      )}

      {/* "You are lucky" — the decision is the visitor's */}
      <section className="on-navy mt-14 bg-night">
        <div className="container-x flex flex-col items-center gap-5 py-14 text-center">
          <span className="chip">Ek minute rukiye</span>
          <h2 className="max-w-3xl font-display text-[30px] font-extrabold leading-tight md:text-[44px]">
            Aap <span className="text-gradient">bhagyashali</span> hain — kyunki aap business karna chahte hain.
          </h2>
          <p className="max-w-2xl text-[17px] leading-relaxed text-cream-2 md:text-[19px]">
            Zyadatar log zindagi bhar sirf sochte reh jaate hain. Aapke saamne {titles.length} books, 500+ business ideas aur har ek ka step-by-step roadmap hai — kitna paisa lagega, kahan se shuru karein aur kaise badhayein.
          </p>
          <p className="max-w-2xl text-[15px] italic text-fog">
            Agar aap business nahi karna chahte, to bina kuch khareede — aur bina apna dhandha shuru kiye — yahan se ja sakte hain. Faisla aapka hai.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link href="/books" className="btn-primary h-14 px-8 text-[16px]">Haan, main business karna chahta hoon <Icon name="arrow" size={18} strokeWidth={2.2} /></Link>
            {allAccess && <Link href="/book/all-access" className="btn-ghost h-14 px-7 text-[16px]">Saari books · {rupees(getPlans(allAccess)[0].price)}</Link>}
          </div>
        </div>
      </section>

      {/* Headline, search and the numbers */}
      <section className="relative border-b border-ink/[0.07]">
        <div className="container-x flex flex-col items-center gap-6 py-12 text-center sm:py-16">
          <span className="chip"><Icon name="sparkle" size={14} className="text-sun" /> Hindi + English · har book mein dono</span>
          <h1 className="max-w-4xl font-display text-[30px] font-extrabold leading-[1.15] tracking-tight min-[380px]:text-[34px] sm:text-[44px] lg:text-[50px]">
            <span className="text-gradient">Andha paisa</span> kamane ke legal tareeke — dhoondh-dhoondh ke laaye hain.
          </h1>
          <p className="max-w-2xl text-[17px] leading-relaxed text-cream-2 md:text-[19px]">
            {titles.length} books, 500+ asli business ideas. Kitna paisa lagega, kahan se shuru karein, kaise kamayein aur business ko agle level tak kaise le jaayein — sab step by step.
          </p>
          <div className="flex w-full justify-center text-left"><HeroSearch items={searchItems} /></div>
          <dl className="grid w-full max-w-2xl grid-cols-4 divide-x divide-ink/10 rounded-2xl border border-ink/10 bg-night-2 py-4 shadow-lift">
            {[[String(titles.length), "Books"], ["500+", "Business ideas"], [`${(Math.floor(totalPages / 100) * 100).toLocaleString("en-IN")}+`, "Pages"], ["2", "Languages"]].map(([v, k]) => (
              <div key={k}><dt className="sr-only">{k}</dt><dd className="font-display text-[24px] font-extrabold text-saffron-400 sm:text-[30px]">{v}</dd><dd className="text-[12px] text-fog sm:text-[13px]">{k}</dd></div>
            ))}
          </dl>
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


      {/* Start is easy, growth is the real work */}
      <section className="container-x pt-14">
        <SectionTitle eyebrow="Shuru karna aasaan hai. Badhana asli kaam hai." title="Business shuru sab karte hain — hum sikhate hain use bada kaise karein" />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Sahi idea chuno", "Aapke budget ke hisaab se — kitna lagega, kitna kamaoge, pehle hi pata."],
            ["Pehle customer lao", "Pehle 10, phir 100 customer kahan se aur kaise milenge."],
            ["Agle level tak le jao", "Team, system, doosri branch, naya shehar — chhoti dukaan se bada brand."],
            ["Munafa maximum karo", "Sahi daam, kam kharcha, baar-baar aane wale customer, loan aur subsidy."],
          ].map(([t, d], i) => (
            <li key={t} className="card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient font-display text-[18px] font-extrabold text-white">{i + 1}</span>
              <p className="mt-4 font-display text-[20px] font-bold text-cream">{t}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-fog">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-[15px] text-cream-2">Har book mein: shuru karne se lekar badhane tak ka poora raasta — asli numbers ke saath.</p>
      </section>

      {/* Browse by category */}
      <section className="container-x pt-14">
        <SectionTitle eyebrow="Apni line chuno" title="Har tarah ke business ke liye book" href="/books" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {cats.map((c) => (
            <Link key={c.key} href={`/books?cat=${c.key}`} className="card group flex flex-col gap-1 p-5 transition hover:-translate-y-0.5 hover:border-saffron-400/40">
              <span className="font-display text-[18px] font-bold leading-snug text-cream">{c.label}</span>
              <span className="text-[13px] leading-snug text-fog">{c.blurb}</span>
              <span className="mt-2 text-[13px] font-bold text-saffron-400">{c.count} {c.count === 1 ? "book" : "books"} →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* The 135-idea series */}
      {series && <SeriesBand series={series} />}

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

      {/* A look inside */}
      <section className="py-6">
        <div className="container-x">
          <SectionTitle eyebrow="Andar ki ek jhalak" title="Theory nahi — asli hisaab, asli numbers" />
        </div>
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4 sm:scroll-px-[max(1.5rem,calc((100vw_-_72rem)/2_+_1.5rem))] sm:px-[max(1.5rem,calc((100vw_-_72rem)/2_+_1.5rem))]">
          {SAMPLES.map((p) => (
            <Link key={p.img} href={`/book/${p.slug}`} className="group w-[220px] shrink-0 snap-start sm:w-[250px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt={`Sample page: ${p.label}`} loading="lazy" className="aspect-[420/595] w-full rounded-lg border border-ink/10 bg-white object-cover shadow-lift transition group-hover:-translate-y-1" />
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
          <h2 className="max-w-2xl font-display text-[32px] font-extrabold leading-tight md:text-[46px]">Aaj ek book. Kal apna dhandha.</h2>
          <p className="mt-3 max-w-xl text-[16px] font-medium opacity-80">Bhagyashali wahi hai jo shuru karta hai. Hindi aur English, kisi bhi phone par, hamesha ke liye.</p>
          <Link href="/books" className="btn mt-7 h-14 bg-night px-8 text-[16px] text-cream hover:bg-black">See all ebooks <Icon name="arrow" size={18} strokeWidth={2.2} /></Link>
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
    <section className="on-navy mt-14 bg-night">
      <div className="container-x grid items-center gap-10 py-14 lg:grid-cols-2">
        <div className="relative mx-auto h-[260px] w-full max-w-[520px] sm:h-[320px]">
          {covers.map((c, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={c} src={c} alt="" className="absolute top-0 w-[38%] drop-shadow-2xl"
              style={{ left: `${i * 15.5}%`, transform: `translateY(${Math.abs(i - 2) * 14}px)`, zIndex: 10 - Math.abs(i - 2) }} />
          ))}
        </div>
        <div className="flex flex-col items-start gap-5">
          <span className="chip">Full series · {series.bundle_items.length} books</span>
          <h2 className="font-display text-[30px] font-extrabold leading-tight md:text-[42px]">
            <span className="text-gradient">Chhoti problem, bada business.</span><br />Logon ki problem solve karo, paisa kamao.
          </h2>
          <p className="text-[17px] leading-relaxed text-cream-2">
            Har book ek badi problem leti hai — time, paisa, sehat, padhai, bijli, kachra, transport — aur batati hai ki usse business kaise banayein: 5 chhote ideas, 4 bade ideas, poora kharcha aur 90 din ka plan.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href={`/book/${series.slug}`} className="btn-primary h-14 px-8 text-[16px]">Poori series dekho <Icon name="arrow" size={18} strokeWidth={2.2} /></Link>
            <span className="text-[15px] text-fog"><b className="font-display text-[24px] text-cream">{rupees(series.price)}</b>{series.mrp ? <s className="ml-2">{rupees(series.mrp)}</s> : null}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Featured slides: the All Access Pass, the manufacturing bestseller, the 135-idea series and Contractor Bano. */
function buildSlides(allAccess: Product | null, series: Product | null, count: number): Slide[] {
  const slides: Slide[] = [];
  const book = (slug: string, eyebrow: string, title: string, cta: string) => {
    const b = findProduct(slug);
    if (!b?.is_published) return;
    slides.push({ eyebrow, title, sub: b.subtitle ?? "", price: rupees(b.price), mrp: b.mrp ? rupees(b.mrp) : undefined,
      href: `/book/${b.slug}`, cta, images: b.gallery.length ? [b.gallery[0]] : b.cover_url ? [b.cover_url] : [] });
  };
  if (allAccess) {
    const plan = getPlans(allAccess)[0];
    slides.push({ eyebrow: "All Access Pass", title: `Saari ${count} books, ek pass mein`, sub: `Hindi + English, 500+ business ideas, 9 Excel tools — aur saal bhar mein aane wali nayi books bhi free. ${accessLabel(plan.access_days)}.`,
      price: rupees(plan.price), mrp: plan.mrp ? rupees(plan.mrp) : undefined, href: "/book/all-access", cta: "Pass lo",
      images: ["fly-ash-bricks", "legal-business-andha-paisa", "manufacturing-50", "contractor-bano", "solar-business"]
        .map((x) => findProduct(x)?.gallery[0]).filter(Boolean) as string[] });
  }
  book("manufacturing-50", "Bestseller · 50 Most Profitable Manufacturing", "₹10 lakh ki factory se ₹1,000 crore tak", "Book dekho");
  if (series) {
    slides.push({ eyebrow: "Nayi series · 15 books", title: "Chhoti-chhoti problem solve karo, crore tak ka roadmap", sub: series.subtitle ?? "",
      price: rupees(series.price), mrp: series.mrp ? rupees(series.mrp) : undefined, href: `/book/${series.slug}`, cta: "Series dekho",
      images: series.bundle_items.slice(0, 5).map((x) => findProduct(x)?.gallery[0]).filter(Boolean) as string[] });
  }
  book("contractor-bano", "Contractor Bano", "Contractor banne ka step-by-step poora roadmap", "Book dekho");
  book("government-tenders", "How to Win Government Tenders", "Sarkari tender jeetne ka step-by-step roadmap", "Book dekho");
  return slides;
}
