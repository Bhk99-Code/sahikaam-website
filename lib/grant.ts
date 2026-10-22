import "server-only";
import { one, run } from "./db";
import { findProduct } from "./data";

/**
 * Marks an order paid and gives the buyer access to the product
 * (plus every product listed in its bundle_items). Safe to call twice:
 * the verify route and the webhook may both run for one payment.
 * `paidAmountPaise`, when given, must match the order amount.
 */
export async function markPaidAndGrant(razorpayOrderId: string, razorpayPaymentId: string | null, paidAmountPaise?: number) {
  const order = await one<{ id: string; user_id: string; product_slug: string; amount: number; status: string }>(
    "SELECT id, user_id, product_slug, amount, status FROM orders WHERE razorpay_order_id = ?", [razorpayOrderId]);
  if (!order) return { ok: false as const, reason: "order not found" };
  if (paidAmountPaise != null && paidAmountPaise !== Number(order.amount) * 100) {
    console.error("amount mismatch", razorpayOrderId, paidAmountPaise, order.amount);
    return { ok: false as const, reason: "amount mismatch" };
  }

  if (order.status !== "paid") {
    await run("UPDATE orders SET status = 'paid', razorpay_payment_id = ?, paid_at = ? WHERE id = ? AND status <> 'paid'",
      [razorpayPaymentId, Date.now(), order.id]);
  }
  await grantProduct(order.user_id, order.product_slug, order.id);
  return { ok: true as const, orderId: order.id };
}

export async function grantProduct(userId: string, slug: string, orderId: string | null) {
  const product = findProduct(slug);
  // A timed pass (e.g. All Access for 365 days) gives its books the same end date; single books are lifetime.
  const expires = product?.access_days ? Date.now() + product.access_days * 86400_000 : null;
  const slugs = [slug, ...(product?.bundle_items ?? [])];
  for (const s of slugs) {
    const row = await one<{ expires_at: number | null }>("SELECT expires_at FROM purchases WHERE user_id = ? AND product_slug = ?", [userId, s]);
    if (!row) {
      await run("INSERT INTO purchases (user_id, product_slug, order_id, progress, created_at, expires_at) VALUES (?, ?, ?, 0, ?, ?)",
        [userId, s, orderId, Date.now(), expires]).catch(() => { /* a parallel call inserted it first */ });
    } else if (row.expires_at != null) {
      // Renewing or upgrading: lifetime wins, otherwise keep the later end date.
      const next = expires == null ? null : Math.max(Number(row.expires_at), expires);
      await run("UPDATE purchases SET expires_at = ? WHERE user_id = ? AND product_slug = ?", [next, userId, s]);
    }
  }
}
