import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";
import { addCoupon, deleteCoupon, toggleCoupon } from "@/lib/adminCoupons";

/** Owner-only coupon actions (form posts from /admin/coupons). */
export async function POST(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "not allowed" }, { status: 404 });
  const f = await req.formData();
  const action = String(f.get("action") ?? "");
  const code = String(f.get("code") ?? "");
  const r = action === "toggle" ? toggleCoupon(code)
    : action === "delete" ? deleteCoupon(code)
    : action === "add" ? addCoupon({
        code, kind: f.get("kind") === "flat" ? "flat" : "percent", value: Number(f.get("value")),
        productSlug: String(f.get("product") ?? ""), maxUses: f.get("max_uses") ? Number(f.get("max_uses")) : null,
        expires: String(f.get("expires") ?? ""), featured: f.get("featured") === "on",
      })
    : { ok: false as const, error: "Unknown action." };
  return new NextResponse(null, { status: 303, headers: { Location: `/admin/coupons?${r.ok ? "ok" : "err"}=${encodeURIComponent(r.ok ? r.message : r.error)}` } });
}
