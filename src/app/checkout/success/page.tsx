"use client";

import Link from "next/link";
import { StandardPageShell } from "@/src/components/ui/standard-page-shell";

export default function CheckoutSuccessPage() {
  return (
    <StandardPageShell title="Order Confirmed" description="Thank you for your purchase.">
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-green-100">
          <svg className="h-10 w-10 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-black">Payment successful</h2>
        <p className="text-black/50">Your order has been placed. We will send you a confirmation email shortly.</p>
        <Link href="/shop" className="mt-4 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98]">
          Continue shopping
        </Link>
      </div>
    </StandardPageShell>
  );
}