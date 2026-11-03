import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAdmin, listAllUsers, searchUsers } from "@/lib/admin";
import { findProduct } from "@/lib/data";
import { rupees } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false } };

const date = (t: number | null) => (t ? new Date(Number(t)).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
const expiry = (t: number | null) => (t ? "until " + date(t) : "lifetime");

/** Owner-only page: an "all buyers" overview (who paid what, when, active/inactive), plus search
 *  for a specific account to fix (recovery). */
export default async function AdminPage({ searchParams }: { searchParams: { q?: string; ok?: string; err?: string } }) {
  if (!(await getAdmin())) notFound();
  const q = searchParams.q ?? "";
  const users = q ? await searchUsers(q) : [];
  const overview = q ? [] : await listAllUsers();

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
    <div className="container-x max-w-5xl py-10">
      <h1 className="font-display text-[30px] font-extrabold text-cream">Admin</h1>
      <p className="mt-1 text-[14px] text-fog">Every buyer, what they paid, and account recovery. Search by email, mobile number, order ID or Razorpay payment ID (pay_…) to fix a specific account — check their payment receipt before changing anything.</p>
      <form className="mt-6 flex gap-2">
        <input name="q" defaultValue={q} placeholder="email, 98765 43210, pay_…" className="field h-12 flex-1" />
        <button className="btn-primary h-12 px-6">Search</button>
      </form>
      {searchParams.ok && <p role="status" className="mt-4 rounded-2xl bg-mint/10 p-3 text-[14px] text-cream">{searchParams.ok}</p>}
      {searchParams.err && <p role="alert" className="mt-4 rounded-2xl bg-rosy/10 p-3 text-[14px] text-rosy">{searchParams.err}</p>}
      {q && users.length === 0 && <p className="mt-6 text-fog">No account found.</p>}

      {!q && (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-[14px]">
            <thead>
              <tr className="text-left text-[12px] uppercase tracking-wide text-fog">
                <th className="px-3">Buyer</th>
                <th className="px-3">Joined</th>
                <th className="px-3">Total paid</th>
                <th className="px-3">Last payment</th>
                <th className="px-3">Status</th>
                <th className="px-3"></th>
              </tr>
            </thead>
            <tbody>
              {overview.map((u) => (
                <tr key={u.id} className="card">
                  <td className="whitespace-nowrap rounded-l-2xl px-3 py-3 font-semibold text-cream">
                    {u.name || "—"}<br /><span className="font-normal text-[12px] text-fog">{u.email ?? u.phone ?? "—"}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-cream-2">{date(u.created_at)}</td>
                  <td className="whitespace-nowrap px-3 py-3 font-bold text-cream">{rupees(u.total_paid)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-cream-2">{date(u.last_paid_at)}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${u.active === 0 ? "bg-rosy/10 text-rosy" : "bg-mint/10 text-mint"}`}>
                      {u.active === 0 ? "Inactive" : "Active"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap rounded-r-2xl px-3 py-3">
                    {action(u.id, u.active === 0 ? "activate" : "deactivate", u.active === 0 ? "Activate" : "Deactivate", undefined, u.active !== 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {overview.length === 0 && <p className="mt-4 text-fog">No buyers yet.</p>}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-5">
        {users.map((u) => (
          <div key={u.id} className="card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-cream">{u.name || "— no name —"} · {u.email ?? "— no email —"} · {u.phone ?? "— no phone —"}</p>
              <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${u.active === 0 ? "bg-rosy/10 text-rosy" : "bg-mint/10 text-mint"}`}>
                {u.active === 0 ? "Inactive" : "Active"}
              </span>
            </div>
            <p className="text-[12px] text-fog">ID {u.id} · joined {date(u.created_at)}</p>
            {(u.whatsapp || u.address || u.city) && (
              <p className="mt-1 text-[13px] text-fog">
                {u.whatsapp && <>WhatsApp {u.whatsapp}</>}{u.whatsapp && (u.address || u.city) && " · "}{[u.address, u.city].filter(Boolean).join(", ")}
              </p>
            )}
            <div className="mt-3 text-[14px] text-cream-2">
              <b>Library:</b> {u.purchases.length ? u.purchases.map((p) => `${findProduct(p.product_slug)?.title ?? p.product_slug} (${expiry(p.expires_at)})`).join(" · ") : "empty"}
            </div>
            <div className="mt-2 text-[13px] text-fog">
              <b>Orders:</b> {u.orders.length ? u.orders.map((o) => `${o.product_slug} ${rupees(o.amount)} ${o.status}${o.razorpay_payment_id ? " " + o.razorpay_payment_id : ""} (${date(o.created_at)})`).join(" · ") : "none"}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {action(u.id, "email", "Set email", "new email (empty = remove)")}
              {action(u.id, "phone", "Set phone", "new mobile (empty = remove)")}
              {action(u.id, "move", "Move purchases to", "other account's email or mobile")}
              {action(u.id, "signout", "Sign out all devices", undefined, true)}
              {action(u.id, u.active === 0 ? "activate" : "deactivate", u.active === 0 ? "Activate account" : "Deactivate account", undefined, u.active !== 0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
