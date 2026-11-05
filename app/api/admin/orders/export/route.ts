import { NextResponse } from "next/server";
import { getAdmin, ordersCsv } from "@/lib/admin";

export async function GET(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "not allowed" }, { status: 404 });
  const p = new URL(req.url).searchParams;
  const body = await ordersCsv({ status: p.get("status") ?? undefined, q: p.get("q") ?? "", from: p.get("from") ?? "", to: p.get("to") ?? "" });
  return new NextResponse("﻿" + body, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" },
  });
}
