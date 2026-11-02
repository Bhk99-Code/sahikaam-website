import type { ReactNode } from "react";
import { Icon } from "./Icon";

type Item = { title: string; text: string };

// Soft pastel tabs, as on the infographic reference
const PASTEL = ["#F1EBD6", "#F6C58E", "#CDB9AE", "#EFA0A0", "#A9D8D6", "#C7D3F0", "#D9C9EC", "#EAD7A8"];

/** Picks a line icon from the item's wording; falls back to a fixed rotation. */
function iconFor(title: string, i: number): string {
  const t = title.toLowerCase();
  const rules: [RegExp, string][] = [
    [/electric|power|solar|energy|\bev\b|ceiling|wiring/, "bolt"],
    [/tile|floor|brick|plaster|foundation|rcc|paint|elevation|plumb|water|house|home/, "home"],
    [/excel|report|dpr|roadmap|plan\b|checklist|workbook/, "layers"],
    [/invest|cost|money|profit|price|loan|fund|subsid|budget|numbers/, "coins"],
    [/licen|law|safety|permission|rule|legal|agreement|contract|payment/, "shield"],
    [/grade|test|check|quality|inspect|pipe|wiring|concrete/, "search"],
    [/source|supplier|where|market|buyer|customer|sell|export/, "globe"],
    [/process|machine|plant|crusher|make|production|factory|equipment/, "factory"],
    [/feed|farm|animal|dairy|waste|green|fodder|goat|poultry/, "leaf"],
    [/model|choose|pick|idea|start|business/, "bulb"],
    [/bank|scheme|government|tender/, "bank"],
  ];
  for (const [re, icon] of rules) if (re.test(t)) return icon;
  return ["bulb", "layers", "search", "coins", "shield", "globe", "factory", "bank"][i % 8];
}

/** The fan: tabs sit on a ring around the book; each has a label (icon + text) just outside it. */
const H = 76; // stage height in cqw (stage width is 100)
function geometry(n: number) {
  const cx = 35, cy = 50, rTab = 26, a = 40, b = 34;
  const from = 125, to = n > 5 ? -28 : -10;
  return Array.from({ length: n }, (_, i) => {
    const deg = n === 1 ? 90 : from + ((to - from) * i) / (n - 1);
    const th = (deg * Math.PI) / 180;
    return {
      deg,
      tab: { x: cx + rTab * Math.cos(th), y: cy - rTab * Math.sin(th), rot: 90 - deg },
      label: { x: cx + a * Math.cos(th), y: cy - b * Math.sin(th) },
    };
  });
}

