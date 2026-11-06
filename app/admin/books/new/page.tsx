import type { Metadata } from "next";
import { editorOptions } from "../editorData";
import { ProductEditor, type EditorProduct } from "../ProductEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Add product", robots: { index: false } };

const empty: EditorProduct = {
  slug: "", type: "ebook", title: "", subtitle: "", description: "", category: "", badge: "", level: "", price: "", mrp: "", sortOrder: "", published: true,
  highlights: [], inside: [], learn: [], chapters: [], cover: "", gallery: [],
  editions: { hi: { pages: "", soon: false, file: "", parts: false }, en: { pages: "", soon: false, file: "", parts: false } }, bonus: [],
  bundleItems: [], includeAll: false, accessDays: "", noCoupon: false,
};

export default function NewProductPage() {
  const { categories } = editorOptions();
  return (
    <div>
      <h1 className="font-display text-[28px] font-extrabold text-cream">Add product</h1>
      <p className="mb-6 mt-1 text-[14px] text-fog">Fill in what the book page should show. You can save it hidden as a draft and publish later.</p>
      <ProductEditor initial={empty} categories={categories} />
    </div>
  );
}
