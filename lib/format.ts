export function rupees(n: number) {
  if (n === 0) return "FREE";
  return "₹" + n.toLocaleString("en-IN");
}
export const TYPE_LABEL = { ebook: "Ebook", course: "Video Course", bundle: "Bundle" } as const;
