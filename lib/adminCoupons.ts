import "server-only";
import fs from "fs";
import path from "path";
import { couponsReadPath, couponsWritePath } from "./storage";

export type CouponRow = {
  code: string; percent_off?: number; flat_off?: number; product_slug?: string | null; max_uses?: number | null;
  expires_at?: string | null; is_active?: boolean; featured?: boolean; from_dashboard?: boolean;
};
type File = { _help?: string; coupons: CouponRow[] };
type Result = { ok: true; message: string } | { ok: false; error: string };

export function readCouponFile(): File {
  try { return JSON.parse(fs.readFileSync(couponsReadPath(), "utf8")); } catch { return { coupons: [] }; }
}
function write(f: File) {
  const target = couponsWritePath();
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const tmp = target + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(f, null, 2) + "\n");
  fs.renameSync(tmp, target);
}

export function addCoupon(i: { code: string; kind: "percent" | "flat"; value: number; productSlug: string; maxUses: number | null; expires: string; featured: boolean }): Result {
  const code = i.code.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) return { ok: false, error: "Code must be 3–30 letters/numbers (no spaces)." };
  if (!Number.isFinite(i.value) || i.value <= 0 || (i.kind === "percent" && i.value > 100)) return { ok: false, error: i.kind === "percent" ? "Percent must be between 1 and 100." : "Flat discount must be more than 0." };
  const f = readCouponFile();
  if (f.coupons.some((c) => c.code.toUpperCase() === code)) return { ok: false, error: `${code} already exists.` };
  const c: CouponRow = { code, [i.kind === "percent" ? "percent_off" : "flat_off"]: i.value };
  if (i.productSlug) c.product_slug = i.productSlug;
  if (i.maxUses) c.max_uses = i.maxUses;
  if (i.expires) c.expires_at = `${i.expires}T23:59:59+05:30`;
  if (i.featured) { f.coupons.forEach((x) => { delete x.featured; }); c.featured = true; }
  f.coupons.push(c);
  write(f);
  return { ok: true, message: `Coupon ${code} created — it works on the site now.` };
}

export function toggleCoupon(code: string): Result {
  const f = readCouponFile();
  const c = f.coupons.find((x) => x.code === code);
  if (!c) return { ok: false, error: "Coupon not found." };
  c.is_active = c.is_active === false;
  write(f);
  return { ok: true, message: `${code} is now ${c.is_active ? "active" : "switched off"}.` };
}

export function deleteCoupon(code: string): Result {
  const f = readCouponFile();
  if (!f.coupons.some((x) => x.code === code)) return { ok: false, error: "Coupon not found." };
  f.coupons = f.coupons.filter((x) => x.code !== code);
  write(f);
  return { ok: true, message: `${code} deleted.` };
}
