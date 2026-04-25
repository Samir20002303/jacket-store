"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { CartIcon, HeartIcon } from "@/src/components/icons";
import { SIZES, type Product } from "@/src/data/products";
import { useStore } from "@/src/context/store-context";

type ShopProductCardProps = {
  product: Product;
};

export function ShopProductCard({ product }: ShopProductCardProps) {
  const router = useRouter();
  const { addToCart, getRemainingStock, toggleWishlist, isWishlisted } = useStore();

  const defaultSize = SIZES.find((size) => getRemainingStock(product, size) > 0);
  const cartDisabled = !defaultSize;

  return (
    <article
      onClick={() => router.push(`/product/${product.id}`)}
      className="group relative cursor-pointer rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="rounded-full border border-black/15 bg-white/80 p-2 text-black backdrop-blur-md transition hover:scale-[1.03] active:scale-[0.98]"
          aria-label="Toggle wishlist"
        >
          <HeartIcon className="h-4 w-4" filled={isWishlisted(product.id)} />
        </button>
        <button
          type="button"
          disabled={cartDisabled}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!defaultSize) return;
            addToCart(product, defaultSize);
          }}
          className="rounded-full border border-black/15 bg-white/80 p-2 text-black backdrop-blur-md transition hover:scale-[1.03] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="Add to cart"
        >
          <CartIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="relative h-44">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>
      <p className="mt-3 text-sm text-black/60">{product.color}</p>
      <h2 className="mt-1 text-lg font-semibold">{product.name}</h2>
      <p className="mt-1 text-sm text-black/70">${product.price}</p>
    </article>
  );
}
