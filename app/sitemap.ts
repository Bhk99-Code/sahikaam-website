import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data";
import { SITE_URL } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: [string, number][] = [["", 1], ["/books", 0.9], ["/contact", 0.6], ["/help", 0.5], ["/terms", 0.2], ["/privacy", 0.2], ["/refund-policy", 0.2], ["/delivery-policy", 0.2]];
  const products = await getProducts();
  return [
    ...pages.map(([p, priority]) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority })),
    ...products.map((p) => ({ url: `${SITE_URL}/book/${p.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: p.slug === "all-access" ? 0.95 : 0.8 })),
  ];
}
