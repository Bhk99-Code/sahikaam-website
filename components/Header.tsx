import Link from "next/link";
import { Logo } from "./Logo";
import { Icon } from "./Icon";

export function Header({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/[0.07] bg-night/85 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center gap-2 sm:h-[68px] sm:gap-3">
        <Logo />
        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 md:flex">
          <NavLink href="/books">All ebooks</NavLink>
          <NavLink href="/book/all-access">All Access</NavLink>
          <NavLink href="/help">Help</NavLink>
        </nav>
        <form action="/books" className="ml-auto hidden lg:block">
          <label htmlFor="hq" className="sr-only">Search ebooks</label>
          <div className="flex h-11 w-[260px] items-center gap-2 rounded-full border border-ink/10 bg-night-3 px-4 text-fog">
            <Icon name="search" size={18} />
            <input id="hq" name="q" placeholder="Search ebooks" className="w-full bg-transparent text-[14px] text-cream outline-none placeholder:text-fog-2" />
          </div>
        </form>
        <div className="ml-auto flex items-center gap-2 lg:ml-3">
          <Link href="/books" aria-label="Search ebooks" className="flex h-11 w-11 items-center justify-center rounded-full text-cream hover:bg-ink/5 lg:hidden">
            <Icon name="search" />
          </Link>
          {signedIn ? (
            <Link href="/library" aria-label="My library" className="btn h-11 w-11 bg-ink/[0.06] px-0 text-[14px] text-cream hover:bg-ink/10 sm:w-auto sm:px-4">
              <Icon name="library" size={18} strokeWidth={2} /> <span className="hidden sm:inline">My library</span>
            </Link>
          ) : (
            <Link href="/login" className="btn h-11 whitespace-nowrap bg-cream px-4 text-[14px] text-night hover:bg-fog sm:px-5">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-full px-4 py-2 text-[14px] font-semibold text-cream-2 hover:bg-ink/5 hover:text-cream">
      {children}
    </Link>
  );
}
