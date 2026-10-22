import { NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { markPaidAndGrant } from "@/lib/grant";
import { getUser } from "@/lib/data";
import { one, run } from "@/lib/db";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "login required" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const orderId = String(body.razorpay_order_id || "");
  const paymentId = String(body.razorpay_payment_id || "");
  const signature = String(body.razorpay_signature || "");
  if (!orderId || !paymentId || !signature) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  // make sure this order belongs to the signed-in user
  const order = await one<{ user_id: string }>("SELECT user_id FROM orders WHERE razorpay_order_id = ?", [orderId]);
  if (!order || order.user_id !== user.id) return NextResponse.json({ error: "order mismatch" }, { status: 403 });

  if (!verifyPaymentSignature(orderId, paymentId, signature)) {
    await run("UPDATE orders SET status = 'failed' WHERE razorpay_order_id = ? AND status = 'created'", [orderId]);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const r = await markPaidAndGrant(orderId, paymentId);
  return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.reason }, { status: 404 });
}
