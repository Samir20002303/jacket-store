"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CartIcon, HeartIcon } from "@/src/components/icons";
import { SIZES, type Product, type Size } from "@/src/data/products";
import { useStore } from "@/src/context/store-context";


type ShopProductCardProps = {
  product: Product;
  selectedSize?: Size;
};

export function ShopProductCard({ product, selectedSize }: ShopProductCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLElement>(null);
  const { addToCart, getRemainingStock, toggleWishlist, isWishlisted } = useStore();

  // Si une taille est passée depuis les filtres, on l'utilise
  const defaultSize = selectedSize && getRemainingStock(product, selectedSize) > 0
    ? selectedSize
    : SIZES.find((size) => getRemainingStock(product, size) > 0);
  
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleClick = () => {
    const card = cardRef.current;
    if (!card) {
      router.push(`/product/${product.id}`);
      return;
    }

    card.style.transition = "transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 250ms ease-out";
    card.style.transform = "scale(1.06)";
    card.style.opacity = "0.5";

    setTimeout(() => {
      router.push(`/product/${product.id}`);
    }, 280);
  };

  return (
    <article
      ref={cardRef}
      onClick={handleClick}
      className="group relative cursor-pointer rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
        <button
          type="button"
          onClick={async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await toggleWishlist(product.id);
          }}
          className="rounded-full border border-black/15 bg-white/80 p-2 text-black backdrop-blur-md transition hover:scale-[1.03] active:scale-[0.98]"
          aria-label="Toggle wishlist"
        >
          <HeartIcon className="h-4 w-4" filled={isWishlisted(product.id)} />
        </button>
        <button
          type="button"
          disabled={isAddingToCart}
          onClick={async (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!defaultSize || isAddingToCart) return;
            setIsAddingToCart(true);
            await addToCart(product, defaultSize);
            setIsAddingToCart(false);
          }}
          className="rounded-full border border-black/15 bg-white/80 p-2 text-black backdrop-blur-md transition hover:scale-[1.03] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="Add to cart"
        >
          {isAddingToCart ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : (
            <CartIcon className="h-4 w-4" />
          )}
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