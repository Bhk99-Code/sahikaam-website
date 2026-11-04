import "server-only";
import { one, run } from "./db";
import { findProduct } from "./data";
import { createMagicLink } from "./magicLink";
import { sendMail } from "./mail";
import { sendCode } from "./auth";
import { isEmailConfigured, isSmsConfigured, isProduction, SITE_URL } from "./env";

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

  const wasAlreadyPaid = order.status === "paid";
  if (!wasAlreadyPaid) {
    await run("UPDATE orders SET status = 'paid', razorpay_payment_id = ?, paid_at = ? WHERE id = ? AND status <> 'paid'",
      [razorpayPaymentId, Date.now(), order.id]);
  }
  await grantProduct(order.user_id, order.product_slug, order.id);
  // Only on the first paid transition — a guest checkout (app/checkout/[slug]/GuestCheckoutClient.tsx)
  // never verified a code, so this is how they get into their account: a one-tap link for an
  // email buyer, or the normal 6-digit sign-in code (already-approved channel) for a phone buyer.
  if (!wasAlreadyPaid) sendAccessMessage(order.user_id).catch((e) => console.error("sendAccessMessage", e));
  return { ok: true as const, orderId: order.id };
}

export async function sendAccessMessage(userId: string) {
  const user = await one<{ email: string | null; phone: string | null }>("SELECT email, phone FROM users WHERE id = ?", [userId]);
  if (!user) return;
  if (user.email && isEmailConfigured) {
    const token = await createMagicLink(userId);
    const link = `${SITE_URL}/magic/${token}`;
    await sendMail(
      user.email,
      "Your SahiKaam book is ready",
      `<div style="font-family:sans-serif;font-size:16px"><h2>Payment received 🎉</h2><p>Your book is ready. Tap below to open your library — no password needed:</p><p><a href="${link}" style="display:inline-block;background:#FF6A00;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold">Open my library</a></p><p>This link works for 7 days and signs you in automatically.</p></div>`,
      `Payment received! Open your library: ${link}\nThis link works for 7 days.`
    );
  } else if (user.phone && isSmsConfigured) {
    // Reuses the buyer's normal sign-in code flow (lib/auth.ts) so /login's existing "6-digit
    // code" box verifies it the same way as any other mobile sign-in — no new channel needed.
    await sendCode({ kind: "phone", value: user.phone });
  } else if (!isProduction) {
    // Local preview with no SMTP/SMS configured: print the link instead of losing it silently,
    // same convention as lib/auth.ts's sendCode devMode branch.
    if (user.email) console.log(`[local preview] magic link for ${user.email}: ${SITE_URL}/magic/${await createMagicLink(userId)}`);
    else if (user.phone) console.log(`[local preview] would send a sign-in code to ${user.phone}, but SMS isn't configured locally`);
  }
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
