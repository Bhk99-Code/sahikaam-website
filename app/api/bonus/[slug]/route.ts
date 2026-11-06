import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getUser, ownsProduct, findProduct } from "@/lib/data";

import { bonusDir } from "@/lib/storage";
const TYPES: Record<string, string> = {
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/** Downloads a book's bonus file (?i=0) — only for a signed-in buyer. The file is never public. */
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "login required" }, { status: 401 });
  const product = findProduct(params.slug);
  const bonus = product?.bonus[Number(new URL(req.url).searchParams.get("i") ?? 0)];
  if (!product || !bonus) return NextResponse.json({ error: "file not found" }, { status: 404 });
  if (!(await ownsProduct(user.id, product.slug))) return NextResponse.json({ error: "not purchased" }, { status: 403 });

  const base = bonusDir();
  const file = path.resolve(base, bonus.file);
  if (!file.startsWith(path.resolve(base) + path.sep)) return NextResponse.json({ error: "bad path" }, { status: 400 });
  if (!fs.existsSync(file)) return NextResponse.json({ error: "file not available" }, { status: 404 });
  const data = await fs.promises.readFile(file);
  return new NextResponse(data, {
    headers: {
      "Content-Type": TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${path.basename(file).replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
