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
};

const COUPONS = couponFile.coupons as Coupon[];

/** Works out the final price on the SERVER — never trust a price sent from the browser. */
export async function priceWithCoupon(product: { slug: string; price: number }, rawCode?: string | null): Promise<PriceResult> {
  const code = (rawCode || "").trim().toUpperCase();
  if (!code) return { ok: true, amount: product.price, discount: 0, coupon: null };

  const c = COUPONS.find((x) => x.code.toUpperCase() === code);
  if (!c || c.is_active === false) return { ok: false, error: "Ye coupon valid nahi hai" };
  if (c.expires_at && new Date(c.expires_at) < new Date()) return { ok: false, error: "Coupon expire ho chuka hai" };
  if (c.product_slug && c.product_slug !== product.slug) return { ok: false, error: "Ye coupon is product par nahi chalega" };
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
