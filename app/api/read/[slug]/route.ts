import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getUser, ownsProduct, findProduct } from "@/lib/data";

const BOOKS_DIR = process.env.BOOKS_DIR || path.join(process.cwd(), "private", "books");

/** Streams the ebook PDF — only to a signed-in buyer. The file is never public. */
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "login required" }, { status: 401 });
  const product = findProduct(params.slug);
  const part = Number(new URL(req.url).searchParams.get("part") ?? 0);
  const fileName = product?.parts.length ? product.parts[part]?.file : product?.file_path;
  if (!product || !fileName) return NextResponse.json({ error: "file not found" }, { status: 404 });
  if (!(await ownsProduct(user.id, product.slug))) return NextResponse.json({ error: "not purchased" }, { status: 403 });

  const file = path.resolve(BOOKS_DIR, fileName);
  if (!file.startsWith(path.resolve(BOOKS_DIR) + path.sep)) return NextResponse.json({ error: "bad path" }, { status: 400 });
  if (!fs.existsSync(file)) return NextResponse.json({ error: "file not available" }, { status: 404 });
  const data = await fs.promises.readFile(file);
  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
