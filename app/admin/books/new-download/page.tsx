import type { Metadata } from "next";
import { editorOptions } from "../editorData";
import { ProductEditor, type EditorProduct } from "../ProductEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Add download", robots: { index: false } };

const empty: EditorProduct = {
  slug: "", type: "download", title: "", subtitle: "", description: "", category: "download", badge: "", level: "", price: "", mrp: "", sortOrder: "", published: true,
  highlights: [], inside: [], learn: [], chapters: [], cover: "", gallery: [],
  editions: { hi: { pages: "", soon: false, file: "", parts: false }, en: { pages: "", soon: false, file: "", parts: false } }, bonus: [],
  bundleItems: [], includeAll: false, accessDays: "", noCoupon: true,
};

export default function NewDownloadPage() {
  const { books, categories } = editorOptions();
  return (
    <div>
      <h1 className="font-display text-[28px] font-extrabold text-cream">Add download</h1>
      <p className="mb-6 mt-1 text-[14px] text-fog">A single-file product like a wallpaper. Upload the file, set the price — buyers download it the moment they pay, no login needed.</p>
      <ProductEditor initial={empty} categories={categories} books={books} />
    </div>
  );
}
