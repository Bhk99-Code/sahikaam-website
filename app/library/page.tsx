import Link from "next/link";
import type { Metadata } from "next";
import { getLibrary, getUser, getProducts } from "@/lib/data";
import { BookCover } from "@/components/BookCover";
import { Icon } from "@/components/Icon";
import { CATEGORY } from "@/lib/format";
import { userLabel } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My library", robots: { index: false } };

export default async function Library({ searchParams }: { searchParams: { new?: string } }) {
  const user = await getUser();
  const items = user ? await getLibrary(user.id) : [];
  const books = items.filter((i) => i.product.type !== "bundle");
  const fresh = searchParams.new ? items.find((i) => i.product.slug === searchParams.new) : null;
  const suggestions = books.length ? [] : (await getProducts()).slice(0, 2);

  return (
    <div className="container-x max-w-4xl py-10 md:py-14">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[28px] font-extrabold tracking-tight text-cream sm:text-[34px]">My library</h1>
          <p className="truncate text-[14px] text-fog">{user ? userLabel(user) : "Your ebooks"}</p>
        </div>
        {user && (
          <Link href="/account" aria-label="Account" className="btn-ghost h-11 w-11 px-0 text-[14px] sm:w-auto sm:px-4"><Icon name="user" size={18} /> <span className="hidden sm:inline">Account</span></Link>
        )}
        {user && (
          <form action="/auth/signout" method="post">
            <button aria-label="Sign out" className="btn-ghost h-11 w-11 px-0 text-[14px] sm:w-auto sm:px-4"><Icon name="logout" size={18} /> <span className="hidden sm:inline">Sign out</span></button>
          </form>
        )}
      </div>

      {user && (!user.email || !user.phone) && (
        <Link href="/account" className="mt-6 flex items-center gap-3 rounded-card border border-saffron-500/30 bg-saffron-500/10 p-4 text-cream hover:border-saffron-500/60">
          <Icon name="shield" className="shrink-0 text-saffron-400" strokeWidth={2} />
          <span className="flex-1 text-[14px]"><b>Protect your account:</b> add your {user.email ? "mobile number" : "email"} so you can always get back into your library.</span>
          <Icon name="arrow" size={18} className="shrink-0 text-saffron-400" />
        </Link>
      )}

      {fresh && (
        <div role="status" className="mt-6 flex items-center gap-3 rounded-card border border-mint/30 bg-mint/10 p-4 text-cream">
          <Icon name="check" className="shrink-0 text-mint" strokeWidth={2.4} />
          <span className="text-[15px]"><b>Payment successful!</b> &ldquo;{fresh.product.title}&rdquo; is now in your library.</span>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4">
        {books.length === 0 && (
          <div className="card p-10 text-center">
            <p className="font-display text-[22px] font-bold text-cream">Your library is empty</p>
            <p className="mt-2 text-[15px] text-fog">Buy an ebook and it will appear here instantly.</p>
            <Link href="/books" className="btn-primary mt-6">Browse ebooks</Link>
            {suggestions.length > 0 && (
              <p className="mt-6 text-[14px] text-fog">Popular: {suggestions.map((s, i) => (
                <span key={s.id}>{i > 0 && " · "}<Link className="font-semibold text-saffron-400" href={`/book/${s.slug}`}>{s.title}</Link></span>
              ))}</p>
            )}
          </div>
        )}
        {books.map(({ product, progress, expiresAt }) => {
          const total = product.editions.find((e) => !e.coming_soon && !e.parts)?.pages ?? 0;
          const pct = total ? Math.min(100, Math.round((progress / total) * 100)) : 0;
          const ready = product.editions.filter((e) => !e.coming_soon);
          return (
            <div key={product.id} className="card flex gap-4 p-4 sm:gap-5 sm:p-5">
              <div className="w-[64px] shrink-0 sm:w-[84px]"><BookCover product={product} /></div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: product.accent }}>{CATEGORY[product.category]?.label}</span>
                <span className="font-display text-[18px] font-bold leading-snug text-cream">{product.title}</span>
                <span className="text-[13px] text-fog">
                  {progress ? `Page ${progress}${total ? ` of ${total}` : ""}` : "Not started yet"}
                  {expiresAt && <> · Access until {new Date(expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</>}
                </span>
                <span className="block h-1.5 rounded bg-ink/10"><span className="block h-1.5 rounded" style={{ width: `${pct}%`, background: product.accent }} /></span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {ready.map((e) => (
                    <Link key={e.lang} href={`/read/${product.slug}?lang=${e.lang}`} className={`${e === ready[0] ? "btn-primary" : "btn-ghost"} h-10 whitespace-nowrap px-4 text-[13px] sm:px-5 sm:text-[14px]`}>
                      {e === ready[0] ? (progress ? "Continue" : "Read") : "Read"} · {e.label}
                    </Link>
                  ))}
                  {product.bonus.map((b, i) => (
                    <a key={b.file} href={`/api/bonus/${product.slug}?i=${i}`} download className="btn-ghost h-10 whitespace-nowrap px-4 text-[13px] sm:px-5 sm:text-[14px]">
                      <Icon name="download" size={16} /> {/\.xlsx$/i.test(b.file) ? "Bonus Excel" : "Bonus file"}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
