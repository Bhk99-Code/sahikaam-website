import "server-only";
import couponFile from "@/content/coupons.json";
import { one } from "./db";

export type PriceResult =
  | { ok: true; amount: number; discount: number; coupon: string | null }
  | { ok: false; error: string };

type Coupon = {
  code: string;
  percent_off?: number;
  flat_off?: number;
  product_slug?: string | null;
  max_uses?: number | null;
  expires_at?: string | null;
  is_active?: boolean;
  featured?: boolean;
};

const COUPONS = couponFile.coupons as Coupon[];

/** Works out the final price on the SERVER — never trust a price sent from the browser. */
export async function priceWithCoupon(product: { slug: string; price: number }, rawCode?: string | null): Promise<PriceResult> {
  const code = (rawCode || "").trim().toUpperCase();
  if (!code) return { ok: true, amount: product.price, discount: 0, coupon: null };

  const c = COUPONS.find((x) => x.code.toUpperCase() === code);
  if (!c || c.is_active === false) return { ok: false, error: "This coupon is not valid" };
  if (c.expires_at && new Date(c.expires_at) < new Date()) return { ok: false, error: "This coupon has expired" };
  if (c.product_slug && c.product_slug !== product.slug) return { ok: false, error: "This coupon does not apply to this product" };
  if (c.max_uses != null) {
    const used = await one<{ n: number }>("SELECT COUNT(*) AS n FROM orders WHERE coupon_code = ? AND status = 'paid'", [code]);
    if (Number(used?.n ?? 0) >= c.max_uses) return { ok: false, error: "Coupon ki limit poori ho gayi" };
  }

  let discount = 0;
  if (c.percent_off) discount = Math.floor((product.price * c.percent_off) / 100);
  else if (c.flat_off) discount = c.flat_off;
  discount = Math.min(discount, product.price);
  return { ok: true, amount: product.price - discount, discount, coupon: code };
}

/** The coupon shown in the offer bar and pre-filled at checkout (marked "featured" in coupons.json). */
export function featuredCoupon(): { code: string; label: string } | null {
  const c = COUPONS.find((x) => x.featured && x.is_active !== false && !(x.expires_at && new Date(x.expires_at) < new Date()));
  if (!c) return null;
  const label = c.percent_off ? `${c.percent_off}% OFF` : c.flat_off ? `₹${c.flat_off} OFF` : "";
  return label ? { code: c.code.toUpperCase(), label } : null;
}
