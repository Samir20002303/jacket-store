"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CartIcon, HeartIcon } from "@/src/components/icons";
import { useStore } from "@/src/context/store-context";
import { useAuth } from "@/src/context/auth-context";
import { AuthModal } from "@/src/components/auth-modal";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
] as const;

type SiteHeaderProps = {
  className?: string;
  darkText?: boolean;
};

export function SiteHeader({ className = "", darkText = false }: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { wishlistCount, totalCartItems } = useStore();
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const baseText = darkText ? "text-black/90" : "text-white/95";
  const mutedText = darkText ? "text-black/70" : "text-white/80";
  const chipBg = darkText
    ? "border-black/20 bg-white/40"
    : "border-white/25 bg-black/15";

  const displayName = user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "User";

  return (
    <>
      <header className={`flex items-center justify-between gap-4 ${className}`}>
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-xs font-bold text-black">
            JM
          </div>
          <p className={`text-sm font-semibold tracking-[0.16em] uppercase ${baseText}`}>
            Jacket Masters
          </p>
        </Link>

        <nav
          className={`rounded-full border p-1 backdrop-blur-sm ${chipBg}`}
          aria-label="Primary navigation"
        >
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-xs font-medium tracking-wide transition ${
                      active
                        ? "bg-white text-black"
                        : `${mutedText} hover:bg-white/20 hover:text-black`
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {/* Bouton utilisateur connecté */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium backdrop-blur-md transition hover:scale-[1.02] ${chipBg} ${baseText}`}
                aria-label="User menu"
              >
                {displayName}
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-20 w-56 rounded-xl border border-white/20 bg-black/85 p-2 backdrop-blur-xl shadow-xl">
                    <div className="px-3 py-2 text-sm text-white/90 truncate">
                      {user.email}
                    </div>
                    <hr className="my-1 border-white/10" />
                    <button
                      type="button"
                      onClick={() => {
                        signOut();
                        setDropdownOpen(false);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className={`rounded-full border p-2 backdrop-blur-md transition hover:scale-[1.02] ${chipBg} ${baseText}`}
              aria-label="Sign in"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          )}

          {/* Bouton wishlist */}
          <button
            type="button"
            onClick={() => router.push("/wishlist")}
            className={`relative rounded-full border p-2 backdrop-blur-md transition hover:scale-[1.02] ${chipBg} ${baseText}`}
            aria-label="Open wishlist"
          >
            <HeartIcon className="h-5 w-5" filled={pathname === "/wishlist"} />
            <span className="absolute -top-1 -right-1 min-w-5 rounded-full bg-white px-1 text-center text-[11px] font-semibold text-black">
              {wishlistCount}
            </span>
          </button>

          {/* Bouton panier */}
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className={`relative rounded-full border p-2 backdrop-blur-md transition hover:scale-[1.02] ${chipBg} ${baseText}`}
            aria-label="Open cart"
          >
            <CartIcon className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 min-w-5 rounded-full bg-white px-1 text-center text-[11px] font-semibold text-black">
              {totalCartItems}
            </span>
          </button>
        </div>
      </header>

      {/* Modal d'authentification */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}