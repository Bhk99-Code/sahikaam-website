import "server-only";
import { one, run } from "./db";
import { findProduct } from "./data";
import { createMagicLink } from "./magicLink";
import { sendMail } from "./mail";
import { sendCode } from "./auth";
import { isEmailConfigured, isProduction, SITE_URL } from "./env";
import { downloadToken } from "./downloadToken";

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
  // email buyer, or the 6-digit code (used on Forgot password) for a phone buyer.
  if (!wasAlreadyPaid) sendAccessMessage(order.user_id, order.id).catch((e) => console.error("sendAccessMessage", e));
  return { ok: true as const, orderId: order.id };
}

export async function sendAccessMessage(userId: string, orderId?: string) {
  const user = await one<{ email: string | null; phone: string | null }>("SELECT email, phone FROM users WHERE id = ?", [userId]);
  if (!user) return;
  if (user.email && isEmailConfigured) {
    const token = await createMagicLink(userId);
    const link = `${SITE_URL}/magic/${token}`;
    // A download product (e.g. the wallpaper): put the direct download links in the email as well.
    const order = orderId ? await one<{ product_slug: string }>("SELECT product_slug FROM orders WHERE id = ?", [orderId]) : null;
    const dl = order ? findProduct(order.product_slug) : null;
    if (orderId && dl?.type === "download" && dl.bonus.length) {
      const links = dl.bonus.map((b, i) => ({ title: b.title, url: `${SITE_URL}/api/download/${orderId}?t=${downloadToken(orderId)}&i=${i}` }));
      await sendMail(
        user.email,
        `Your download is ready — ${dl.title}`,
        `<div style="font-family:sans-serif;font-size:16px"><h2>Payment received 🎉</h2><p>Your <b>${dl.title}</b> is ready. Download it any time with the link below (no login needed):</p>${links.map((l) => `<p><a href="${l.url}" style="display:inline-block;background:#FF6A00;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold">Download ${l.title}</a></p>`).join("")}</div>`,
        `Payment received! Download ${dl.title}:\n${links.map((l) => `${l.title}: ${l.url}`).join("\n")}`
      );
      return;
    }
    await sendMail(
      user.email,
      "Your SahiKaam book is ready",
      `<div style="font-family:sans-serif;font-size:16px"><h2>Payment received 🎉</h2><p>Your book is ready. Tap below to open your library and set a password for next time:</p><p><a href="${link}" style="display:inline-block;background:#FF6A00;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold">Open my library</a></p><p>This link works for 7 days and signs you in automatically. After that, use Forgot password on the sign-in page.</p></div>`,
      `Payment received! Open your library: ${link}\nThis link works for 7 days.`
    );
  } else if (!isProduction) {
    if (user.email) console.log(`[local preview] magic link for ${user.email}: ${SITE_URL}/magic/${await createMagicLink(userId)}`);
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
