import Link from "next/link";
import { Logo } from "./Logo";
import { Icon } from "./Icon";

export function Header({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 md:flex">
          <NavLink href="/books">Ebooks</NavLink>
          <NavLink href="/books?type=course">Courses</NavLink>
          <NavLink href="/books?type=bundle">Bundles</NavLink>
          <NavLink href="/help">Help</NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/books" aria-label="Search books" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-mist">
            <Icon name="search" />
          </Link>
          <Link href="/library" className="flex h-11 items-center gap-2 rounded-full bg-[#F1F2F5] px-4 text-[14px] font-bold text-ink hover:bg-[#E8E9ED]">
            <Icon name="library" size={18} strokeWidth={2} />
            <span>My Library</span>
          </Link>
          {!signedIn && (
            <Link href="/login" className="hidden h-11 items-center rounded-full bg-ink px-5 text-[14px] font-bold text-white hover:bg-black sm:flex">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-full px-4 py-2 text-[15px] font-medium text-ink-2 hover:bg-mist hover:text-ink">
      {children}
    </Link>
  );
}
