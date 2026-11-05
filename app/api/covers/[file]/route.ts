import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const COVERS_DIR = process.env.COVERS_DIR || path.join(process.cwd(), "private", "covers");
const TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

/** Serves a book cover uploaded from /admin/books (public, like the covers in public/covers). */
export async function GET(_req: Request, { params }: { params: { file: string } }) {
  const name = path.basename(params.file);
  const type = TYPES[path.extname(name).toLowerCase()];
  const file = path.join(COVERS_DIR, name);
  if (!type || !fs.existsSync(file)) return NextResponse.json({ error: "not found" }, { status: 404 });
  return new NextResponse(await fs.promises.readFile(file), {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
