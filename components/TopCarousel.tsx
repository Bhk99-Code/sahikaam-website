"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";

export type Slide = { eyebrow: string; title: string; sub: string; price: string; mrp?: string; href: string; cta: string; images: string[] };

/** Top banner slider: auto-advances every 6 s, pauses on hover/focus, swipe on phones. */
export function TopCarousel({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = slides.length;
  const go = (k: number) => setI(((k % n) + n) % n);

  useEffect(() => {
    if (paused || n < 2) return;
    const t = setTimeout(() => go(i + 1), 6000);
    return () => clearTimeout(t);
  }, [i, paused, n]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="on-navy relative bg-night" aria-roledescription="carousel" aria-label="Featured"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => { if (touchX.current == null) return; const d = e.changedTouches[0].clientX - touchX.current; if (Math.abs(d) > 40) go(i + (d < 0 ? 1 : -1)); touchX.current = null; }}>
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-saffron-400/15 blur-[120px]" />
      <div className="relative overflow-hidden">
        <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
          {slides.map((s, k) => (
            <div key={s.href} className="w-full shrink-0" aria-hidden={k !== i} role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${n}`}>
              <div className="container-x grid min-h-[480px] items-center gap-8 py-10 sm:min-h-[440px] md:grid-cols-[1.05fr_1fr] md:py-12">
                <div className="flex flex-col items-start gap-4">
                  <span className="chip">{s.eyebrow}</span>
                  <h2 className="font-display text-[30px] font-extrabold leading-[1.1] tracking-tight sm:text-[40px] lg:text-[46px]">{s.title}</h2>
                  <p className="max-w-lg text-[16px] leading-relaxed text-cream-2 sm:text-[18px]">{s.sub}</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <Link href={s.href} tabIndex={k === i ? 0 : -1} className="btn-primary h-[52px] px-7 text-[16px]">{s.cta} <Icon name="arrow" size={18} strokeWidth={2.2} /></Link>
                    <span className="text-fog"><b className="font-display text-[26px] text-cream">{s.price}</b>{s.mrp && <s className="ml-2 text-[15px]">{s.mrp}</s>}</span>
                  </div>
                </div>
                <div className="relative mx-auto h-[250px] w-full max-w-[480px] sm:h-[350px]">
                  {s.images.slice(0, 5).map((src, j, arr) => {
                    const mid = (arr.length - 1) / 2;
                    const one = arr.length === 1;
                    return (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={src} src={src} alt="" loading={k === 0 ? "eager" : "lazy"}
                        className={`absolute top-0 drop-shadow-2xl ${one ? "left-1/2 h-full -translate-x-1/2 object-contain" : "w-[44%]"}`}
                        style={one ? undefined : { left: `${(j / Math.max(arr.length - 1, 1)) * 56}%`, transform: `translateY(${Math.abs(j - mid) * 16}px)`, zIndex: 10 - Math.round(Math.abs(j - mid)) }} />
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {n > 1 && (
        <div className="container-x relative flex items-center gap-3 pb-6">
          <button type="button" aria-label="Previous slide" onClick={() => go(i - 1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 hover:bg-ink/10"><Icon name="back" size={18} /></button>
          <div className="flex gap-2">
            {slides.map((s, k) => (
              <button key={s.href} type="button" aria-label={`Show slide ${k + 1}`} aria-current={k === i} onClick={() => go(k)}
                className={`h-2.5 rounded-full transition-all ${k === i ? "w-8 bg-saffron-400" : "w-2.5 bg-ink/30 hover:bg-ink/50"}`} />
            ))}
          </div>
          <button type="button" aria-label="Next slide" onClick={() => go(i + 1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 hover:bg-ink/10"><Icon name="chevron" size={18} /></button>
        </div>
      )}
    </section>
  );
}
