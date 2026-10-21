import Link from "next/link";
import type { Metadata } from "next";
import { getLibrary, getUser, getProducts } from "@/lib/data";
import { BookCover } from "@/components/BookCover";
import { Icon } from "@/components/Icon";
import { TYPE_LABEL } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Library", robots: { index: false } };

export default async function Library({ searchParams }: { searchParams: { tab?: string; new?: string } }) {
  const user = await getUser();
  const items = await getLibrary();
  const tab = searchParams.tab === "courses" ? "courses" : "ebooks";
  const shown = items.filter((i) => (tab === "courses" ? i.product.type === "course" : i.product.type !== "course"));
  const fresh = searchParams.new ? items.find((i) => i.product.slug === searchParams.new) : null;
  const suggestions = items.length ? [] : (await getProducts()).slice(0, 2);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:py-10">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-[26px] font-extrabold tracking-tight">My Library</h1>
          <p className="text-[14px] text-ink-5">{user?.email ?? "Aapki khareedi hui books & courses"}</p>
        </div>
        {user && (
          <form action="/auth/signout" method="post">
            <button className="flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-[14px] font-semibold hover:bg-mist">
              <Icon name="logout" size={18} /> Logout
            </button>
          </form>
        )}
      </div>

      {fresh && (
        <div role="status" className="mt-5 flex items-center gap-3 rounded-card border border-green-200 bg-green-50 p-4 text-green-900">
          <Icon name="check" className="shrink-0" strokeWidth={2.2} />
          <span className="text-[15px]"><b>Payment successful!</b> &ldquo;{fresh.product.title}&rdquo; aapki Library mein aa gayi hai.</span>
        </div>
      )}

      <div role="tablist" className="mt-5 flex gap-1 rounded-[14px] bg-[#E9EAEE] p-1">
        <TabLink href="/library" active={tab === "ebooks"}>Ebooks</TabLink>
        <TabLink href="/library?tab=courses" active={tab === "courses"}>Courses</TabLink>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {!isSupabaseConfigured && <p className="rounded-card border border-line bg-white p-6 text-ink-4">Preview mode — login set hone ke baad yahan khareedi hui books dikhengi.</p>}
        {isSupabaseConfigured && shown.length === 0 && (
          <div className="rounded-card border border-line bg-white p-8 text-center">
            <p className="text-[16px] font-bold">Abhi yahan kuch nahi hai</p>
            <p className="mt-1 text-[14px] text-ink-5">Koi book kharidein — wo turant yahan aa jayegi.</p>
            <Link href="/books" className="mt-4 inline-flex h-11 items-center rounded-full bg-ink px-6 font-bold text-white">Books dekhein</Link>
          </div>
        )}
        {shown.map(({ product, progress }) => {
          const href = product.type === "course" ? `/learn/${product.slug}` : `/read/${product.slug}`;
          const total = product.type === "course" ? product.lessons.length : product.pages ?? 0;
          const pct = total ? Math.min(100, Math.round((progress / total) * 100)) : 0;
          return (
            <div key={product.id} className="flex gap-4 rounded-card border border-line bg-white p-4">
              <BookCover product={product} size="sm" />
              <div className="flex flex-1 flex-col gap-1.5">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-5">{TYPE_LABEL[product.type]}</span>
                <span className="font-bold leading-snug">{product.title}</span>
                <span className="text-[13px] text-ink-5">{progress ? `${product.type === "course" ? "Lesson" : "Page"} ${progress}${total ? ` of ${total}` : ""}` : "Naya · abhi shuru nahi kiya"}</span>
                <span className="block h-1.5 rounded bg-[#EFEFF2]"><span className="block h-1.5 rounded bg-brand-500" style={{ width: `${pct}%` }} /></span>
                <Link href={href} className="mt-1 inline-flex h-10 items-center self-start rounded-full bg-ink px-5 text-[14px] font-bold text-white hover:bg-black">
                  {progress ? "Continue" : product.type === "course" ? "Dekhna Shuru Karein" : "Padhna Shuru Karein"}
                </Link>
              </div>
            </div>
          );
        })}
        {suggestions.length > 0 && isSupabaseConfigured && (
          <p className="text-center text-[14px] text-ink-5">Suggested: {suggestions.map((s, i) => (
            <span key={s.id}>{i > 0 && " · "}<Link className="font-semibold text-brand-600" href={`/book/${s.slug}`}>{s.title}</Link></span>
          ))}</p>
        )}
      </div>
    </div>
  );
}

function TabLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} role="tab" aria-selected={active}
      className={`flex h-11 flex-1 items-center justify-center rounded-[11px] text-[14px] ${active ? "bg-white font-bold text-ink shadow-sm" : "font-medium text-ink-4"}`}>
      {children}
    </Link>
  );
}
