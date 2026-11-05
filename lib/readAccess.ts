import "server-only";
import path from "path";
import { NextResponse } from "next/server";
import { getUser, ownsProduct, findProduct, pickEdition } from "@/lib/data";
import type { User } from "@/lib/auth";

const BOOKS_DIR = process.env.BOOKS_DIR || path.join(process.cwd(), "private", "books");

/** Shared by the reader routes: signed in + owns the book + the file is inside BOOKS_DIR. */
export async function resolveBook(req: Request, slug: string):
  Promise<{ ok: true; user: User; file: string; lang: string; part: number } | { ok: false; res: NextResponse }> {
  const fail = (error: string, status: number) => ({ ok: false as const, res: NextResponse.json({ error }, { status }) });
  const user = await getUser();
  if (!user) return fail("login required", 401);
  const product = findProduct(slug);
  const q = new URL(req.url).searchParams;
  const part = Number(q.get("part") ?? 0);
  const edition = product ? pickEdition(product, q.get("lang")) : null;
  const fileName = edition?.parts?.length ? edition.parts[part]?.file : edition?.file_path;
  if (!product || !edition || !fileName) return fail("file not found", 404);
  if (!(await ownsProduct(user.id, product.slug))) return fail("not purchased", 403);
  const file = path.resolve(BOOKS_DIR, fileName);
  if (!file.startsWith(path.resolve(BOOKS_DIR) + path.sep)) return fail("bad path", 400);
  return { ok: true, user, file, lang: edition.lang, part };
}
