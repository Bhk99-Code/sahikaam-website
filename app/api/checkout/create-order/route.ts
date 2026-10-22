import crypto from "crypto";
import { NextResponse } from "next/server";
import { getProduct, getUser, ownsProduct } from "@/lib/data";
import { priceWithCoupon } from "@/lib/pricing";
import { createRazorpayOrder } from "@/lib/razorpay";
import { one, run } from "@/lib/db";
import { grantProduct } from "@/lib/grant";
import { isRazorpayConfigured } from "@/lib/env";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Pehle login karein" }, { status: 401 });

  const { slug, coupon } = await req.json().catch(() => ({}));
  const product = await getProduct(String(slug || ""));
  if (!product) return NextResponse.json({ error: "Product nahi mila" }, { status: 404 });
  if (await ownsProduct(user.id, product.slug)) return NextResponse.json({ error: "Ye aapki Library mein pehle se hai" }, { status: 409 });

  const price = await priceWithCoupon(product, coupon);
  if (!price.ok) return NextResponse.json({ error: price.error }, { status: 400 });

  const now = Date.now();

  // Free product or 100% coupon: no payment needed
  if (price.amount === 0) {
    const id = crypto.randomUUID();
    await run("INSERT INTO orders (id, user_id, product_slug, amount, coupon_code, status, created_at, paid_at) VALUES (?, ?, ?, 0, ?, 'paid', ?, ?)",
      [id, user.id, product.slug, price.coupon, now, now]);
    await grantProduct(user.id, product.slug, id);
    return NextResponse.json({ free: true });
  }

  if (!isRazorpayConfigured) return NextResponse.json({ error: "Online payment jald shuru hoga. Abhi WhatsApp/email par sampark karein." }, { status: 503 });

  // Reuse a recent unpaid order for the same product and price instead of creating duplicates
  const recent = await one<{ razorpay_order_id: string }>(
    "SELECT razorpay_order_id FROM orders WHERE user_id = ? AND product_slug = ? AND amount = ? AND status = 'created' AND created_at > ? ORDER BY created_at DESC",
    [user.id, product.slug, price.amount, now - 15 * 60_000]);
  if (recent?.razorpay_order_id) return NextResponse.json({ orderId: recent.razorpay_order_id, amount: price.amount });

  const id = crypto.randomUUID();
  let rzpOrder;
  try {
    rzpOrder = await createRazorpayOrder(price.amount, id.slice(0, 36), { product: product.slug, user_id: user.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Payment gateway se connect nahi ho paya. Thodi der baad try karein." }, { status: 502 });
  }
  await run("INSERT INTO orders (id, user_id, product_slug, amount, coupon_code, razorpay_order_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'created', ?)",
    [id, user.id, product.slug, price.amount, price.coupon, rzpOrder.id, now]);
  return NextResponse.json({ orderId: rzpOrder.id, amount: price.amount });
}
