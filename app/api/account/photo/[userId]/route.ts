import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

import { photosDir } from "@/lib/storage";
const TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

/** Serves a buyer's uploaded profile photo (public, like a book cover — not sensitive). */
export async function GET(_req: Request, { params }: { params: { userId: string } }) {
  const userId = params.userId.replace(/[^a-zA-Z0-9-]/g, "");
  for (const ext of Object.keys(TYPES)) {
    const file = path.join(photosDir(), userId + ext);
    if (fs.existsSync(file)) {
      const data = await fs.promises.readFile(file);
      return new NextResponse(data, {
        headers: { "Content-Type": TYPES[ext], "Cache-Control": "public, max-age=31536000, immutable" },
      });
    }
  }
  return NextResponse.json({ error: "not found" }, { status: 404 });
}
