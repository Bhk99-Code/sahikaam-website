import type { Product } from "@/lib/types";

export function BookCover({ product, size = "md" }: { product: Product; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "w-[170px] h-[238px] p-4" : size === "sm" ? "w-[60px] h-[82px] p-1.5" : "w-full aspect-[3/4] p-3";
  const title = size === "lg" ? "text-[19px]" : size === "sm" ? "text-[8px]" : "text-[13px]";
  if (product.cover_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={product.cover_url} alt={product.title} className={`${dims.split(" p-")[0]} rounded-lg object-cover shadow-card`} />;
  }
  return (
    <div className={`${dims} flex shrink-0 flex-col justify-between overflow-hidden hyphens-auto rounded-[6px_12px_12px_6px] text-white`}
      style={{ background: product.cover_color || "#C2410C", boxShadow: size === "lg" ? "0 16px 30px rgba(154,52,18,0.30)" : undefined }}>
      {size !== "sm" && <span className="text-[10px] font-bold tracking-[0.15em] text-white/75">SAHIKAAM</span>}
      <span className={`${title} font-extrabold leading-tight`}>{product.title}</span>
      {size === "lg" && product.subtitle && <span className="text-[11px] text-white/75">{product.subtitle}</span>}
    </div>
  );
}
