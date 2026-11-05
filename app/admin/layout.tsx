import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

const NAV: [string, string, string][] = [
  ["/admin", "Overview", "home"],
  ["/admin/users", "Users", "user"],
  ["/admin/orders", "Orders", "card"],
  ["/admin/books", "Products", "book"],
  ["/admin/categories", "Categories", "layers"],
  ["/admin/coupons", "Coupons", "tag"],
];

/** The owner's control panel: its own shell (the shop header/footer are dropped for /admin in app/layout.tsx). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) notFound();
  return (
    <div className="min-h-screen bg-[#F4F4F1] md:flex">
      <aside className="border-b border-ink/[0.08] bg-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:block md:px-5 md:py-5">
          <Logo />
          <span className="rounded-full bg-saffron-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-saffron-500 md:mt-3 md:inline-block">Admin</span>
        </div>
        <nav aria-label="Admin" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3 md:pb-0">
          {NAV.map(([href, label, icon]) => (
            <Link key={href} href={href} className="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[14px] font-semibold text-cream-2 hover:bg-ink/[0.06] hover:text-cream">
              <Icon name={icon} size={18} /> {label}
            </Link>
          ))}
        </nav>
        <div className="hidden px-3 pt-6 md:block">
          <Link href="/" className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[14px] font-semibold text-fog hover:bg-ink/[0.06] hover:text-cream"><Icon name="globe" size={18} /> View website</Link>
          <form action="/auth/signout" method="post">
            <button className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[14px] font-semibold text-fog hover:bg-ink/[0.06] hover:text-cream"><Icon name="logout" size={18} /> Sign out</button>
          </form>
          <p className="mt-4 truncate px-3.5 text-[12px] text-fog">{admin.email}</p>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 md:py-10"><div className="mx-auto max-w-5xl">{children}</div></main>
    </div>
  );
}
