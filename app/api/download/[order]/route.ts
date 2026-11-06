import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { one } from "@/lib/db";
import { findProduct } from "@/lib/data";
import { validDownloadToken } from "@/lib/downloadToken";
import { hit } from "@/lib/rateLimit";
import { bonusDir } from "@/lib/storage";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".heic": "image/heic",
  ".zip": "application/zip", ".pdf": "application/pdf", ".mp4": "video/mp4",
};

/**
 * Instant download right after payment — no sign-in needed. GET /api/download/<orderId>?t=<token>&i=<file number>.
 * Works only for a PAID order, with the token the payment step handed to the buyer's browser (and emailed).
 */
export async function GET(req: Request, { params }: { params: { order: string } }) {
  const q = new URL(req.url).searchParams;
  if (!validDownloadToken(params.order, q.get("t") ?? "")) return NextResponse.json({ error: "This download link is not valid." }, { status: 403 });
  if (!(await hit(`dl:${params.order}`, 60, 3_600_000))) return NextResponse.json({ error: "Too many downloads. Please try again later." }, { status: 429 });

  const order = await one<{ product_slug: string; status: string }>("SELECT product_slug, status FROM orders WHERE id = ?", [params.order]);
  if (!order || order.status !== "paid") return NextResponse.json({ error: "Payment not confirmed yet. Please wait a moment and refresh." }, { status: 402 });
  const product = findProduct(order.product_slug);
  const item = product?.bonus[Number(q.get("i") ?? 0)];
  if (!product || !item) return NextResponse.json({ error: "file not found" }, { status: 404 });

  const base = bonusDir();
  const file = path.resolve(base, item.file);
  if (!file.startsWith(path.resolve(base) + path.sep)) return NextResponse.json({ error: "bad path" }, { status: 400 });
  if (!fs.existsSync(file)) {
    console.error("download: file missing on the server:", file);
    return NextResponse.json({ error: "file not available" }, { status: 404 });
  }
  return new NextResponse(await fs.promises.readFile(file), {
    headers: {
      "Content-Type": TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${path.basename(file).replace(/[^\w.\- ]+/g, "_")}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
