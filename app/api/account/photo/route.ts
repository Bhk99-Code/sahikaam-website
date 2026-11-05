import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getUser, savePhotoUrl } from "@/lib/auth";

// Same persistent-storage pattern as BOOKS_DIR/BONUS_DIR (lib/pricing.ts COUPONS_FILE): on the
// live server PROFILE_PHOTOS_DIR should point outside the deploy's versioned build folder, so a
// photo a buyer uploads survives the next code deploy. Falls back to a local folder in dev.
import { photosDir } from "@/lib/storage";
const MAX_BYTES = 4 * 1024 * 1024;
const EXT_BY_TYPE: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const ALL_EXT = [".jpg", ".jpeg", ".png", ".webp"];

/** Uploads (or replaces) the signed-in buyer's own profile photo. */
export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "login required" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("photo");
  if (!(file instanceof File)) return NextResponse.json({ error: "no photo given" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Photo is too large — please pick one under 4MB." }, { status: 400 });
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) return NextResponse.json({ error: "Please pick a JPG, PNG or WEBP photo." }, { status: 400 });

  const PHOTOS_DIR = photosDir();
  await fs.promises.mkdir(PHOTOS_DIR, { recursive: true });
  for (const e of ALL_EXT) await fs.promises.rm(path.join(PHOTOS_DIR, user.id + e), { force: true });
  await fs.promises.writeFile(path.join(PHOTOS_DIR, user.id + ext), Buffer.from(await file.arrayBuffer()));

  const url = `/api/account/photo/${user.id}?v=${Date.now()}`;
  await savePhotoUrl(user.id, url);
  return NextResponse.json({ ok: true, url });
}

/** Removes the signed-in buyer's own profile photo. */
export async function DELETE() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "login required" }, { status: 401 });
  for (const e of ALL_EXT) await fs.promises.rm(path.join(photosDir(), user.id + e), { force: true });
  await savePhotoUrl(user.id, null);
  return NextResponse.json({ ok: true });
}
