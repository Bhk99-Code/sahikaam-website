export function rupees(n: number) {
  if (n === 0) return "Free";
  return "₹" + n.toLocaleString("en-IN");
}
export function percentOff(price: number, mrp: number | null) {
  return mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
}
export const TYPE_LABEL = { ebook: "Ebook", course: "Video course", bundle: "Bundle" } as const;
export const CATEGORY = {
  manufacturing: { label: "Manufacturing", color: "#E8590C", blurb: "Factories and production units, ₹10 L to ₹5 Cr+" },
  legal: { label: "Low-investment business", color: "#0C8A6E", blurb: "Legal businesses you can start small" },
  construction: { label: "Construction & contracting", color: "#1C7ED6", blurb: "Become a contractor, win projects" },
  bundle: { label: "Bundles", color: "#7048E8", blurb: "Everything together, best price" },
} as const;
