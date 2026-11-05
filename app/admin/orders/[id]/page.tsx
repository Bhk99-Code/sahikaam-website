import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOrder } from "@/lib/admin";
import { findProduct } from "@/lib/data";
import { inr } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Order", robots: { index: false } };

const when = (t: number | null) => (t ? new Date(Number(t)).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—");
const Row = ({ k, children }: { k: string; children: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-2 text-[14px]"><span className="shrink-0 text-fog">{k}</span><span className="min-w-0 break-words text-right font-semibold text-cream">{children}</span></div>
);

export default async function AdminOrderPage({ params, searchParams }: { params: { id: string }; searchParams: { ok?: string; err?: string } }) {
  const found = await getOrder(params.id);
  if (!found) notFound();
  const { order: o, access } = found;
  const product = findProduct(o.product_slug);
  const base = product?.price ?? o.amount;
  const discount = Math.max(0, base - o.amount);
  const paid = o.status === "paid";
  const hidden = (name: string, value: string) => <input type="hidden" name={name} value={value} />;

  return (
    <div>
      <Link href="/admin/orders" className="text-[14px] font-semibold text-fog hover:text-cream">← All orders</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-[28px] font-extrabold text-cream">Order details</h1>
        <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${paid ? "bg-mint/10 text-mint" : "bg-ink/[0.07] text-fog"}`}>{paid ? "Paid" : "Unpaid"}</span>
      </div>
      <p className="mt-1 break-all text-[12px] text-fog">{o.id}</p>
      {searchParams.ok && <p role="status" className="mt-4 rounded-2xl bg-mint/10 p-3 text-[14px] text-cream">{searchParams.ok}</p>}
      {searchParams.err && <p role="alert" className="mt-4 rounded-2xl bg-rosy/10 p-3 text-[14px] text-rosy">{searchParams.err}</p>}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-display text-[18px] font-bold text-cream">Customer</h2>
          <div className="mt-2 divide-y divide-ink/[0.07]">
            <Row k="Name">{o.name || "—"}</Row>
            <Row k="Email">{o.email ?? "—"}</Row>
            <Row k="Mobile">{o.phone ?? "—"}</Row>
          </div>
          <Link href={`/admin/users?q=${encodeURIComponent(o.email ?? o.phone ?? "")}`} className="mt-3 inline-block text-[13px] font-semibold text-saffron-400">Open customer account →</Link>
        </section>

        <section className="card p-5">
          <h2 className="font-display text-[18px] font-bold text-cream">Payment</h2>
          <div className="mt-2 divide-y divide-ink/[0.07]">
            <Row k="Book">{product ? <Link href={`/admin/books/${product.slug}`} className="hover:underline">{product.title}</Link> : o.product_slug}</Row>
            <Row k="Book price">{inr(base)}</Row>
            <Row k={`Discount${o.coupon_code ? ` (${o.coupon_code})` : ""}`}>{discount ? `− ${inr(discount)}` : "—"}</Row>
            <Row k="Total charged"><b>{inr(o.amount)}</b></Row>
            <Row k="Razorpay payment">{o.razorpay_payment_id ?? "—"}</Row>
            <Row k="Razorpay order">{o.razorpay_order_id ?? "—"}</Row>
            <Row k="Started">{when(o.created_at)}</Row>
            <Row k="Paid at">{when(o.paid_at)}</Row>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-display text-[18px] font-bold text-cream">Access</h2>
          {access ? (
            <p className="mt-2 text-[14px] text-cream-2">In the buyer&apos;s library since {when(access.created_at)} · {access.expires_at ? `until ${when(access.expires_at)}` : "lifetime"}.</p>
          ) : <p className="mt-2 text-[14px] text-fog">This buyer does not have the book in their library.</p>}
          {paid && (
            <form action="/api/admin/orders" method="post" className="mt-3">
              {hidden("action", "resend")}{hidden("id", o.id)}
              <button className="btn-primary h-10 px-4 text-[13px]">Resend access link</button>
              <p className="mt-2 text-[12px] text-fog">Emails (or sends a code to) the buyer so they can open the library again.</p>
            </form>
          )}
        </section>

        <section className="card p-5">
          <h2 className="font-display text-[18px] font-bold text-cream">Internal note</h2>
          <form action="/api/admin/orders" method="post" className="mt-2">
            {hidden("action", "note")}{hidden("id", o.id)}
            <textarea name="note" rows={4} defaultValue={o.notes ?? ""} placeholder="Only you can see this (refund promised, called the buyer, …)" className="field w-full py-3" />
            <button className="btn-ghost mt-2 h-10 px-4 text-[13px]">Save note</button>
          </form>
        </section>
      </div>
    </div>
  );
}
