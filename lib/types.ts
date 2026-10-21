export type ProductType = "ebook" | "course" | "bundle";

export type Lesson = { title: string; video_url: string; minutes?: number };
export type Highlight = { title: string; text: string };

export type Product = {
  id: string;
  slug: string;
  type: ProductType;
  title: string;
  subtitle: string | null;
  description: string | null;
  price: number;
  mrp: number | null;
  badge: string | null;
  cover_color: string | null;
  cover_url: string | null;
  file_path: string | null;
  pages: number | null;
  language: string | null;
  highlights: Highlight[];
  chapters: string[];
  lessons: Lesson[];
  bundle_items: string[];
  sort_order: number;
};
