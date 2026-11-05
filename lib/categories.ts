import "server-only";
import fs from "fs";
import path from "path";
import { CATEGORY } from "./format";
import { categoriesReadPath, categoriesWritePath } from "./storage";

export type Cat = { key: string; label: string; blurb: string; color: string; hidden: boolean };
type File = { categories: Partial<Cat>[] };

/** The default list (lib/format.ts) plus whatever the owner changed in /admin/categories (saved in categories.json). */
function defaults(): Cat[] {
  return Object.entries(CATEGORY).filter(([k]) => k !== "bundle").map(([key, c]) => ({ key, label: c.label, blurb: c.blurb, color: c.color, hidden: false }));
}

let cache: { file: string; mtimeMs: number; list: Cat[] } | null = null;

/** Ordered list of categories for the shop and admin (hidden ones included — filter on `hidden`). */
export function getCategories(): Cat[] {
  const file = categoriesReadPath();
  try {
    const stat = fs.statSync(file);
    if (cache && cache.file === file && cache.mtimeMs === stat.mtimeMs) return cache.list;
    const saved: File = JSON.parse(fs.readFileSync(file, "utf8"));
    const list = (saved.categories ?? []).filter((c) => c.key && c.label).map((c) => ({
      key: String(c.key), label: String(c.label), blurb: String(c.blurb ?? ""), color: String(c.color ?? "#E8451A"), hidden: Boolean(c.hidden),
    }));
    cache = { file, mtimeMs: stat.mtimeMs, list };
    return list;
  } catch {
    return defaults();
  }
}

/** key → category, including the built-in "bundle" entry, so a lookup never comes back empty for a known key. */
export function categoryMap(): Record<string, { label: string; blurb: string; color: string; hidden?: boolean }> {
  const map: Record<string, { label: string; blurb: string; color: string; hidden?: boolean }> = { bundle: { ...CATEGORY.bundle } };
  for (const c of getCategories()) map[c.key] = c;
  return map;
}

/** Categories a visitor may browse (not hidden). */
export const visibleCategories = () => getCategories().filter((c) => !c.hidden);

function write(list: Cat[]) {
  const target = categoriesWritePath();
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const tmp = target + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify({ categories: list }, null, 2) + "\n");
  fs.renameSync(tmp, target);
}

type Result = { ok: true; message: string } | { ok: false; error: string };
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

export function addCategory(label: string, blurb: string): Result {
  const name = label.trim();
  const key = slugify(name);
  if (!name || !key) return { ok: false, error: "Enter a category name." };
  const list = getCategories();
  if (key === "bundle" || list.some((c) => c.key === key)) return { ok: false, error: `"${name}" already exists.` };
  write([...list, { key, label: name, blurb: blurb.trim(), color: "#E8451A", hidden: false }]);
  return { ok: true, message: `Category "${name}" added.` };
}

export function updateCategory(key: string, label: string, blurb: string): Result {
  const list = getCategories();
  const c = list.find((x) => x.key === key);
  if (!c) return { ok: false, error: "Category not found." };
  if (!label.trim()) return { ok: false, error: "Name can't be empty." };
  c.label = label.trim(); c.blurb = blurb.trim();
  write(list);
  return { ok: true, message: `Saved "${c.label}".` };
}

export function toggleCategory(key: string): Result {
  const list = getCategories();
  const c = list.find((x) => x.key === key);
  if (!c) return { ok: false, error: "Category not found." };
  c.hidden = !c.hidden;
  write(list);
  return { ok: true, message: `"${c.label}" is now ${c.hidden ? "hidden from the shop" : "visible"}.` };
}

export function moveCategory(key: string, dir: -1 | 1): Result {
  const list = getCategories();
  const i = list.findIndex((x) => x.key === key);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return { ok: true, message: "Order unchanged." };
  [list[i], list[j]] = [list[j], list[i]];
  write(list);
  return { ok: true, message: "Order saved." };
}
