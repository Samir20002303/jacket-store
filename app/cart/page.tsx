"use client";

import Image from "next/image";
import { StandardPageShell } from "@/src/components/standard-page-shell";
import { useStore } from "@/src/context/store-context";

export default function CartPage() {
  const { cart, totalCartItems } = useStore();

  return (
    <StandardPageShell
      title="Cart"
      description="Review your selected pieces before checkout."
    >
      {cart.length === 0 ? (
        <p className="text-black/65">Your cart is empty.</p>
      ) : (
        <div className="space-y-3">
          {cart.map((item) => (
            <article
              key={`${item.productId}-${item.size}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white p-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16">
                  <Image src={item.image} alt={item.name} fill className="object-contain" />
                </div>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-black/65">
                    {item.color} · {item.size}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium">
                {item.quantity} x ${item.price}
              </p>
            </article>
          ))}
          <p className="pt-2 text-sm text-black/70">Total items: {totalCartItems}</p>
        </div>
      )}
    </StandardPageShell>
  );
}
