import Link from "next/link";
import type { Metadata } from "next";
import { getStats, listOrders } from "@/lib/admin";
import { findProduct } from "@/lib/data";
import { inr as rupees } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Overview", robots: { index: false } };

const date = (t: number | null) => (t ? new Date(Number(t)).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "—");

export default async function AdminOverview() {
  const [s, recent] = await Promise.all([getStats(), listOrders("paid", 8)]);
  const cards: [string, string, string][] = [
    ["Revenue (30 days)", rupees(s.revenue30d), `${s.paidOrders30d} orders`],
    ["Revenue (all time)", rupees(s.revenue), `${s.paidOrders} orders`],
    ["Users", String(s.users), `${s.newUsers7d} new this week`],
  ];
  return (
    <div>
      <h1 className="font-display text-[30px] font-extrabold text-cream">Overview</h1>
      <p className="mt-1 text-[14px] text-fog">How the business is doing, and shortcuts to manage everything.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {cards.map(([label, value, note]) => (
          <div key={label} className="card p-5">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-fog">{label}</p>
            <p className="mt-2 font-display text-[30px] font-extrabold text-cream">{value}</p>
            <p className="text-[13px] text-fog">{note}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/admin/books" className="btn-primary h-12 text-[15px]">+ Add a book</Link>
        <Link href="/admin/coupons" className="btn-ghost h-12 text-[15px]">+ Create a coupon</Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between"><h2 className="font-display text-[18px] font-bold text-cream">Latest paid orders</h2><Link href="/admin/orders" className="text-[13px] font-semibold text-saffron-400">All orders →</Link></div>
          <ul className="mt-3 divide-y divide-ink/[0.07] text-[14px]">
            {recent.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0"><p className="truncate font-semibold text-cream">{findProduct(o.product_slug)?.title ?? o.product_slug}</p><p className="truncate text-[12px] text-fog">{o.email ?? o.phone ?? "—"} · {date(o.paid_at)}</p></div>
                <b className="shrink-0 text-cream">{rupees(o.amount)}</b>
              </li>
            ))}
            {recent.length === 0 && <li className="py-3 text-fog">No paid orders yet.</li>}
          </ul>
        </section>
        <section className="card p-5">
          <h2 className="font-display text-[18px] font-bold text-cream">Top books by revenue</h2>
          <ul className="mt-3 divide-y divide-ink/[0.07] text-[14px]">
            {s.top.map((t) => (
              <li key={t.product_slug} className="flex items-center justify-between gap-3 py-2.5">
                <p className="min-w-0 truncate font-semibold text-cream">{findProduct(t.product_slug)?.title ?? t.product_slug}</p>
                <span className="shrink-0 text-fog">{t.n} sold · <b className="text-cream">{rupees(t.s)}</b></span>
              </li>
            ))}
            {s.top.length === 0 && <li className="py-3 text-fog">Nothing sold yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
