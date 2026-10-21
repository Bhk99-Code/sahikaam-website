import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// Handles the magic-link style login (if the email template sends a link instead of a code)
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") || "/library";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/library";
  if (code) await supabaseServer().auth.exchangeCodeForSession(code);
  return NextResponse.redirect(new URL(next, url.origin));
}
