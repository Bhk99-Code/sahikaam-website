import { isSupabaseConfigured } from "@/lib/env";
export function DemoBanner() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="bg-ink px-4 py-2 text-center text-[13px] text-white">
      Preview mode — Supabase aur Razorpay keys <code className="rounded bg-white/15 px-1">.env.local</code> mein daalte hi login aur payment chalu ho jayenge.
    </div>
  );
}
