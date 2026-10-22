import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getUser, ownsProduct, bundleCovers, findProduct, getPlans } from "@/lib/data";
import { BookCover } from "@/components/BookCover";
import { Icon } from "@/components/Icon";
import { accessLabel, CATEGORY, percentOff, rupees, TYPE_LABEL } from "@/lib/format";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProduct(params.slug);
  return p ? { title: p.title, description: p.subtitle ?? p.description ?? undefined, openGraph: p.cover_url ? { images: [p.cover_url] } : undefined } : {};
}

export default async function BookPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();
  const user = await getUser();
  const plans = getPlans(product);
  // Owning any plan of a pass (6 months or 1 year) counts as owning it.
  const owned = user ? (await Promise.all(plans.map((p) => ownsProduct(user.id, p.slug)))).some(Boolean) : false;
  const isBundle = product.type === "bundle";
  const openHref = isBundle ? "/library" : `/read/${product.slug}`;
  const covers = isBundle ? bundleCovers(product) : [];
  const off = percentOff(product.price, product.mrp);
  const cat = CATEGORY[product.category];
  const allAccess = findProduct("all-access");
  const inBundle = !isBundle && allAccess?.is_published && allAccess.bundle_items.includes(product.slug) ? allAccess : null;
  const included = isBundle ? product.bundle_items.map((s) => findProduct(s)).filter((p): p is Product => Boolean(p)) : [];

  return (
    <div className="pb-32 md:pb-10">
      {/* Top: cover + buy box */}
      <section className="relative overflow-hidden border-b border-ink/[0.07]">
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[760px] -translate-x-1/2 rounded-full opacity-25 blur-[120px]" style={{ background: product.accent }} />
        <div className="container-x relative py-6 lg:py-12">
          <Link href="/books" className="inline-flex items-center gap-1 text-[14px] font-semibold text-fog hover:text-cream">
            <Icon name="back" size={18} /> All ebooks
          </Link>
          <div className="mt-6 grid items-center gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-10">
            <div className="flex justify-center py-4">
              <BookCover product={product} covers={covers} size="lg" />
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full px-3 py-1 text-[12px] font-extrabold uppercase tracking-wider text-night" style={{ background: product.accent }}>{cat.label}</span>
                {product.badge && <span className="chip">{product.badge}</span>}
              </div>
              <h1 className="font-display text-[34px] font-extrabold leading-[1.05] tracking-tight text-cream md:text-[48px]">{product.title}</h1>
              {product.subtitle && <p className="max-w-2xl text-[17px] leading-relaxed text-cream-2 md:text-[19px]">{product.subtitle}</p>}
              <ul className="flex flex-wrap gap-2">
                <li className="chip"><Icon name="book" size={14} /> {TYPE_LABEL[product.type]}</li>
                {product.pages && <li className="chip"><Icon name="layers" size={14} /> {product.pages}{isBundle ? "+" : ""} pages</li>}
                {product.level && <li className="chip"><Icon name="star" size={14} /> {product.level}</li>}
                <li className="chip"><Icon name="globe" size={14} /> {isBundle ? "Hindi + English" : product.editions.map((e) => e.label + (e.coming_soon ? " (soon)" : "")).join(" · ")}</li>
                <li className="chip"><Icon name="check" size={14} /> {accessLabel(product.access_days)}</li>
                {product.bonus.length > 0 && <li className="chip"><Icon name="gift" size={14} /> Bonus Excel</li>}
              </ul>

              {plans.length > 1 && !owned ? (
                <PlanPicker plans={plans} current={product.slug} />
              ) : (
                <div className="card mt-2 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <Price product={product} off={off} />
                  <div className="hidden flex-1 sm:block" />
                  <BuyButton owned={owned} slug={product.slug} openHref={openHref} />
                </div>
              )}
              <p className="flex items-center gap-2 text-[13px] text-fog">
                <Icon name="lock" size={16} className="text-mint" strokeWidth={2} /> Secure checkout by Razorpay · UPI, cards, net banking · instant access
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-x grid gap-10 py-12 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-12">
          {product.highlights.length > 0 && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {product.highlights.map((h) => (
                <div key={h.title + h.text} className="card p-5">
                  <span className="block font-display text-[26px] font-extrabold" style={{ color: product.accent }}>{h.title}</span>
                  <span className="text-[13px] text-fog">{h.text}</span>
                </div>
              ))}
            </div>
          )}

          {product.learn.length > 0 && (
            <section>
              <h2 className="font-display text-[26px] font-extrabold text-cream">{isBundle ? "What's included" : "What you'll learn"}</h2>
              <ul className="mt-5 grid gap-3 md:grid-cols-2">
                {product.learn.map((t) => (
                  <li key={t} className="card flex gap-3 p-4 text-[15px] leading-relaxed text-cream-2">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: `${product.accent}26`, color: product.accent }}>
                      <Icon name="check" size={14} strokeWidth={3} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {product.description && (
            <section>
              <h2 className="font-display text-[26px] font-extrabold text-cream">About this {TYPE_LABEL[product.type].toLowerCase()}</h2>
              <p className="mt-4 whitespace-pre-line text-[16px] leading-relaxed text-cream-2">{product.description}</p>
            </section>
          )}

          {included.length > 0 && (
            <section>
              <h2 className="font-display text-[26px] font-extrabold text-cream">Books in this pass</h2>
              <div className="mt-5 flex flex-col gap-3">
                {included.map((b) => (
                  <Link key={b.slug} href={`/book/${b.slug}`} className="card flex items-center gap-4 p-4 hover:border-ink/20">
                    <BookCover product={b} size="sm" />
                    <div className="flex-1">
                      <p className="font-bold text-cream">{b.title}</p>
                      <p className="text-[13px] text-fog">{b.pages} pages · {b.editions.map((e) => e.label).join(" · ")}</p>
                    </div>
                    <span className="text-[14px] text-fog-2 line-through">{rupees(b.price)}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {product.bonus.length > 0 && (
            <section>
              <h2 className="font-display text-[26px] font-extrabold text-cream">Free bonus with this book</h2>
              <div className="mt-5 flex flex-col gap-3">
                {product.bonus.map((b, i) => (
                  <div key={b.file} className="relative rounded-card bg-brand-gradient p-[1.5px]">
                    <div className="flex items-center gap-4 rounded-[21px] bg-night-2 p-5">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-saffron-500/15 text-saffron-400"><Icon name="gift" size={22} strokeWidth={2} /></span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-cream">{b.title} <span className="ml-1 rounded-full bg-ink/10 px-2 py-0.5 align-middle text-[11px] font-bold text-cream-2">.xlsx</span></p>
                        {b.text && <p className="mt-1 text-[14px] leading-relaxed text-fog">{b.text}</p>}
                      </div>
                      {owned && (
                        <a href={`/api/bonus/${product.slug}?i=${i}`} download aria-label={`Download ${b.title}`} className="btn-ghost h-11 w-11 shrink-0 px-0 sm:w-auto sm:px-4"><Icon name="download" size={18} /> <span className="hidden sm:inline">Download</span></a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {!owned && <p className="mt-3 text-[13px] text-fog">Editable Excel — download it from your library after purchase.</p>}
            </section>
          )}

          {!isBundle && product.chapters.length > 0 && (
            <section id="inside" className="scroll-mt-24">
              <h2 className="font-display text-[26px] font-extrabold text-cream">Inside the book</h2>
              <ol className="card mt-5 divide-y divide-ink/[0.07] overflow-hidden">
                {product.chapters.map((t, i) => (
                  <li key={i} className="flex items-center gap-4 p-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-[14px] font-extrabold" style={{ background: `${product.accent}1f`, color: product.accent }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[15px] font-semibold text-cream">{t}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {!isBundle && product.editions.length > 0 && (
            <section>
              <h2 className="font-display text-[26px] font-extrabold text-cream">Read it your way</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {product.editions.map((e) => (
                  <div key={e.lang} className="card flex items-center gap-4 p-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink/[0.06] font-display text-[18px] font-extrabold text-cream">{e.lang === "hi" ? "हि" : "En"}</span>
                    <div className="flex-1">
                      <p className="font-bold text-cream">{e.label} edition</p>
                      <p className="text-[13px] text-fog">{e.coming_soon ? "Coming soon — free for buyers" : `${e.pages ?? ""} pages · included`}</p>
                    </div>
                    {e.coming_soon ? <span className="chip">Soon</span> : <Icon name="check" className="text-mint" strokeWidth={2.4} />}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Side: upsell + trust */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          {inBundle && !owned && (
            <Link href="/book/all-access" className="relative block rounded-card bg-brand-gradient p-[1.5px]">
              <div className="rounded-[21px] bg-night-2 p-5">
                <p className="eyebrow text-sun">Save more</p>
                <p className="mt-2 font-display text-[20px] font-bold text-cream">Get this + every other ebook from {rupees(getPlans(inBundle)[0].price)}</p>
                <p className="mt-2 text-[14px] font-bold text-saffron-400">See All Access →</p>
              </div>
            </Link>
          )}
          <div className="card flex flex-col gap-4 p-5 text-[14px] text-cream-2">
            {[
              ["bolt", "Instant access after payment"],
              ["globe", "Hindi and English editions"],
              ["library", "Read on phone, tablet or computer"],
              ["refund", "Refund if charged twice or the book won't open"],
            ].map(([icon, t]) => (
              <p key={t} className="flex items-center gap-3"><Icon name={icon} size={18} className="text-saffron-400" strokeWidth={2} />{t}</p>
            ))}
          </div>
        </aside>
      </div>

      {/* Mobile sticky buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-3 border-t border-ink/10 bg-night-2/95 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden">
        {plans.length > 1 && !owned ? (
          <>
            <div className="min-w-0 flex-1">
              <span className="block text-[12px] text-fog">{plans.length} plans</span>
              <span className="font-display text-[22px] font-extrabold text-cream min-[360px]:text-[24px]">from {rupees(plans[0].price)}</span>
            </div>
            <a href="#plans" className="btn-primary h-12 shrink-0 whitespace-nowrap px-6 text-[15px] shadow-glow">Choose plan</a>
          </>
        ) : (
          <>
            <div className="min-w-0 flex-1"><Price product={product} off={off} compact /></div>
            <BuyButton owned={owned} slug={product.slug} openHref={openHref} />
          </>
        )}
      </div>
    </div>
  );
}

function Price({ product, off, compact }: { product: Product; off: number; compact?: boolean }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className={`font-display font-extrabold text-cream ${compact ? "text-[22px] min-[360px]:text-[24px]" : "text-[34px]"}`}>{rupees(product.price)}</span>
        {off > 0 && <span className={`text-fog-2 line-through ${compact ? "text-[13px]" : "text-[15px]"}`}>{rupees(product.mrp!)}</span>}
        {off > 0 && !compact && <span className="rounded-full bg-rosy px-2 py-0.5 text-[12px] font-extrabold text-white">{off}% off</span>}
      </div>
      {product.price > 0 && <span className="text-[12px] text-fog">{compact && off > 0 ? <b className="text-rosy">{off}% off · </b> : null}Inclusive of all taxes</span>}
    </div>
  );
}

/** Side-by-side plan cards (e.g. All Access 6 months / 1 year), each with its own buy button. */
function PlanPicker({ plans, current }: { plans: Product[]; current: string }) {
  const perMonth = (p: Product) => (p.access_days ? Math.round(p.price / Math.max(1, Math.round(p.access_days / 30.4))) : 0);
  const best = plans.reduce((a, b) => (perMonth(b) && perMonth(b) < perMonth(a) ? b : a));
  return (
    <div id="plans" className="mt-2 grid scroll-mt-24 gap-3 sm:grid-cols-2">
      {plans.map((p) => {
        const isBest = p === best && plans.length > 1;
        return (
          <div key={p.slug} className={isBest ? "relative rounded-card bg-brand-gradient p-[1.5px]" : "relative"}>
            <div className={`flex h-full flex-col gap-3 p-5 ${isBest ? "rounded-[21px] bg-night-2" : "card"} ${p.slug === current && !isBest ? "border-ink/25" : ""}`}>
              {isBest && <span className="absolute right-4 top-4 rounded-full bg-sun px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-night">Best value</span>}
              <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-saffron-400">{accessLabel(p.access_days).replace(" access", "")}</span>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-display text-[32px] font-extrabold text-cream">{rupees(p.price)}</span>
                {p.mrp && p.mrp > p.price && <span className="text-[14px] text-fog-2 line-through">{rupees(p.mrp)}</span>}
              </div>
              {perMonth(p) > 0 && <span className="text-[13px] text-fog">≈ {rupees(perMonth(p))} / month · inclusive of all taxes</span>}
              <Link href={`/checkout/${p.slug}`} className={`${isBest ? "btn-primary shadow-glow" : "btn-ghost"} mt-auto h-12 w-full text-[15px]`}>Buy {accessLabel(p.access_days).replace(" access", "")}</Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BuyButton({ owned, slug, openHref }: { owned: boolean; slug: string; openHref: string }) {
  if (owned) return <Link href={openHref} className="btn h-12 shrink-0 whitespace-nowrap bg-cream px-5 text-[15px] text-night hover:bg-fog sm:h-14 sm:px-7 sm:text-[16px]">Start reading</Link>;
  return <Link href={`/checkout/${slug}`} className="btn-primary h-12 shrink-0 whitespace-nowrap px-6 text-[15px] shadow-glow sm:h-14 sm:px-9 sm:text-[16px]">Buy now</Link>;
}
