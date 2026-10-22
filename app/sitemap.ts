import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data";
import { SITE_URL } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/books", "/help", "/contact", "/terms", "/privacy", "/refund-policy", "/delivery-policy"];
  const products = await getProducts();
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}` })),
    ...products.map((p) => ({ url: `${SITE_URL}/book/${p.slug}` })),
  ];
}
