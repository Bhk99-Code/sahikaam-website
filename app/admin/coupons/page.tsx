import type { Metadata } from "next";
import { all } from "@/lib/db";
import { readCouponFile } from "@/lib/adminCoupons";
import { getProducts } from "@/lib/data";
import { inr as rupees } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Coupons", robots: { index: false } };

const day = (s?: string | null) => (s ? new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "no expiry");

export default async function AdminCoupons({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  const coupons = readCouponFile().coupons;
  const books = await getProducts();
  const used = await all<{ coupon_code: string; n: number }>("SELECT coupon_code, COUNT(*) AS n FROM orders WHERE status = 'paid' AND coupon_code IS NOT NULL GROUP BY coupon_code");
  const usedBy = Object.fromEntries(used.map((u) => [String(u.coupon_code).toUpperCase(), Number(u.n)]));
  const post = (action: string, code: string, label: string, danger = false) => (
    <form action="/api/admin/coupons" method="post">
      <input type="hidden" name="action" value={action} /><input type="hidden" name="code" value={code} />
      <button className={`${danger ? "btn-ghost" : "btn-ghost"} h-9 px-3 text-[13px] ${danger ? "text-rosy" : ""}`}>{label}</button>
    </form>
  );
  return (
    <div>
      <h1 className="font-display text-[30px] font-extrabold text-cream">Coupons</h1>
      <p className="mt-1 text-[14px] text-fog">A new coupon works on the website straight away. Coupons tagged “dashboard” come from the Platform dashboard.</p>
      {searchParams.ok && <p role="status" className="mt-4 rounded-2xl bg-mint/10 p-3 text-[14px] text-cream">{searchParams.ok}</p>}
      {searchParams.err && <p role="alert" className="mt-4 rounded-2xl bg-rosy/10 p-3 text-[14px] text-rosy">{searchParams.err}</p>}

      <form action="/api/admin/coupons" method="post" className="card mt-6 grid gap-3 p-5 sm:grid-cols-2">
        <input type="hidden" name="action" value="add" />
        <h2 className="font-display text-[20px] font-bold text-cream sm:col-span-2">Create a coupon</h2>
        <input name="code" required placeholder="Code, e.g. DIWALI30 *" className="field h-11 uppercase" />
        <div className="grid grid-cols-2 gap-2">
          <select name="kind" className="field h-11" defaultValue="percent"><option value="percent">% off</option><option value="flat">₹ off</option></select>
          <input name="value" type="number" min="1" required placeholder="Amount *" className="field h-11" />
        </div>
        <select name="product" className="field h-11" defaultValue=""><option value="">All books</option>{books.filter((b) => b.type === "ebook").map((b) => <option key={b.slug} value={b.slug}>{b.title}</option>)}</select>
        <input name="max_uses" type="number" min="1" placeholder="Max uses (empty = unlimited)" className="field h-11" />
        <label className="text-[13px] text-fog">Last day<input name="expires" type="date" className="field mt-1 block h-11 w-full" /></label>
        <label className="flex items-center gap-2 pt-5 text-[14px] text-cream"><input type="checkbox" name="featured" /> Show in the site&apos;s offer bar</label>
        <button className="btn-primary h-12 px-6 sm:col-span-2">Create coupon</button>
      </form>

      <h2 className="mt-10 font-display text-[20px] font-bold text-cream">All coupons ({coupons.length})</h2>
      <div className="mt-3 flex flex-col gap-2">
        {coupons.map((c) => {
          const off = c.percent_off ? `${c.percent_off}% off` : rupees(c.flat_off ?? 0) + " off";
          const expired = c.expires_at ? new Date(c.expires_at) < new Date() : false;
          const on = c.is_active !== false && !expired;
          return (
            <div key={c.code} className="card flex flex-wrap items-center gap-3 p-3 text-[14px]">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-cream">{c.code} <span className="font-normal text-fog">· {off}{c.product_slug ? ` · only ${c.product_slug}` : ""}</span></p>
                <p className="text-[12px] text-fog">Used {usedBy[c.code.toUpperCase()] ?? 0}{c.max_uses ? ` of ${c.max_uses}` : ""} · {expired ? "expired " : "until "}{day(c.expires_at)}{c.featured ? " · in offer bar" : ""}{c.from_dashboard ? " · dashboard" : ""}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${on ? "bg-mint/10 text-mint" : "bg-rosy/10 text-rosy"}`}>{on ? "Active" : expired ? "Expired" : "Off"}</span>
              {post("toggle", c.code, c.is_active === false ? "Turn on" : "Turn off")}
              {post("delete", c.code, "Delete", true)}
            </div>
          );
        })}
        {coupons.length === 0 && <p className="text-fog">No coupons yet.</p>}
      </div>
    </div>
  );
}
