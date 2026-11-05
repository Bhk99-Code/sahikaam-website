import "server-only";
import fs from "fs";
import path from "path";

/**
 * Secure reading: the buyer never receives the PDF. Each page is rendered here to a JPEG (cached on disk),
 * stamped with the buyer's own email/number, and sent one page at a time (app/api/read/[slug]/image).
 * PAGES_DIR should be a persistent path on the live server; if it is not, pages simply re-render after a deploy.
 */
export const PAGES_DIR = process.env.PAGES_DIR || path.join(process.cwd(), "private", "pages");
const PAGE_WIDTH = 1500;
const MAX_PARALLEL = 2;
const DOC_TTL_MS = 10 * 60_000;
const nm = (p: string) => path.join(process.cwd(), "node_modules", p);

type Canvas = typeof import("@napi-rs/canvas");
let mods: Promise<{ pdfjs: any; canvas: Canvas } | null> | null = null;

class NapiCanvasFactory {
  constructor(private canvas: Canvas) {}
  create(w: number, h: number) { const canvas = this.canvas.createCanvas(w, h); return { canvas, context: canvas.getContext("2d") }; }
  reset(c: any, w: number, h: number) { c.canvas.width = w; c.canvas.height = h; }
  destroy(c: any) { c.canvas.width = 0; c.canvas.height = 0; }
}

function load() {
  mods ??= (async () => {
    try {
      const canvas = await import("@napi-rs/canvas");
      (globalThis as any).DOMMatrix ??= canvas.DOMMatrix;
      (globalThis as any).Path2D ??= canvas.Path2D;
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const font = path.join(process.cwd(), "assets", "fonts", "LiberationSans-Bold.ttf");
      if (fs.existsSync(font)) canvas.GlobalFonts.registerFromPath(font, "WM");
      return { pdfjs, canvas };
    } catch (e) {
      console.error("page renderer unavailable", e);
      return null;
    }
  })();
  return mods;
}

/** False when the native renderer could not load on this server (the reader then falls back to the old PDF mode). */
export async function rendererAvailable() { return Boolean(await load()); }

const docs = new Map<string, { doc: any; used: number }>();
async function openDoc(file: string) {
  const m = (await load())!;
  const st = fs.statSync(file);
  const key = `${file}|${st.size}|${Math.round(st.mtimeMs)}`;
  const now = Date.now();
  for (const [k, v] of docs) if (now - v.used > DOC_TTL_MS || (k.startsWith(file + "|") && k !== key)) { v.doc.destroy?.(); docs.delete(k); }
  let e = docs.get(key);
  if (!e) {
    if (docs.size >= 2) { const oldest = [...docs.entries()].sort((a, b) => a[1].used - b[1].used)[0]; oldest[1].doc.destroy?.(); docs.delete(oldest[0]); }
    const doc = await m.pdfjs.getDocument({
      data: new Uint8Array(fs.readFileSync(file)), canvasFactory: new NapiCanvasFactory(m.canvas),
      standardFontDataUrl: nm("pdfjs-dist/standard_fonts") + "/", cMapUrl: nm("pdfjs-dist/cmaps") + "/", cMapPacked: true,
      useSystemFonts: false, isEvalSupported: false, verbosity: 0,
    }).promise;
    e = { doc, used: now };
    docs.set(key, e);
  }
  e.used = now;
  return { doc: e.doc, dir: path.join(PAGES_DIR, path.basename(file).replace(/[^a-zA-Z0-9._-]/g, "_") + `-${st.size}-${Math.round(st.mtimeMs)}`) };
}

export async function pageCount(file: string): Promise<number> {
  return (await openDoc(file)).doc.numPages as number;
}

let running = 0;
const waiting: (() => void)[] = [];
async function slot<T>(fn: () => Promise<T>): Promise<T> {
  if (running >= MAX_PARALLEL) await new Promise<void>((r) => waiting.push(r));
  running++;
  try { return await fn(); } finally { running--; waiting.shift()?.(); }
}

/** The page as a plain JPEG (no watermark yet), rendered once and cached on disk. */
export async function renderPage(file: string, n: number): Promise<Buffer> {
  const { doc, dir } = await openDoc(file);
  const cached = path.join(dir, `${n}.jpg`);
  if (fs.existsSync(cached)) return fs.readFileSync(cached);
  return slot(async () => {
    if (fs.existsSync(cached)) return fs.readFileSync(cached);
    const m = (await load())!;
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const vp = page.getViewport({ scale: PAGE_WIDTH / base.width });
    const canvas = m.canvas.createCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
    await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
    page.cleanup?.();
    const buf = canvas.toBuffer("image/jpeg", 84);
    try {
      fs.mkdirSync(dir, { recursive: true });
      const tmp = `${cached}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, buf);
      fs.renameSync(tmp, cached);
    } catch (e) { console.error("page cache write", e); }
    return buf;
  });
}

/** Stamps the buyer's own email/number across the page (and in the footer) so a leaked page can be traced. */
export async function watermark(page: Buffer, who: string): Promise<Buffer> {
  const m = (await load())!;
  const img = await m.canvas.loadImage(page);
  const c = m.canvas.createCanvas(img.width, img.height);
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const family = m.canvas.GlobalFonts.has("WM") ? "WM" : "sans-serif";
  const size = Math.round(img.width / 34);
  ctx.save();
  ctx.font = `bold ${size}px ${family}`;
  ctx.fillStyle = "rgba(30,30,45,0.085)";
  ctx.textAlign = "center";
  ctx.translate(img.width / 2, img.height / 2);
  ctx.rotate(-Math.PI / 6);
  const stepY = size * 5.5, stepX = ctx.measureText(who).width + size * 3;
  const reach = Math.hypot(img.width, img.height);
  for (let y = -reach, row = 0; y < reach; y += stepY, row++) {
    for (let x = -reach + (row % 2 ? stepX / 2 : 0); x < reach; x += stepX) ctx.fillText(who, x, y);
  }
  ctx.restore();
  ctx.font = `${Math.round(img.width / 80)}px ${family}`;
  ctx.fillStyle = "rgba(60,60,70,0.55)";
  ctx.textAlign = "center";
  ctx.fillText(`Licensed to ${who} · SahiKaam · not for sharing`, img.width / 2, img.height - Math.round(img.width / 55));
  return c.toBuffer("image/jpeg", 82);
}
