import Link from "next/link";
import type { Metadata } from "next";
import { listOrders } from "@/lib/admin";
import { findProduct } from "@/lib/data";
import { inr as rupees } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Orders", robots: { index: false } };

const date = (t: number | null) => (t ? new Date(Number(t)).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—");

export default async function AdminOrders({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams.status === "paid" || searchParams.status === "created" ? searchParams.status : "";
  const orders = await listOrders(status || undefined);
  const tabs: [string, string][] = [["", "All"], ["paid", "Paid"], ["created", "Unpaid / abandoned"]];
  return (
    <div>
      <h1 className="font-display text-[30px] font-extrabold text-cream">Orders</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map(([v, l]) => (
          <Link key={v} href={v ? `/admin/orders?status=${v}` : "/admin/orders"} className={`rounded-full px-4 py-2 text-[13px] font-bold ${status === v ? "bg-saffron-500 text-white" : "bg-ink/[0.06] text-fog hover:text-cream"}`}>{l}</Link>
        ))}
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-[14px]">
          <thead><tr className="text-left text-[12px] uppercase tracking-wide text-fog"><th className="px-3">Book</th><th className="px-3">Buyer</th><th className="px-3">Amount</th><th className="px-3">Status</th><th className="px-3">Date</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="card">
                <td className="rounded-l-2xl px-3 py-3 font-semibold text-cream">{findProduct(o.product_slug)?.title ?? o.product_slug}{o.coupon_code && <span className="ml-2 rounded-full bg-mint/10 px-2 py-0.5 text-[11px] font-bold text-mint">{o.coupon_code}</span>}</td>
                <td className="px-3 py-3 text-cream-2">{o.name || "—"}<br /><span className="text-[12px] text-fog">{o.email ?? o.phone ?? "—"}</span></td>
                <td className="whitespace-nowrap px-3 py-3 font-bold text-cream">{rupees(o.amount)}</td>
                <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${o.status === "paid" ? "bg-mint/10 text-mint" : "bg-ink/[0.06] text-fog"}`}>{o.status === "paid" ? "Paid" : "Unpaid"}</span>{o.razorpay_payment_id && <p className="mt-1 text-[11px] text-fog">{o.razorpay_payment_id}</p>}</td>
                <td className="whitespace-nowrap rounded-r-2xl px-3 py-3 text-cream-2">{date(o.paid_at ?? o.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="mt-4 text-fog">No orders here yet.</p>}
      </div>
    </div>
  );
}
