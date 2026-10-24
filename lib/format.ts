export function rupees(n: number) {
  if (n === 0) return "Free";
  return "₹" + n.toLocaleString("en-IN");
}
export function percentOff(price: number, mrp: number | null) {
  return mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
}
/** "Lifetime access", "1 year access" or "6 months access". */
export function accessLabel(days: number | null | undefined) {
  if (!days) return "Lifetime access";
  if (days % 365 === 0) return days === 365 ? "1 year access" : `${days / 365} years access`;
  const m = Math.round(days / 30.4); // 183 days = 6 months
  if (m > 0 && Math.abs(days - m * 30.4) <= 3) return m === 1 ? "1 month access" : `${m} months access`;
  return `${days} days access`;
}
export const TYPE_LABEL = { ebook: "Ebook", course: "Video course", bundle: "Bundle" } as const;
export const CATEGORY = {
  manufacturing: { label: "Manufacturing", color: "#FF6A00", blurb: "Factories and production units, ₹10 L to ₹5 Cr+" },
  legal: { label: "Low-investment business", color: "#FF8A3D", blurb: "Legal businesses you can start small" },
  construction: { label: "Construction & contracting", color: "#FFA866", blurb: "Become a contractor, win projects" },
  "food-agro": { label: "Food & agro", color: "#FF8A3D", blurb: "Food processing and farm-waste businesses" },
  funding: { label: "Loans & funding", color: "#FFB27A", blurb: "Government loans and subsidies" },
  startup: { label: "Startup basics", color: "#FFC59A", blurb: "Test ideas, pick franchises" },
  government: { label: "Government business", color: "#FFB27A", blurb: "Win tenders and sell on GeM" },
  energy: { label: "Solar & EV", color: "#FFC23D", blurb: "Solar installation and EV charging work" },
  online: { label: "Online & AI", color: "#FFC59A", blurb: "Sell online and earn with AI services" },
  "real-estate": { label: "Real estate", color: "#FFA866", blurb: "Plotting, townships and property valuation" },
  trade: { label: "Export & trade", color: "#FF8A3D", blurb: "Export from India, step by step" },
  bundle: { label: "Bundles", color: "#FFFFFF", blurb: "Everything together, best price" },
} as const;
