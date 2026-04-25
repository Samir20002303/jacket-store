"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CartIcon, HeartIcon } from "@/src/components/icons";
import { useStore } from "@/src/context/store-context";

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

  const baseText = darkText ? "text-black/90" : "text-white/95";
  const mutedText = darkText ? "text-black/70" : "text-white/80";
  const chipBg = darkText
    ? "border-black/20 bg-white/40"
    : "border-white/25 bg-black/15";

  return (
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

      <div className="flex justify-end align-center items-center gap-2">
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
      </div>
    </header>
  );
}
