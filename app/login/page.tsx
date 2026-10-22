import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const next = searchParams.next && searchParams.next.startsWith("/") && !searchParams.next.startsWith("//") ? searchParams.next : "/library";
  return (
    <div className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[600px] -translate-x-1/2 rounded-full bg-saffron-500/15 blur-[110px]" />
      <div className="container-x relative flex max-w-md flex-col py-12 sm:py-20">
        <div className="card p-6 sm:p-8">
          <h1 className="font-display text-[30px] font-extrabold tracking-tight text-cream">Sign in or sign up</h1>
          <p className="mt-2 text-[15px] text-fog">Enter your email and we&apos;ll send you a 6-digit code. No password needed.</p>
          <LoginForm next={next} />
        </div>
        <p className="mt-5 flex items-center justify-center gap-2 text-[13px] text-fog">
          <Icon name="shield" size={16} className="text-mint" /> We only use your email for your library and receipts.
        </p>
      </div>
    </div>
  );
}
