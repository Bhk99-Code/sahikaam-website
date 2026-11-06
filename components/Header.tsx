import Link from "next/link";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { categoryMap, visibleCategories } from "@/lib/categories";

const FEATURES: [string, string][] = [
  ["bolt", "Instant access after payment"],
  ["globe", "Hindi + English in every book"],
  ["gift", "Free Excel tools & project reports"],
  ["library", "Read on any phone — no app"],
  ["lock", "Secure checkout by Razorpay"],
  ["refund", "Refund if charged twice"],
];

export function Header({ signedIn, isAdmin = false, compact = false }: { signedIn: boolean; isAdmin?: boolean; compact?: boolean }) {
  const cats = visibleCategories().map((c) => [c.key, c] as const);
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink/[0.06] bg-night/80 backdrop-blur-xl">
        <div className="container-x flex h-16 items-center gap-2 sm:h-[68px] sm:gap-3">
          <Logo />
          <nav aria-label="Main" className="ml-6 hidden items-center gap-0.5 md:flex">
            <NavLink href="/books">Ebooks</NavLink>
            <NavLink href="/book/all-access">Bundles</NavLink>
            <div className="group relative">
              <button type="button" className="flex items-center gap-1 rounded-full px-3.5 py-2 text-[14px] font-medium text-cream-2 transition hover:bg-ink/5 hover:text-cream group-focus-within:text-cream">
                Topics <Icon name="down" size={15} className="transition group-hover:rotate-180" />
              </button>
              <div className="invisible absolute left-1/2 top-full z-50 w-[420px] max-w-[calc(100vw-1.5rem)] -translate-x-1/2 translate-y-1 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="grid grid-cols-2 gap-1 rounded-2xl bg-night-2 p-2 shadow-lift">
                  {cats.map(([k, c]) => (
                    <Link key={k} href={`/books?cat=${k}`} className="rounded-xl px-3 py-2.5 hover:bg-night-4/70">
                      <span className="block text-[14px] font-semibold text-cream">{c.label}</span>
                      <span className="block truncate text-[12px] text-fog">{c.blurb}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <NavLink href="/help">Help</NavLink>
          </nav>
          <form action="/books" className="ml-auto hidden lg:block">
            <label htmlFor="hq" className="sr-only">Search ebooks</label>
            <div className="flex h-11 w-[240px] items-center gap-2 rounded-full bg-night-2 px-4 text-fog shadow-card focus-within:ring-2 focus-within:ring-[#FF4F1F]">
              <Icon name="search" size={18} />
              <input id="hq" name="q" placeholder="Search ebooks" className="w-full bg-transparent text-[14px] text-cream outline-none placeholder:text-fog-2" />
            </div>
          </form>
          <div className="ml-auto flex items-center gap-1.5 lg:ml-2">
            <Link href="/books" aria-label="Search ebooks" className="flex h-11 w-11 items-center justify-center rounded-full text-cream hover:bg-ink/5 lg:hidden">
              <Icon name="search" />
            </Link>
            {signedIn ? (
              <>
                {isAdmin && <Link href="/admin" className="hidden h-11 items-center rounded-full bg-ink/[0.07] px-4 text-[14px] font-bold text-cream hover:bg-ink/10 sm:flex">Admin</Link>}
                <Link href="/account" aria-label="Profile" className="flex h-11 w-11 items-center justify-center rounded-full text-cream hover:bg-ink/5">
                  <Icon name="user" size={20} strokeWidth={2} />
                </Link>
                <Link href="/library" aria-label="My library" className="btn-primary h-11 w-11 px-0 text-[14px] sm:w-auto sm:px-5">
                  <Icon name="library" size={18} strokeWidth={2} /> <span className="hidden sm:inline">My library</span>
                </Link>
              </>
            ) : (
              <Link href="/login" className="btn-primary h-11 whitespace-nowrap px-5 text-[14px]">Sign in</Link>
            )}
          </div>
        </div>
      </header>
      {/* Feature strip: scrolls away with the page; sideways swipe on phones (left out on ad landing pages) */}
      {!compact && <div className="border-b border-ink/[0.05] bg-night-2/60">
        <ul className="container-x no-scrollbar flex h-10 items-center gap-6 overflow-x-auto whitespace-nowrap text-[12.5px] font-medium text-cream-2 md:justify-between">
          {FEATURES.map(([icon, t]) => (
            <li key={t} className="flex shrink-0 items-center gap-2"><Icon name={icon} size={15} strokeWidth={2} className="text-[#E8451A]" />{t}</li>
          ))}
        </ul>
      </div>}
    </>
  );
}

function NavLink({ href, children, highlight }: { href: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <Link href={href} className={`rounded-full px-3.5 py-2 text-[14px] font-medium transition hover:bg-ink/5 hover:text-cream ${highlight ? "text-[#E8451A]" : "text-cream-2"}`}>
      {children}
    </Link>
  );
}
