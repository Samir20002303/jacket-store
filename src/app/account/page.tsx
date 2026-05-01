"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/auth-context";
import { StandardPageShell } from "@/src/components/ui/standard-page-shell";

export default function AccountPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <StandardPageShell title="My Account" description="Manage your profile and view your orders.">
      <div className="max-w-lg space-y-6">
        <div className="rounded-2xl border border-black/8 bg-white p-6">
          <h3 className="text-lg font-semibold text-black">Profile</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <span className="text-black/50">Name</span>
              <p className="font-medium">{user.user_metadata?.name || "Not set"}</p>
            </div>
            <div>
              <span className="text-black/50">Email</span>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-black/8 bg-white p-6">
          <h3 className="text-lg font-semibold text-black">Orders</h3>
          <p className="mt-2 text-sm text-black/50">No orders yet.</p>
        </div>

        <button
          type="button"
          onClick={() => { signOut(); router.push("/"); }}
          className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98]"
        >
          Sign out
        </button>
      </div>
    </StandardPageShell>
  );
}