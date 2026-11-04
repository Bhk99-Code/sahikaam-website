import { NextResponse } from "next/server";
import { getUser, saveBuyerInfo } from "@/lib/auth";

/** Saves the buyer's own Profile page edits (app/account/ProfileForm.tsx). The photo itself goes
 *  through app/api/account/photo/route.ts instead — this never touches photo_url, so a save here
 *  can't accidentally wipe it (lib/auth.ts saveBuyerInfo only updates photo_url when photoUrl is
 *  explicitly passed). Nothing here is ever required to check out — see CheckoutClient.tsx. */
export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "login required" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  await saveBuyerInfo(user.id, {
    name: String(body.name || "").trim(),
    whatsapp: String(body.whatsapp || "").trim(),
    address: String(body.address || "").trim(),
    city: String(body.city || "").trim(),
  });
  return NextResponse.json({ ok: true });
}
