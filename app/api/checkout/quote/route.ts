import { NextResponse } from "next/server";
import { getProduct } from "@/lib/data";
import { priceWithCoupon } from "@/lib/pricing";

export async function POST(req: Request) {
  const { slug, coupon } = await req.json().catch(() => ({}));
  const product = await getProduct(String(slug || ""));
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  const r = await priceWithCoupon(product, coupon);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json(r);
}
