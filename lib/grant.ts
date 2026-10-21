import "server-only";
import { supabaseAdmin } from "./supabase-server";

/**
 * Marks an order paid and gives the buyer access to the product
 * (plus every product listed in its bundle_items). Safe to call twice:
 * the verify route and the webhook may both run for one payment.
 */
export async function markPaidAndGrant(razorpayOrderId: string, razorpayPaymentId: string | null) {
  const admin = supabaseAdmin();
  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, product_id, status, coupon_code")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();
  if (!order) return { ok: false as const, reason: "order not found" };

  if (order.status !== "paid") {
    const { data: updated } = await admin
      .from("orders")
      .update({ status: "paid", razorpay_payment_id: razorpayPaymentId, paid_at: new Date().toISOString() })
      .eq("id", order.id)
      .neq("status", "paid")
      .select("id");
    // only the call that actually flipped the status counts the coupon use
    if (updated && updated.length && order.coupon_code) {
      await admin.rpc("increment_coupon", { p_code: order.coupon_code });
    }
  }

  await grantProduct(order.user_id, order.product_id, order.id);
  return { ok: true as const, orderId: order.id };
}

export async function grantProduct(userId: string, productId: string, orderId: string | null) {
  const admin = supabaseAdmin();
  const { data: product } = await admin.from("products").select("id, bundle_items").eq("id", productId).single();
  const ids = [productId];
  if (product?.bundle_items?.length) {
    const { data: extras } = await admin.from("products").select("id").in("slug", product.bundle_items);
    extras?.forEach((e) => ids.push(e.id));
  }
  const rows = ids.map((pid) => ({ user_id: userId, product_id: pid, order_id: orderId }));
  await admin.from("purchases").upsert(rows, { onConflict: "user_id,product_id", ignoreDuplicates: true });
}
