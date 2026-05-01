"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error } = await supabase.auth.updateUser({ password });

    setIsSubmitting(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/"), 3000);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl shadow-2xl">
        {success ? (
          <div className="text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-green-500/20 mx-auto mb-4">
              <svg className="h-8 w-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Password updated</h2>
            <p className="mt-2 text-sm text-white/60">Redirecting to homepage...</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-white">Set new password</h2>
            <p className="mt-1 text-sm text-white/60">Enter your new password below.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs tracking-[0.14em] uppercase text-white/70 mb-1">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 backdrop-blur-sm focus:border-white/50 focus:outline-none transition"
                />
              </div>
              {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Updating..." : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}