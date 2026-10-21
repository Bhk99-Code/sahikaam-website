import type { Product } from "./types";

/**
 * Shown ONLY when Supabase keys are not set yet (local preview).
 * Once Supabase is connected, products come from the database.
 */
export const DEMO_PRODUCTS: Product[] = [
  {
    id: "demo-1",
    slug: "manufacturing-50",
    type: "ebook",
    title: "50 Most Profitable Manufacturing Businesses",
    subtitle: "₹10 Lakh se ₹1000 Crore tak ka roadmap",
    description:
      "Har investment level ke liye manufacturing businesses — machinery, permissions, funding, loan aur subsidy details ke saath, aur ek company ko ₹1000 crore tak le jaane ka roadmap.",
    price: 4999,
    mrp: null,
    badge: "NEW",
    cover_color: "#C2410C",
    cover_url: null,
    file_path: null,
    pages: null,
    language: "Hindi + English",
    highlights: [
      { title: "50", text: "Business ideas" },
      { title: "Funding", text: "Loan & subsidy details" },
      { title: "Lifetime", text: "Access in library" },
      { title: "Bonus", text: "₹1,999 course FREE" },
    ],
    chapters: [
      "₹10–50 Lakh: shuruaati businesses",
      "₹50 Lakh–5 Crore: scale-up units",
      "₹5 Crore+: bade plants",
      "Funding, loan aur subsidy",
      "₹1000 Crore company roadmap",
    ],
    lessons: [],
    bundle_items: [],
    sort_order: 10,
  },
  {
    id: "demo-2",
    slug: "legal-business-andha-paisa",
    type: "ebook",
    title: "Legal Business – Andha Paisa",
    subtitle: "100+ legal business ideas bina investment ke",
    description:
      "Brokerage, leasing, labour supply, trading jaise 100+ legal business ideas — execution steps, permissions aur kaam kahan se milega, sab ke saath.",
    price: 1999,
    mrp: null,
    badge: "BESTSELLER",
    cover_color: "#1E3A5F",
    cover_url: null,
    file_path: null,
    pages: null,
    language: "Hindi + English",
    highlights: [
      { title: "100+", text: "Business ideas" },
      { title: "₹0", text: "Investment ideas" },
      { title: "Permissions", text: "Har idea ke saath" },
      { title: "Lifetime", text: "Access in library" },
    ],
    chapters: ["Brokerage businesses", "Leasing aur rental", "Labour supply", "Trading", "Permissions aur registration"],
    lessons: [],
    bundle_items: [],
    sort_order: 20,
  },
];
