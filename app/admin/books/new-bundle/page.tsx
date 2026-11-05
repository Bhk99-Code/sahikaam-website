import type { Metadata } from "next";
import { editorOptions } from "../editorData";
import { ProductEditor, type EditorProduct } from "../ProductEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Add bundle", robots: { index: false } };

const empty: EditorProduct = {
  slug: "", type: "bundle", title: "", subtitle: "", description: "", category: "bundle", badge: "", level: "", price: "", mrp: "", sortOrder: "", published: true,
  highlights: [], inside: [], learn: [], chapters: [], cover: "", gallery: [],
  editions: { hi: { pages: "", soon: false, file: "", parts: false }, en: { pages: "", soon: false, file: "", parts: false } }, bonus: [],
  bundleItems: [], includeAll: false, accessDays: "",
};

export default function NewBundlePage() {
  const { books, categories } = editorOptions();
  return (
    <div>
      <h1 className="font-display text-[28px] font-extrabold text-cream">Add bundle</h1>
      <p className="mb-6 mt-1 text-[14px] text-fog">Pick the books, set the price — a buyer gets all of them at once. You can save it hidden and publish later.</p>
      <ProductEditor initial={empty} categories={categories} books={books} />
    </div>
  );
}
