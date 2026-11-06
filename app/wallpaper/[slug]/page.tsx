import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct } from "@/lib/data";
import { Icon } from "@/components/Icon";
import { percentOff, rupees } from "@/lib/format";
import { SITE_URL } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProduct(params.slug);
  if (!p || p.type !== "download") return {};
  const image = p.gallery[0] ?? p.cover_url;
  const title = `${p.title} — ${rupees(p.price)}, instant download`;
  const description = p.subtitle ?? "Pay once and download it right away. No login needed.";
  return {
    title, description, alternates: { canonical: `/wallpaper/${p.slug}` },
    openGraph: { type: "website", title, description, url: `/wallpaper/${p.slug}`, images: image ? [`${image.startsWith("http") ? "" : SITE_URL}${image}`] : undefined },
    twitter: { card: "summary_large_image", title, description, images: image ? [`${image.startsWith("http") ? "" : SITE_URL}${image}`] : undefined },
  };
}

const STEPS: [string, string, string][] = [
  ["1", "Pay securely", "UPI, cards, net banking or wallets via Razorpay."],
  ["2", "Download instantly", "A Download button opens the moment your payment goes through — no login needed."],
  ["3", "Keep the link", "We also send the link to your email, so you can download again anytime."],
];

export default async function WallpaperPage({ params }: { params: { slug: string } }) {
  const p = await getProduct(params.slug);
  if (!p || p.type !== "download") notFound();
  const image = p.gallery[0] ?? p.cover_url;
  const ready = p.bonus.length > 0;
  const off = percentOff(p.price, p.mrp);
  const buy = `/checkout/${p.slug}`;
  const points = p.highlights.length ? p.highlights.map((h) => [h.title, h.text] as const) : ([["Instant", "Download right after payment"], ["No login", "Nothing to sign up for"], ["HD", "Sharp on every phone"]] as const);

  return (
    <div className="relative overflow-x-clip pb-28 md:pb-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_60%_at_75%_15%,rgba(255,106,61,0.18),transparent_70%)]" />
      <section className="container-x relative grid items-center gap-8 pt-6 md:grid-cols-2 md:gap-12 md:pt-14">
        <div className="order-2 flex min-w-0 flex-col items-start gap-5 md:order-1">
          <span className="chip"><Icon name="bolt" size={14} /> Instant download · no login</span>
          <h1 className="font-display text-[34px] font-extrabold leading-[1.05] tracking-tight text-cream min-[400px]:text-[40px] md:text-[52px]">{p.title}</h1>
          {p.subtitle && <p className="max-w-xl text-[17px] leading-relaxed text-cream-2">{p.subtitle}</p>}
          <div className="flex items-baseline gap-3">
            <span className="font-display text-[44px] font-extrabold text-cream">{rupees(p.price)}</span>
            {off > 0 && <><span className="text-[18px] text-fog-2 line-through">{rupees(p.mrp!)}</span><span className="rounded-full bg-rosy/10 px-2.5 py-1 text-[13px] font-bold text-rosy">{off}% off</span></>}
          </div>
          {ready ? (
            <Link href={buy} className="btn-primary h-14 w-full px-8 text-[17px] md:w-auto">Buy now · {rupees(p.price)} <Icon name="arrow" size={18} strokeWidth={2.2} /></Link>
          ) : (
            <span className="btn-ghost h-14 w-full cursor-not-allowed px-8 text-[16px] opacity-70 md:w-auto">Available shortly</span>
          )}
          <p className="flex items-center gap-2 text-[13px] text-fog"><Icon name="lock" size={15} className="text-mint" /> Secure checkout by Razorpay · download starts right after payment</p>
          <ul className="grid w-full max-w-xl grid-cols-3 gap-2">
            {points.map(([t, x]) => (
              <li key={t} className="rounded-2xl bg-ink/[0.04] p-3 text-center"><span className="block font-display text-[18px] font-extrabold text-cream">{t}</span><span className="mt-0.5 block text-[12px] leading-snug text-fog">{x}</span></li>
            ))}
          </ul>
        </div>

        <div className="order-1 flex justify-center md:order-2">
          <div className="relative w-[185px] min-[400px]:w-[210px] md:w-[300px]">
            <div className="rounded-[2.6rem] bg-[#16181D] p-2.5 shadow-[0_30px_60px_-20px_rgba(15,15,17,0.55)]">
              <div className="relative aspect-[9/19] overflow-hidden rounded-[2.1rem] bg-gradient-to-br from-[#FF6A3D] via-[#E8451A] to-[#2B1B3D]">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt={p.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-white/90"><Icon name="sparkle" size={34} /><span className="font-display text-[20px] font-bold">Your wallpaper preview</span><span className="text-[12px] text-white/70">appears here</span></div>
                )}
                <div className="absolute left-1/2 top-3 h-5 w-20 -translate-x-1/2 rounded-full bg-black/70" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x relative mt-14 max-w-3xl">
        <h2 className="font-display text-[26px] font-extrabold text-cream">How it works</h2>
        <ol className="mt-5 grid gap-3">
          {STEPS.map(([n, t, x]) => (
            <li key={n} className="card flex items-start gap-4 p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-saffron-500 font-display font-extrabold text-white">{n}</span><div><p className="font-bold text-cream">{t}</p><p className="text-[14px] text-fog">{x}</p></div></li>
          ))}
        </ol>
        {p.description && <p className="mt-8 whitespace-pre-line text-[16px] leading-relaxed text-cream-2">{p.description}</p>}
        <h2 className="mt-10 font-display text-[22px] font-extrabold text-cream">Questions</h2>
        <div className="mt-3 grid gap-2 text-[14px]">
          {([
            ["How do I get the file?", "Right after you pay, a Download button opens on screen. The same link is emailed to you, so you can download again later."],
            ["Do I need to sign up?", "No. Just your email or WhatsApp number at checkout."],
            ["What if the download does not start?", "Tap the button again, or write to us from the Help page — we will send it to you."],
          ] as const).map(([q, a]) => (
            <details key={q} className="card p-4"><summary className="cursor-pointer font-semibold text-cream">{q}</summary><p className="mt-2 text-fog">{a}</p></details>
          ))}
        </div>
        <p className="mt-6 text-center text-[13px] text-fog">By buying you agree to our <Link href="/terms" className="font-semibold text-saffron-400">Terms</Link> and <Link href="/refund-policy" className="font-semibold text-saffron-400">Refund policy</Link>.</p>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/[0.08] bg-white/95 p-3 backdrop-blur md:hidden">
        {ready ? <Link href={buy} className="btn-primary h-14 w-full text-[17px]">Buy now · {rupees(p.price)}</Link> : <span className="btn-ghost h-14 w-full text-[16px] opacity-70">Available shortly</span>}
      </div>
    </div>
  );
}
