"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";

export type SearchItem = { href: string; title: string; note: string; price: string; cover: string | null; text: string };

// chip label -> search words (Hinglish labels, English book text)
const POPULAR: [string, string][] = [["Solar", "solar"], ["Paneer", "paneer"], ["Tender", "tender"], ["Subsidy", "subsidy"], ["Ghar se", "home business"], ["Gaon", "village"], ["AI", "earn with ai"], ["Export", "export"]];

/** Hero search: live results while typing; Enter opens the full search page. */
export function HeroSearch({ items }: { items: SearchItem[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const hits = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return items.filter((it) => words.every((w) => it.text.includes(w))).slice(0, 6);
  }, [q, items]);

  return (
    <div className="relative w-full max-w-xl">
      <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/books?q=${encodeURIComponent(q.trim())}`); }}
        className="flex h-14 items-center gap-2 rounded-full border border-ink/15 bg-night-2 pl-5 pr-2 focus-within:border-saffron-400">
        <Icon name="search" size={20} className="shrink-0 text-fog" />
        <label htmlFor="hero-q" className="sr-only">Search ebooks</label>
        <input id="hero-q" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off"
          placeholder="Kaunsa business? — solar, paneer, tender…" className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-cream outline-none placeholder:text-fog-2" />
        <button type="submit" className="btn-primary h-10 px-5 text-[14px]">Search</button>
      </form>

      {hits.length > 0 && (
        <ul className="absolute inset-x-0 top-[62px] z-30 overflow-hidden rounded-2xl border border-ink/10 bg-night-2 shadow-lift">
          {hits.map((h) => (
            <li key={h.href + h.title}>
              <Link href={h.href} className="flex items-center gap-3 px-4 py-3 hover:bg-ink/5">
                {h.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={h.cover} alt="" className="h-12 w-9 shrink-0 rounded object-cover" />
                ) : <span className="h-12 w-9 shrink-0 rounded bg-night-4" />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold text-cream">{h.title}</span>
                  <span className="block truncate text-[13px] text-fog">{h.note}</span>
                </span>
                <span className="shrink-0 text-[14px] font-bold text-saffron-400">{h.price}</span>
              </Link>
            </li>
          ))}
          <li><Link href={`/books?q=${encodeURIComponent(q.trim())}`} className="block border-t border-ink/10 px-4 py-3 text-[14px] font-bold text-saffron-400 hover:bg-ink/5">See all results →</Link></li>
        </ul>
      )}
      {q.trim() && !hits.length && <p className="mt-2 text-[14px] text-fog">Is naam se koi book nahi mili — doosra shabd try kijiye.</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
        <span className="text-fog">Popular:</span>
        {POPULAR.map(([label, words]) => (
          <button key={label} type="button" onClick={() => setQ(words)} className="rounded-full border border-ink/15 px-3 py-1 text-cream-2 hover:border-saffron-400 hover:text-cream">{label}</button>
        ))}
      </div>
    </div>
  );
}
