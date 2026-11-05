import fs from "fs";
import path from "path";

/**
 * Where books, covers, page caches, photos and the editable catalog/coupons live.
 *
 * Hostinger replaces everything inside public_html on every deploy, so nothing that must survive a deploy
 * may live there (the old BOOKS_DIR/BONUS_DIR pointed at public_html/private-storage and were wiped).
 * On the live server the app runs from <domain>/hbuilds/current/nodejs, so the safe place is the sibling
 * folder <domain>/private-storage. An env var still wins when its path really exists.
 * Locally (no "hbuilds" in the path) everything stays in the project folders.
 */
const m = process.cwd().replace(/\\/g, "/").match(/^(.*?)\/hbuilds\//);
export const PERSISTENT_ROOT: string | null = m ? `${m[1]}/private-storage` : null;
const here = (...p: string[]) => path.join(process.cwd(), ...p);

function dirFor(env: string | undefined, name: string, local: string) {
  if (env && fs.existsSync(env)) return env;
  if (PERSISTENT_ROOT) return path.join(PERSISTENT_ROOT, name);
  return env || local;
}
function fileRead(env: string | undefined, name: string, bundled: string) {
  if (env && fs.existsSync(env)) return env;
  if (PERSISTENT_ROOT && fs.existsSync(path.join(PERSISTENT_ROOT, name))) return path.join(PERSISTENT_ROOT, name);
  return env && fs.existsSync(env) ? env : bundled;
}
function fileWrite(env: string | undefined, name: string, bundled: string) {
  if (env && fs.existsSync(env)) return env;
  return PERSISTENT_ROOT ? path.join(PERSISTENT_ROOT, name) : env || bundled;
}

export const booksDir = () => dirFor(process.env.BOOKS_DIR, "books", here("private", "books"));
export const bonusDir = () => dirFor(process.env.BONUS_DIR, "bonus", here("private", "bonus"));
export const coversDir = () => dirFor(process.env.COVERS_DIR, "covers", here("private", "covers"));
export const pagesDir = () => dirFor(process.env.PAGES_DIR, "pages", here("private", "pages"));
export const photosDir = () => dirFor(process.env.PROFILE_PHOTOS_DIR, "profile-photos", here("private", "profile-photos"));

export const productsReadPath = () => fileRead(process.env.PRODUCTS_FILE, "products.json", here("content", "products.json"));
export const productsWritePath = () => fileWrite(process.env.PRODUCTS_FILE, "products.json", here("content", "products.json"));
export const couponsReadPath = () => fileRead(process.env.COUPONS_FILE, "coupons.json", here("content", "coupons.json"));
export const couponsWritePath = () => fileWrite(process.env.COUPONS_FILE, "coupons.json", here("content", "coupons.json"));
