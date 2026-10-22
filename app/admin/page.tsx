import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAdmin, searchUsers } from "@/lib/admin";
import { findProduct } from "@/lib/data";
import { rupees } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false } };

const date = (t: number | null) => (t ? new Date(Number(t)).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Lifetime");

/** Owner-only page: find a buyer and fix their account (recovery). */
export default async function AdminPage({ searchParams }: { searchParams: { q?: string; ok?: string; err?: string } }) {
  if (!(await getAdmin())) notFound();
  const q = searchParams.q ?? "";
  const users = await searchUsers(q);
  const action = (userId: string, name: string, label: string, placeholder?: string, danger?: boolean) => (
    <form action="/api/admin" method="post" className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="action" value={name} />
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="q" value={q} />
      {placeholder !== undefined && <input name="value" placeholder={placeholder} className="field h-10 min-w-0 flex-1 py-0 text-[14px]" />}
      <button className={`${danger ? "btn-ghost" : "btn-primary"} h-10 shrink-0 px-4 text-[13px]`}>{label}</button>
    </form>
  );

  return (
    <div className="container-x max-w-4xl py-10">
      <h1 className="font-display text-[30px] font-extrabold text-cream">Account recovery</h1>
      <p className="mt-1 text-[14px] text-fog">Search by email, mobile number, order ID or Razorpay payment ID (pay_…). Check the buyer&apos;s payment receipt before changing anything.</p>
      <form className="mt-6 flex gap-2">
        <input name="q" defaultValue={q} placeholder="email, 98765 43210, pay_…" className="field h-12 flex-1" />
        <button className="btn-primary h-12 px-6">Search</button>
      </form>
      {searchParams.ok && <p role="status" className="mt-4 rounded-2xl bg-mint/10 p-3 text-[14px] text-cream">{searchParams.ok}</p>}
      {searchParams.err && <p role="alert" className="mt-4 rounded-2xl bg-rosy/10 p-3 text-[14px] text-rosy">{searchParams.err}</p>}
      {q && users.length === 0 && <p className="mt-6 text-fog">No account found.</p>}
      <div className="mt-6 flex flex-col gap-5">
        {users.map((u) => (
          <div key={u.id} className="card p-5">
            <p className="font-bold text-cream">{u.email ?? "— no email —"} · {u.phone ?? "— no phone —"}</p>
            <p className="text-[12px] text-fog">ID {u.id} · joined {date(u.created_at)}</p>
            <div className="mt-3 text-[14px] text-cream-2">
              <b>Library:</b> {u.purchases.length ? u.purchases.map((p) => `${findProduct(p.product_slug)?.title ?? p.product_slug} (${p.expires_at ? "until " + date(p.expires_at) : "lifetime"})`).join(" · ") : "empty"}
            </div>
            <div className="mt-2 text-[13px] text-fog">
              <b>Orders:</b> {u.orders.length ? u.orders.map((o) => `${o.product_slug} ${rupees(o.amount)} ${o.status}${o.razorpay_payment_id ? " " + o.razorpay_payment_id : ""} (${date(o.created_at)})`).join(" · ") : "none"}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {action(u.id, "email", "Set email", "new email (empty = remove)")}
              {action(u.id, "phone", "Set phone", "new mobile (empty = remove)")}
              {action(u.id, "move", "Move purchases to", "other account's email or mobile")}
              {action(u.id, "signout", "Sign out all devices", undefined, true)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
