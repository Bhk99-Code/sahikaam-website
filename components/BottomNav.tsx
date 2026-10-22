"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

const ITEMS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/books", label: "Ebooks", icon: "book" },
  { href: "/library", label: "Library", icon: "library" },
  { href: "/help", label: "Help", icon: "help" },
];

/** Airtel-style floating bottom bar — phones only. */
export function BottomNav() {
  const path = usePathname();
  if (path.startsWith("/read/") || path.startsWith("/book/") || path.startsWith("/checkout/")) return null;
  return (
    <nav aria-label="Quick" className="fixed inset-x-3 bottom-3 z-40 flex h-[68px] items-center justify-around rounded-full border border-white/10 bg-night-3/95 px-1.5 shadow-lift backdrop-blur-xl md:hidden">
      {ITEMS.map((it) => {
        const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
        return (
          <Link key={it.href} href={it.href}
            className={`flex flex-col items-center gap-0.5 rounded-full px-4 py-2 text-[12px] ${active ? "bg-saffron-500/15 font-bold text-saffron-400" : "font-medium text-fog"}`}>
            <Icon name={it.icon} strokeWidth={active ? 2 : 1.8} />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
