import "server-only";
import fs from "fs";
import { getCategories } from "@/lib/categories";
import { productsReadPath } from "@/lib/storage";
import type { BookOption } from "./ProductEditor";

/** Every ebook (for the bundle picker) and the categories the owner can choose from. */
export function editorOptions(keepCategory?: string) {
  const products: any[] = JSON.parse(fs.readFileSync(productsReadPath(), "utf8")).products;
  const books: BookOption[] = products
    .filter((p) => p.type === "ebook" && !p.variant_of && p.is_published !== false)
    .map((p) => ({ slug: p.slug, title: p.title, price: Number(p.price) || 0, category: p.category ?? "", cover: p.cover_url ?? "" }));
  const categories = getCategories().filter((c) => !c.hidden || c.key === keepCategory).map((c) => ({ key: c.key, label: c.label }));
  return { books, categories };
}
