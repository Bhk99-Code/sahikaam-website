"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";

type Props = { slug: string; title: string; parts: string[]; part: number; startPage: number; watermark: string };

export function Reader({ slug, title, parts, part, startPage, watermark }: Props) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<any>(null);
  const renderTask = useRef<any>(null);
  const [page, setPage] = useState(startPage);
  const [pages, setPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [jump, setJump] = useState("");

  // load the document once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/read/${slug}?part=${part}`, { cache: "no-store" });
        if (!res.ok) throw new Error("no access");
        const data = new Uint8Array(await res.arrayBuffer());
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const doc = await pdfjs.getDocument({ data }).promise;
        if (cancelled) return;
        docRef.current = doc;
        setPages(doc.numPages);
        setPage((p) => Math.min(p, doc.numPages));
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => { cancelled = true; };
  }, [slug, part]);

  const render = useCallback(async () => {
    const doc = docRef.current;
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!doc || !canvas || !box) return;
    const pdfPage = await doc.getPage(page);
    const base = pdfPage.getViewport({ scale: 1 });
    const fit = Math.min(box.clientWidth - 24, 900) / base.width;
    const dpr = window.devicePixelRatio || 1;
    const viewport = pdfPage.getViewport({ scale: fit * zoom * dpr });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = `${viewport.width / dpr}px`;
    canvas.style.height = `${viewport.height / dpr}px`;
    renderTask.current?.cancel?.();
    renderTask.current = pdfPage.render({ canvasContext: canvas.getContext("2d")!, viewport });
    try { await renderTask.current.promise; } catch { /* cancelled */ }
  }, [page, zoom]);

  useEffect(() => { if (status === "ready") render(); }, [status, render]);
  useEffect(() => {
    const onResize = () => render();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [render]);

  // save progress (debounced)
  useEffect(() => {
    if (status !== "ready" || parts.length) return;
    const t = setTimeout(() => {
      fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, progress: page }) });
    }, 1200);
    return () => clearTimeout(t);
  }, [page, slug, status, parts.length]);

  // arrow keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowRight") setPage((p) => Math.min(pages || p, p + 1));
      if (e.key === "ArrowLeft") setPage((p) => Math.max(1, p - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pages]);

  const go = (n: number) => setPage(Math.min(Math.max(1, n), pages || 1));

  return (
    <div className="reader fixed inset-0 z-50 flex select-none flex-col bg-[#0E0E10] text-white" onContextMenu={(e) => e.preventDefault()}>
      <style>{`@media print { .reader { display: none !important; } }`}</style>
      <header className="flex items-center gap-2 px-3 py-3">
        <Link href="/library" aria-label="Back to library" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"><Icon name="back" /></Link>
        <span className="flex-1 truncate text-[15px] font-semibold">{title}</span>
        {parts.length > 0 && (
          <select aria-label="Chapter" value={part} onChange={(e) => router.push(`/read/${slug}?part=${e.target.value}`)}
            className="max-w-[45vw] rounded-lg bg-white/10 px-2 py-2 text-[14px] text-white outline-none">
            {parts.map((t, i) => <option key={i} value={i} className="text-black">{t}</option>)}
          </select>
        )}
        <button aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(1)))} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"><Icon name="zoomout" /></button>
        <button aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(2.4, +(z + 0.2).toFixed(1)))} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10"><Icon name="zoomin" /></button>
      </header>

      <div ref={boxRef} className="relative flex-1 overflow-auto">
        <div className="mx-auto flex min-h-full w-max min-w-full justify-center p-3">
          {status === "loading" && <p className="self-center text-white/70">Book khul rahi hai…</p>}
          {status === "error" && (
            <div className="self-center text-center">
              <p className="font-semibold">Book load nahi ho payi.</p>
              <p className="mt-1 text-[14px] text-white/60">Internet check karein, ya Help se contact karein.</p>
            </div>
          )}
          <div className={`relative ${status === "ready" ? "" : "hidden"}`}>
            <canvas ref={canvasRef} className="block bg-white shadow-2xl" />
            {/* watermark */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="absolute left-1/2 whitespace-nowrap text-[15px] font-bold text-black/[0.07]"
                  style={{ top: `${8 + i * 16}%`, transform: "translateX(-50%) rotate(-28deg)" }}>{watermark}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="flex h-[76px] items-center justify-center gap-5">
        <button aria-label="Previous page" onClick={() => go(page - 1)} disabled={page <= 1} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-30"><Icon name="back" /></button>
        <form onSubmit={(e) => { e.preventDefault(); if (jump) go(parseInt(jump, 10)); setJump(""); }} className="flex items-center gap-2 text-[20px] font-semibold">
          <label htmlFor="pg" className="sr-only">Page number</label>
          <input id="pg" inputMode="numeric" value={jump} onChange={(e) => setJump(e.target.value.replace(/\D/g, ""))} placeholder={String(page)}
            className="w-14 rounded-lg bg-white/10 py-1 text-center text-white placeholder:text-white outline-none focus:bg-white/20" />
          <span className="text-white/50">/ {pages || "–"}</span>
        </form>
        <button aria-label="Next page" onClick={() => go(page + 1)} disabled={page >= pages} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-30"><Icon name="chevron" /></button>
      </footer>
    </div>
  );
}
