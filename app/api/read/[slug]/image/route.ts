import fs from "fs";
import { NextResponse } from "next/server";
import { resolveBook } from "@/lib/readAccess";
import { pageCount, renderPage, rendererAvailable, watermark } from "@/lib/pageRender";
import { hit } from "@/lib/rateLimit";

const MAX_PER_MINUTE = 90;
const MAX_PER_DAY = 2500;

/** One watermarked page image (?n=1…). Signed in + owns the book + not scraping faster than a person reads. */
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const r = await resolveBook(req, params.slug);
  if (!r.ok) return r.res;
  if (!fs.existsSync(r.file)) {
    console.error("read: book file is missing on the server:", r.file);
    return NextResponse.json({ error: "file not available" }, { status: 404 });
  }
  if (!(await rendererAvailable())) return NextResponse.json({ error: "renderer unavailable" }, { status: 501 });
  if (!(await hit(`img-min:${r.user.id}`, MAX_PER_MINUTE, 60_000)) || !(await hit(`img-day:${r.user.id}`, MAX_PER_DAY, 86_400_000))) {
    return NextResponse.json({ error: "Too many pages too quickly. Please wait a minute." }, { status: 429 });
  }
  const n = Math.floor(Number(new URL(req.url).searchParams.get("n")));
  try {
    const total = await pageCount(r.file);
    if (!(n >= 1 && n <= total)) return NextResponse.json({ error: "no such page" }, { status: 404 });
    const img = await watermark(await renderPage(r.file, n), r.user.email ?? r.user.phone ?? r.user.id);
    return new NextResponse(img, {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex", "Content-Disposition": "inline" },
    });
  } catch (e) {
    console.error("read image", e);
    return NextResponse.json({ error: "could not render page" }, { status: 500 });
  }
}
