import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";
import { duplicateProduct, setPublished } from "@/lib/adminBooks";

/** Owner-only quick actions from the products list: hide / show / duplicate. Saving a product is /api/admin/books/save. */
export async function POST(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "not allowed" }, { status: 403 });
  const form = await req.formData().catch(() => null);
  const action = String(form?.get("action") ?? "");
  const slug = String(form?.get("slug") ?? "");
  const r = action === "publish" || action === "hide" ? setPublished(slug, action === "publish")
    : action === "duplicate" ? duplicateProduct(slug)
    : ({ ok: false, error: "Unknown action." } as const);
  const to = r.ok && action === "duplicate" && "slug" in r ? `/admin/books/${(r as { slug: string }).slug}` : "/admin/books";
  return new NextResponse(null, { status: 303, headers: { Location: `${to}?${r.ok ? "ok" : "err"}=${encodeURIComponent(r.ok ? r.message : r.error)}` } });
}
