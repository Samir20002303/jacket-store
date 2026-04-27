"use client";

import Image from "next/image";
import Link from "next/link";
import { StandardPageShell } from "@/src/components/standard-page-shell";
import { useStore } from "@/src/context/store-context";
import type { Size } from "@/src/data/products";

export default function CartPage() {
  const { cart, totalCartItems, updateQuantity, removeFromCart } = useStore();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 150 ? 0 : 15;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <StandardPageShell
        title="Cart"
        description="Your cart is empty — time to explore."
      >
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="grid h-20 w-20 place-items-center rounded-full border border-black/10 bg-black/5">
            <svg className="h-8 w-8 text-black/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <p className="text-lg font-medium text-black/80">Your cart is empty</p>
          <p className="text-sm text-black/50">Discover our outerwear collection.</p>
          <Link
            href="/shop"
            className="mt-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Explore shop
          </Link>
        </div>
      </StandardPageShell>
    );
  }

  return (
    <StandardPageShell
      title={`Cart (${totalCartItems})`}
      description="Review your selection before checkout."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Liste des articles */}
        <div className="space-y-3">
          {cart.map((item) => (
            <article
              key={`${item.productId}-${item.size}`}
              className="group flex items-center gap-4 rounded-2xl border border-black/8 bg-white p-4 transition hover:border-black/15 hover:shadow-sm"
            >
              {/* Image */}
              {/* Image */}
              <div className="relative h-20 w-20 flex-shrink-0 rounded-xl bg-black/[0.03]">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                    sizes="80px"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-xs text-black/30">
                    No img
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-black truncate">{item.name}</h3>
                <p className="text-sm text-black/50">
                  {item.color} — Size {item.size}
                </p>
                <p className="mt-1 text-sm font-medium text-black">
                  ${item.price}
                </p>
              </div>

              {/* Quantité + Supprimer */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center rounded-full border border-black/15 bg-black/[0.02]">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.productId, item.size as Size, item.quantity - 1)
                    }
                    className="grid h-8 w-8 place-items-center text-sm text-black/50 transition hover:text-black"
                    aria-label="Decrease"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2.5 6h7" />
                    </svg>
                  </button>
                  <span className="min-w-[2rem] text-center text-sm font-medium tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.productId, item.size as Size, item.quantity + 1)
                    }
                    className="grid h-8 w-8 place-items-center text-sm text-black/50 transition hover:text-black"
                    aria-label="Increase"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2.5v7M2.5 6h7" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.productId, item.size as Size)}
                  className="text-xs text-black/35 transition hover:text-red-500"
                >
                  Remove
                </button>
              </div>

              {/* Total ligne */}
              <p className="ml-2 min-w-[4.5rem] text-right text-sm font-semibold text-black tabular-nums">
                ${(item.price * item.quantity).toFixed(0)}
              </p>
            </article>
          ))}
        </div>

        {/* Résumé */}
        <div className="h-fit rounded-2xl border border-black/8 bg-white p-6">
          <h3 className="text-lg font-semibold text-black">Summary</h3>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between text-black/70">
              <span>Subtotal</span>
              <span className="font-medium tabular-nums">${subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-black/70">
              <span>Shipping</span>
              <span className="font-medium tabular-nums">
                {shipping === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  `$${shipping.toFixed(0)}`
                )}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-black/40">
                Free shipping on orders over $150
              </p>
            )}
            <hr className="border-black/10" />
            <div className="flex justify-between text-base font-semibold text-black">
              <span>Total</span>
              <span className="tabular-nums">${total.toFixed(0)}</span>
            </div>
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] active:scale-[0.98]"
          >
            Checkout
          </button>

          <Link
            href="/shop"
            className="mt-3 block text-center text-sm text-black/50 underline underline-offset-2 transition hover:text-black"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </StandardPageShell>
  );
}