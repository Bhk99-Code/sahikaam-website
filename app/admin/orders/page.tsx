import Link from "next/link";
import type { Metadata } from "next";
import { listOrders, orderTotals } from "@/lib/admin";
import { findProduct } from "@/lib/data";
import { inr } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Orders", robots: { index: false } };

const date = (t: number | null) => (t ? new Date(Number(t)).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—");

export default async function AdminOrders({ searchParams }: { searchParams: { status?: string; q?: string; from?: string; to?: string } }) {
  const status = searchParams.status === "paid" || searchParams.status === "created" ? searchParams.status : "";
  const f = { q: searchParams.q ?? "", from: searchParams.from ?? "", to: searchParams.to ?? "" };
  const [orders, totals] = await Promise.all([listOrders({ ...f, status: status || undefined }), orderTotals(f)]);
  const qs = (extra: Record<string, string>) => {
    const p = new URLSearchParams(Object.entries({ ...f, status, ...extra }).filter(([, v]) => v) as [string, string][]);
    return p.toString() ? `?${p}` : "";
  };
  const tabs: [string, string, number][] = [["", "All", totals.all], ["paid", "Paid", totals.paid], ["created", "Unpaid / abandoned", totals.created]];
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[30px] font-extrabold text-cream">Orders</h1>
        <a href={`/api/admin/orders/export${qs({})}`} className="btn-ghost h-10 px-4 text-[13px]">Download CSV</a>
      </div>
      <form className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={f.q} placeholder="Search name, email, mobile, order or payment ID, coupon" className="field h-11" />
        <input name="from" type="date" defaultValue={f.from} className="field h-11" aria-label="From date" />
        <input name="to" type="date" defaultValue={f.to} className="field h-11" aria-label="To date" />
        <button className="btn-primary h-11 px-5">Filter</button>
      </form>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {tabs.map(([v, l, n]) => (
          <Link key={v} href={`/admin/orders${qs({ status: v })}`} className={`rounded-full px-4 py-2 text-[13px] font-bold ${status === v ? "bg-saffron-500 text-white" : "bg-ink/[0.06] text-fog hover:text-cream"}`}>{l} ({n})</Link>
        ))}
        <span className="ml-auto text-[14px] text-fog">Paid revenue in this view: <b className="text-cream">{inr(totals.revenue)}</b></span>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-[14px]">
          <thead><tr className="text-left text-[12px] uppercase tracking-wide text-fog"><th className="px-3">Book</th><th className="px-3">Buyer</th><th className="px-3">Amount</th><th className="px-3">Status</th><th className="px-3">Date</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="card">
                <td className="rounded-l-2xl px-3 py-3 font-semibold text-cream">
                  <Link href={`/admin/orders/${o.id}`} className="hover:underline">{findProduct(o.product_slug)?.title ?? o.product_slug}</Link>
                  {o.coupon_code && <span className="ml-2 rounded-full bg-mint/10 px-2 py-0.5 text-[11px] font-bold text-mint">{o.coupon_code}</span>}
                  {o.notes && <span className="ml-2 text-[11px] text-fog" title={o.notes}>📝</span>}
                </td>
                <td className="px-3 py-3 text-cream-2">{o.name || "—"}<br /><span className="text-[12px] text-fog">{o.email ?? o.phone ?? "—"}</span></td>
                <td className="whitespace-nowrap px-3 py-3 font-bold text-cream">{inr(o.amount)}</td>
                <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${o.status === "paid" ? "bg-mint/10 text-mint" : "bg-ink/[0.06] text-fog"}`}>{o.status === "paid" ? "Paid" : "Unpaid"}</span></td>
                <td className="whitespace-nowrap rounded-r-2xl px-3 py-3 text-cream-2">{date(o.paid_at ?? o.created_at)} <Link href={`/admin/orders/${o.id}`} className="ml-2 text-[13px] font-semibold text-saffron-400">Details →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="mt-4 text-fog">No orders match.</p>}
      </div>
    </div>
  );
}
