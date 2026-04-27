"use client";

import Image from "next/image";
import { StandardPageShell } from "@/src/components/standard-page-shell";
import { HeartIcon } from "@/src/components/icons";
import { useEffect, useState } from "react";
import { getProducts, type Product } from "@/src/data/products";
import { useStore } from "@/src/context/store-context";

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useStore();
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts() {
      const allProducts = await getProducts();
      const filtered = allProducts.filter((product) => wishlist.includes(product.id));
      setLikedProducts(filtered);
    }
    loadProducts();
  }, [wishlist]);

  return (
    <StandardPageShell
      title="Wishlist"
      description="Keep track of your favorite pieces and come back when you are ready."
    >
      {likedProducts.length === 0 ? (
        <p className="text-black/65">No liked products yet. Tap the heart on a jacket to save it.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {likedProducts.map((product) => (
            <article
              key={product.id}
              className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm"
            >
              <div className="relative h-44">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{product.name}</h2>
                  <p className="text-sm text-black/65">{product.color}</p>
                  <p className="mt-1 text-sm text-black/80">${product.price}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className="rounded-full border border-black/20 p-2 text-black transition hover:scale-[1.04] active:scale-[0.98]"
                  aria-label="Remove from wishlist"
                >
                  <HeartIcon filled />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </StandardPageShell>
  );
}