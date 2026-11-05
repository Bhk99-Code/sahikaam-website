import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";
import { uploadsDir } from "@/lib/storage";

const MAX_CHUNK = 8 * 1024 * 1024;
const MAX_TOTAL = 200 * 1024 * 1024;
const ID = /^[a-zA-Z0-9-]{8,64}$/;

/**
 * Owner-only chunked upload (the product editor sends big PDFs in small pieces, so a proxy size/time limit
 * or a slow connection cannot break it). POST ?id=<token>&offset=<bytes already stored>&total=<file size>
 * with the raw bytes as the body. Replies with how many bytes are stored, so the browser can resume.
 */
export async function POST(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ ok: false, error: "not allowed" }, { status: 403 });
  const q = new URL(req.url).searchParams;
  const id = q.get("id") ?? "";
  const offset = Number(q.get("offset"));
  const total = Number(q.get("total"));
  if (!ID.test(id) || !Number.isInteger(offset) || offset < 0 || !Number.isInteger(total) || total <= 0 || total > MAX_TOTAL) {
    return NextResponse.json({ ok: false, error: "bad upload request" }, { status: 400 });
  }
  const dir = uploadsDir();
  fs.mkdirSync(dir, { recursive: true });
  // forget abandoned uploads after a day
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    try { if (Date.now() - fs.statSync(fp).mtimeMs > 86_400_000) fs.rmSync(fp, { force: true }); } catch { /* ignore */ }
  }
  const part = path.join(dir, `${id}.part`);
  const have = fs.existsSync(part) ? fs.statSync(part).size : 0;
  if (offset === 0 && have > 0) fs.rmSync(part, { force: true });
  else if (offset !== have) return NextResponse.json({ ok: false, error: "out of order", received: have }, { status: 409 });

  const buf = Buffer.from(await req.arrayBuffer());
  if (buf.length === 0 || buf.length > MAX_CHUNK || offset + buf.length > total) return NextResponse.json({ ok: false, error: "bad chunk" }, { status: 400 });
  fs.appendFileSync(part, buf);
  const received = offset + buf.length;
  if (received === total) fs.renameSync(part, path.join(dir, `${id}.bin`));
  return NextResponse.json({ ok: true, received, done: received === total });
}
