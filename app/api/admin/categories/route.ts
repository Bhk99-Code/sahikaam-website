import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";
import { addCategory, moveCategory, toggleCategory, updateCategory } from "@/lib/categories";

/** Owner-only category actions (form posts from /admin/categories). */
export async function POST(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "not allowed" }, { status: 404 });
  const f = await req.formData();
  const action = String(f.get("action") ?? "");
  const key = String(f.get("key") ?? "");
  const r = action === "add" ? addCategory(String(f.get("label") ?? ""), String(f.get("blurb") ?? ""))
    : action === "update" ? updateCategory(key, String(f.get("label") ?? ""), String(f.get("blurb") ?? ""))
    : action === "toggle" ? toggleCategory(key)
    : action === "up" || action === "down" ? moveCategory(key, action === "up" ? -1 : 1)
    : ({ ok: false, error: "Unknown action." } as const);
  return new NextResponse(null, { status: 303, headers: { Location: `/admin/categories?${r.ok ? "ok" : "err"}=${encodeURIComponent(r.ok ? r.message : r.error)}` } });
}
