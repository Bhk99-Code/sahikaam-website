import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { markPaidAndGrant } from "@/lib/grant";

/**
 * Razorpay Dashboard > Webhooks > Add:
 *   URL:    https://YOUR-DOMAIN/api/webhooks/razorpay
 *   Secret: same as RAZORPAY_WEBHOOK_SECRET
 *   Events: payment.captured, order.paid
 * Backup path — gives access even if the buyer closed the tab before the
 * browser could confirm the payment.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") || "";
  if (!process.env.RAZORPAY_WEBHOOK_SECRET || !verifyWebhookSignature(raw, sig)) {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }
  const event = JSON.parse(raw);
  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = event.payload?.payment?.entity;
    const orderId = payment?.order_id || event.payload?.order?.entity?.id;
    if (orderId) await markPaidAndGrant(orderId, payment?.id ?? null);
  }
  return NextResponse.json({ ok: true });
}
