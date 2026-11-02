"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

const ITEMS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/books", label: "Ebooks", icon: "book" },
  { href: "/book/all-access", label: "Pass", icon: "bolt", center: true },
  { href: "/library", label: "Library", icon: "library" },
  { href: "/help", label: "Help", icon: "help" },
];

/** Floating dark bottom bar — phones only. The All Access button sits raised in the middle. */
export function BottomNav() {
  const path = usePathname();
  if (path.startsWith("/read/") || path.startsWith("/book/") || path.startsWith("/checkout/")) return null;
  return (
    <nav aria-label="Quick" className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex h-[66px] items-center justify-around rounded-full bg-[#15171C]/95 px-2 shadow-pill ring-1 ring-white/10 backdrop-blur-xl md:hidden">
      {ITEMS.map((it) => {
        const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
        if (it.center) {
          return (
            <Link key={it.href} href={it.href} aria-label="All Access Pass" className="-mt-8 flex h-[58px] w-[58px] flex-col items-center justify-center rounded-full bg-[#FF4F1F] text-white shadow-glow ring-4 ring-night">
              <Icon name={it.icon} size={22} strokeWidth={2.2} />
              <span className="text-[10px] font-bold leading-none">{it.label}</span>
            </Link>
          );
        }
        return (
          <Link key={it.href} href={it.href}
            className={`flex min-w-[56px] flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-[11px] ${active ? "font-bold text-white" : "font-medium text-white/55"}`}>
            <Icon name={it.icon} size={21} strokeWidth={active ? 2.2 : 1.8} className={active ? "text-[#FF6A3D]" : ""} />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
