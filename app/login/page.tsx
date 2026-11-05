import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "Sign in" };

export const dynamic = "force-dynamic";

export default function LoginPage({ searchParams }: { searchParams: { next?: string; signedout?: string; expired?: string; mode?: string; contact?: string } }) {
  const mode = searchParams.mode === "signup" || searchParams.mode === "reset" ? searchParams.mode : "signin";
  const next = searchParams.next && searchParams.next.startsWith("/") && !searchParams.next.startsWith("//") ? searchParams.next : "/library";
  return (
    <div className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[600px] -translate-x-1/2 rounded-full bg-saffron-500/15 blur-[110px]" />
      <div className="container-x relative flex max-w-md flex-col py-12 sm:py-20">
        <div className="card p-6 sm:p-8">
          <h1 className="font-display text-[30px] font-extrabold tracking-tight text-cream">Welcome to SahiKaam</h1>
          <p className="mt-2 text-[15px] text-fog">Sign in with your email or mobile number and password.</p>
          {searchParams.signedout === "all" && <p role="status" className="mt-4 rounded-2xl bg-mint/10 p-3 text-[14px] text-cream">You were signed out on all devices.</p>}
          {searchParams.expired === "1" && <p role="alert" className="mt-4 rounded-2xl bg-rosy/10 p-3 text-[14px] text-rosy">That link has expired or was already used. Please sign in with your password instead.</p>}
          <LoginForm next={next} initialMode={mode} initialContact={(searchParams.contact ?? "").slice(0, 191)} />
        </div>
        <p className="mt-5 flex items-center justify-center gap-2 text-[13px] text-fog">
          <Icon name="shield" size={16} className="text-mint" /> We use your number and email only for sign-in, your library and receipts.
        </p>
      </div>
    </div>
  );
}
