import fs from "fs";
import { NextResponse } from "next/server";
import { resolveBook } from "@/lib/readAccess";
import { pageCount, renderFailed, rendererAvailable } from "@/lib/pageRender";

/** Tells the reader how to open the book: page images (secure) or, only if this server cannot render, the old PDF mode. */
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const r = await resolveBook(req, params.slug);
  if (!r.ok) return r.res;
  if (!fs.existsSync(r.file)) {
    console.error("read: book file is missing on the server:", r.file);
    return NextResponse.json({ error: "file not available" }, { status: 404 });
  }
  const noStore = { "Cache-Control": "private, no-store" };
  if (!(await rendererAvailable())) return NextResponse.json({ mode: "pdf" }, { headers: noStore });
  try {
    return NextResponse.json({ mode: "image", pages: await pageCount(r.file) }, { headers: noStore });
  } catch (e) {
    console.error("read meta (falling back to PDF mode for this file)", r.file, e);
    renderFailed.add(r.file);
    return NextResponse.json({ mode: "pdf" }, { headers: noStore });
  }
}
