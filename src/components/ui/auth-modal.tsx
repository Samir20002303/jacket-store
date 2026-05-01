"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/src/context/auth-context";
import { signUpSchema, signInSchema } from "@/src/lib/validations";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    if (isLogin) {
      const validation = signInSchema.safeParse({ email, password });
      if (!validation.success) {
        setError(validation.error.issues[0].message);
        setIsSubmitting(false);
        return;
      }
      const authResult = await signIn(validation.data.email, validation.data.password);
      setIsSubmitting(false);
      if (authResult.error) {
        setError(authResult.error);
      } else {
        onClose();
      }
    } else {
      const validation = signUpSchema.safeParse({ name, email, password });
      if (!validation.success) {
        setError(validation.error.issues[0].message);
        setIsSubmitting(false);
        return;
      }
      const authResult = await signUp(
        validation.data.email,
        validation.data.password,
        validation.data.name
      );
      setIsSubmitting(false);
      if (authResult.error) {
        setError(authResult.error);
      } else {
        setSuccess("Check your email for the confirmation link!");
      }
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    const result = await resetPassword(email);
    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("Check your email for the reset link!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition"
          aria-label="Close"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {isForgotPassword ? (
          <>
            <h2 className="text-2xl font-semibold text-white">Reset password</h2>
            <p className="mt-1 text-sm text-white/60">Enter your email to receive a reset link.</p>
            <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs tracking-[0.14em] uppercase text-white/70 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 backdrop-blur-sm focus:border-white/50 focus:outline-none transition" />
              </div>
              {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
              {success && <p className="text-sm text-green-400 bg-green-500/10 rounded-lg px-3 py-2">{success}</p>}
              <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                {isSubmitting ? "Sending..." : "Send reset link"}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-white/50">
              <button type="button" onClick={() => { setIsForgotPassword(false); setError(null); setSuccess(null); }} className="text-white underline hover:text-white/80 transition">
                Back to sign in
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-white">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p className="mt-1 text-sm text-white/60">
              {isLogin ? "Sign in to your account" : "Join the outerwear experience"}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs tracking-[0.14em] uppercase text-white/70 mb-1">Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Jean Dupont" className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 backdrop-blur-sm focus:border-white/50 focus:outline-none transition" />
                </div>
              )}

              <div>
                <label className="block text-xs tracking-[0.14em] uppercase text-white/70 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 backdrop-blur-sm focus:border-white/50 focus:outline-none transition" />
              </div>

              <div>
                <label className="block text-xs tracking-[0.14em] uppercase text-white/70 mb-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 backdrop-blur-sm focus:border-white/50 focus:outline-none transition" />
              </div>

              {isLogin && (
                <p className="text-right">
                  <button type="button" onClick={() => { setIsForgotPassword(true); setError(null); setSuccess(null); }} className="text-sm text-white/60 underline hover:text-white/80 transition">
                    Forgot password?
                  </button>
                </p>
              )}

              {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
              {success && <p className="text-sm text-green-400 bg-green-500/10 rounded-lg px-3 py-2">{success}</p>}

              <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                {isSubmitting ? "Loading..." : isLogin ? "Sign in" : "Create account"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-white/50">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button type="button" onClick={switchMode} className="text-white underline hover:text-white/80 transition">
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}