"use client";
import { useState } from "react";

const LABELS = ["3D front", "3D back", "Front cover", "Back cover"];

/** Book page images: 3D front/back mockups plus the flat covers, with thumbnails. */
export function BookGallery({ images, title, accent }: { images: string[]; title: string; accent: string }) {
  const [i, setI] = useState(0);
  const flat = i >= 2;
  return (
    <div className="flex w-full max-w-[420px] flex-col items-center gap-4">
      <div className="relative flex aspect-[700/860] w-full items-center justify-center">
        <div aria-hidden="true" className="absolute inset-x-[15%] bottom-[8%] top-[22%] rounded-full opacity-50 blur-3xl" style={{ background: accent }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={images[i]} src={images[i]} alt={`${title} — ${LABELS[i] ?? "image"}`}
          className={`relative ${flat ? "h-[86%] w-auto rounded-[6px_12px_12px_6px] shadow-lift ring-1 ring-ink/10" : "h-full w-full object-contain"}`} />
      </div>
      <div role="tablist" aria-label="Book images" className="flex gap-2.5">
        {images.map((src, n) => (
          <button key={src} role="tab" aria-selected={n === i} aria-label={LABELS[n] ?? `Image ${n + 1}`} onClick={() => setI(n)}
            className={`h-[72px] w-[56px] overflow-hidden rounded-lg border-2 bg-night-3 p-1 transition ${n === i ? "border-saffron-500" : "border-ink/10 hover:border-ink/30"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-contain" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}