export function InsideInfographic({ items, title, visual }: { items: Item[]; title: string; visual: ReactNode }) {
  const g = geometry(items.length);
  return (
    <>
      {/* Wide screens: fan around the book */}
      <div className="hidden md:block" style={{ containerType: "inline-size" }}>
        <div className="relative mx-auto w-full max-w-[1100px]" style={{ aspectRatio: `100 / ${H}` }}>
          {/* tabs */}
          {items.map((it, i) => (
            <div key={it.title} aria-hidden="true" className="absolute flex flex-col justify-center rounded-[1.6cqw] text-[#4A4A4A] shadow-[0_1.2cqw_2.4cqw_-1cqw_rgba(15,15,17,0.28)]"
              style={{ left: `${g[i].tab.x}%`, top: `${(g[i].tab.y / H) * 100}%`, width: "12.5cqw", height: "10cqw", transform: `translate(-50%,-50%) rotate(${g[i].tab.rot}deg)`, background: PASTEL[i % PASTEL.length], zIndex: i + 1, padding: "0 1.4cqw" }}>
              <span className="font-serif text-[1.25cqw] uppercase leading-none tracking-[0.18em] opacity-70">Step</span>
              <span className="mt-[0.4cqw] font-serif text-[3.6cqw] leading-none">{String(i + 1).padStart(2, "0")}</span>
            </div>
          ))}
          {/* centre circle with the book */}
          <div className="absolute flex flex-col items-center justify-center rounded-full bg-gradient-to-b from-white to-[#ECECE9] pb-[2.4cqw] text-center shadow-[0_2cqw_5cqw_-2cqw_rgba(15,15,17,0.35),inset_0_0_0_0.6cqw_rgba(255,255,255,0.9)]"
            style={{ left: "17%", top: `${((50 - 19) / H) * 100}%`, width: "36cqw", height: "36cqw", zIndex: 20 }}>
            <span className="font-serif text-[1.15cqw] uppercase tracking-[0.3em] text-[#8A8A8A]">What&apos;s inside</span>
            <div className="mt-[0.8cqw] w-[17cqw]">{visual}</div>
            <span className="mt-[1cqw] line-clamp-2 max-w-[21cqw] font-serif text-[1.5cqw] uppercase leading-[1.1] tracking-[0.04em] text-[#6B6B6B]">{title}</span>
          </div>
          {/* labels */}
          {items.map((it, i) => {
            const deg = g[i].deg;
            // upper-left: centred above; top: starts at the point, above; right side: beside
            const mode = deg > 95 ? "c" : deg > 70 ? "l" : "r";
            const x = mode === "c" ? Math.min(Math.max(g[i].label.x, 10), 90) : g[i].label.x + (mode === "r" ? 1.5 : -1);
            const tf = mode === "c" ? "translate(-50%,-100%)" : mode === "l" ? "translate(0,-100%)" : "translate(0,-50%)";
            return (
              <div key={it.title + "l"} className="absolute flex items-start gap-[0.9cqw]"
                style={{ left: `${x}%`, top: `${(g[i].label.y / H) * 100}%`, width: "18cqw", transform: tf, zIndex: 30 }}>
                <span className="mt-[0.2cqw] flex h-[3.4cqw] w-[3.4cqw] shrink-0 items-center justify-center rounded-[0.9cqw] text-[#2B2B2B]" style={{ background: PASTEL[i % PASTEL.length] }}>
                  <Icon name={iconFor(it.title, i)} size={20} strokeWidth={1.7} />
                </span>
                <span>
                  <span className="block font-serif text-[1.5cqw] uppercase leading-[1.1] tracking-[0.03em] text-[#3A3A3A]">{String(i + 1).padStart(2, "0")} · {it.title}</span>
                  <span className="mt-[0.5cqw] block text-[1.12cqw] leading-[1.35] text-fog">{it.text}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phones: the book on top, then the steps as pastel cards */}
      <div className="md:hidden">
        <div className="mx-auto flex w-[78%] max-w-[300px] flex-col items-center rounded-full bg-gradient-to-b from-white to-[#ECECE9] px-6 py-9 text-center shadow-lift">
          <span className="font-serif text-[11px] uppercase tracking-[0.3em] text-[#8A8A8A]">What&apos;s inside</span>
          <div className="mt-3 w-[62%]">{visual}</div>
          <span className="mt-3 line-clamp-2 font-serif text-[15px] uppercase leading-tight tracking-[0.04em] text-[#6B6B6B]">{title}</span>
        </div>
        <ol className="mt-6 flex flex-col gap-3">
          {items.map((it, i) => (
            <li key={it.title} className="flex gap-4 rounded-[22px] p-4 text-[#3A3A3A] shadow-card" style={{ background: PASTEL[i % PASTEL.length] }}>
              <span className="flex w-12 shrink-0 flex-col items-center font-serif leading-none"><span className="text-[10px] uppercase tracking-[0.14em] opacity-70">Step</span><span className="mt-1 text-[28px]">{String(i + 1).padStart(2, "0")}</span></span>
              <span className="min-w-0 flex-1">
                <span className="block font-serif text-[16px] uppercase leading-tight tracking-[0.03em]">{it.title}</span>
                <span className="mt-1 block text-[14px] leading-snug text-[#4A4A4A]">{it.text}</span>
              </span>
              <Icon name={iconFor(it.title, i)} size={22} strokeWidth={1.7} className="mt-0.5 shrink-0 opacity-70" />
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
