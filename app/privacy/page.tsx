import type { Metadata } from "next";
import { Policy } from "@/components/Policy";
import { BUSINESS } from "@/lib/business";
import { SUPPORT_EMAIL } from "@/lib/env";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function Privacy() {
  return (
    <Policy title="Privacy Policy">
      <p className="text-[13px] text-fog">Last updated: {BUSINESS.updated}</p>
      <h2>What we collect</h2>
      <ul>
        <li><b>Account:</b> your email address, used to sign you in.</li>
        <li><b>Orders:</b> what you bought, the amount, the date and the Razorpay payment/order ID.</li>
        <li><b>Reading:</b> the page you reached, so the book reopens where you left off.</li>
      </ul>
      <p>Card, UPI and bank details are collected by Razorpay and never reach our servers.</p>
      <h2>How we use it</h2>
      <ul>
        <li>To give you access to what you bought.</li>
        <li>To send messages about your sign-in, orders, payments and support requests.</li>
        <li>To prevent piracy (only signed-in buyers can open a book).</li>
      </ul>
      <h2>Who we share it with</h2>
      <p>Only the providers that run the service: Razorpay (payments) and Hostinger (website hosting, database and email). We never sell your data.</p>
      <h2>Your rights</h2>
      <p>To see, correct or delete your data, write to {SUPPORT_EMAIL}.</p>
      <h2>Cookies</h2>
      <p>We use only the essential cookie that keeps you signed in.</p>
    </Policy>
  );
}
