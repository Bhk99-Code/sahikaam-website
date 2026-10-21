import "server-only";
import { supabaseAdmin } from "./supabase-server";

export type PriceResult =
  | { ok: true; amount: number; discount: number; coupon: string | null }
  | { ok: false; error: string };

/** Works out the final price on the SERVER — never trust a price sent from the browser. */
export async function priceWithCoupon(product: { slug: string; price: number }, rawCode?: string | null): Promise<PriceResult> {
  const code = (rawCode || "").trim().toUpperCase();
  if (!code) return { ok: true, amount: product.price, discount: 0, coupon: null };

  const { data: c } = await supabaseAdmin().from("coupons").select("*").eq("code", code).maybeSingle();
  if (!c || !c.is_active) return { ok: false, error: "Ye coupon valid nahi hai" };
  if (c.expires_at && new Date(c.expires_at) < new Date()) return { ok: false, error: "Coupon expire ho chuka hai" };
  if (c.max_uses != null && c.used_count >= c.max_uses) return { ok: false, error: "Coupon ki limit poori ho gayi" };
  if (c.product_slug && c.product_slug !== product.slug) return { ok: false, error: "Ye coupon is product par nahi chalega" };

  let discount = 0;
  if (c.percent_off) discount = Math.floor((product.price * c.percent_off) / 100);
  else if (c.flat_off) discount = c.flat_off;
  discount = Math.min(discount, product.price);
  return { ok: true, amount: product.price - discount, discount, coupon: code };
}
