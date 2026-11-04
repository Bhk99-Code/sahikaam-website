import { NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { markPaidAndGrant } from "@/lib/grant";
import { run } from "@/lib/db";

/**
 * Same as /api/checkout/verify, for a guest checkout (app/checkout/[slug]/GuestCheckoutClient.tsx)
 * that has no session yet to check ownership against. Razorpay's own signature — which only it can
 * produce, for this exact order_id/payment_id pair — is the authorization here instead.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const orderId = String(body.razorpay_order_id || "");
  const paymentId = String(body.razorpay_payment_id || "");
  const signature = String(body.razorpay_signature || "");
  if (!orderId || !paymentId || !signature) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  if (!verifyPaymentSignature(orderId, paymentId, signature)) {
    await run("UPDATE orders SET status = 'failed' WHERE razorpay_order_id = ? AND status = 'created'", [orderId]);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const r = await markPaidAndGrant(orderId, paymentId);
  return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.reason }, { status: 404 });
}
