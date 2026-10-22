import type { Product } from "@/lib/types";

type Size = "sm" | "md" | "lg";

/** Book cover with a soft colour glow. Bundles show their books fanned out. */
export function BookCover({ product, size = "md", covers = [] }: { product: Product; size?: Size; covers?: string[] }) {
  const box = size === "lg" ? "w-[210px] sm:w-[240px]" : size === "sm" ? "w-[56px]" : "w-full";
  if (product.type === "bundle" && covers.length) return <BundleStack covers={covers} size={size} accent={product.accent} />;
  return (
    <div className={`relative ${box} shrink-0`}>
      {size !== "sm" && (
        <div aria-hidden="true" className="absolute inset-x-[12%] bottom-[-6%] top-[20%] rounded-full opacity-60 blur-2xl" style={{ background: product.accent }} />
      )}
      <div className="relative aspect-[3/4] overflow-hidden rounded-[6px_12px_12px_6px] shadow-lift ring-1 ring-ink/10">
        {product.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.cover_url} alt={`${product.title} cover`} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full flex-col justify-between p-3 text-night" style={{ background: product.accent }}>
            <span className="text-[10px] font-bold tracking-[0.2em] opacity-70">SAHIKAAM</span>
            <span className={`font-display font-extrabold leading-tight ${size === "lg" ? "text-[22px]" : "text-[13px]"}`}>{product.title}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function BundleStack({ covers, size, accent }: { covers: string[]; size: Size; accent: string }) {
  const w = size === "lg" ? "w-[150px] sm:w-[170px]" : size === "sm" ? "w-[34px]" : "w-[46%]";
  const tilt = ["-rotate-[10deg] -translate-x-[45%]", "z-10", "rotate-[10deg] translate-x-[45%]"];
  return (
    <div className={`relative flex items-center justify-center ${size === "lg" ? "h-[260px] w-[300px]" : size === "sm" ? "h-[76px] w-[56px]" : "aspect-[3/4] w-full"}`}>
      <div aria-hidden="true" className="absolute inset-[15%] rounded-full opacity-60 blur-2xl" style={{ background: accent }} />
      {covers.slice(0, 3).map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="" loading="lazy"
          className={`absolute ${w} aspect-[3/4] rounded-[6px] object-cover shadow-lift ring-1 ring-ink/10 ${tilt[i] ?? ""}`} />
      ))}
    </div>
  );
}
