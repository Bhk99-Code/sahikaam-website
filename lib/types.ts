export type ProductType = "ebook" | "course" | "bundle";
export type Category = "manufacturing" | "legal" | "construction" | "food-agro" | "funding" | "startup" | "bundle";

export type Lesson = { title: string; video_url: string; minutes?: number };
export type Part = { title: string; file: string };
/** A buyer-only download (e.g. an Excel calculator); file is inside private/bonus/. */
export type Bonus = { title: string; text?: string; file: string };
export type Highlight = { title: string; text: string };

/** One language version of a book. A book is either one PDF (file_path) or chapter files (parts). */
export type Edition = {
  lang: "hi" | "en";
  label: string;
  pages?: number;
  file_path?: string; // PDF file name inside private/books/
  parts?: Part[];
  coming_soon?: boolean;
};

export type Product = {
  id: string;
  slug: string;
  type: ProductType;
  category: Category;
  accent: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  price: number;
  mrp: number | null;
  badge: string | null;
  cover_color: string | null;
  cover_url: string | null;
  gallery: string[];
  pages: number | null;
  level: string | null;
  highlights: Highlight[];
  learn: string[];
  chapters: string[];
  lessons: Lesson[];
  bundle_items: string[];
  access_days: number | null; // null = lifetime access
  variant_of?: string; // another plan of that product (e.g. 6-month pass); kept out of book lists
  editions: Edition[];
  bonus: Bonus[];
  sort_order: number;
  is_published: boolean;
};
