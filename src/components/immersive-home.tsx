"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { SIZES, type Product, type Size } from "@/src/data/products";
import { useStore } from "@/src/context/store-context";
import { HeartIcon } from "@/src/components/icons";
import { SiteHeader } from "@/src/components/site-header";
import { useRouter, usePathname } from "next/navigation";


const WHEEL_COOLDOWN_MS = 420;
const SWIPE_THRESHOLD_PX = 48;


type ImmersiveHomeProps = {
  products: Product[];
  initialProductId?: string;
};

function ScrollHintIcon() {
  return (
    <div className="grid place-items-center rounded-full border border-white/25 bg-black/15 px-2.5 py-1.5 backdrop-blur-sm">
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/80" aria-hidden>
        <path
          d="M12 4V20M12 4L9.3 7M12 4L14.7 7M12 20L9.3 17M12 20L14.7 17"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function getFirstAvailableSize(
  product: Product,
  getRemainingStock: (p: Product, s: Size) => number,
): Size {
  return SIZES.find((size) => getRemainingStock(product, size) > 0) ?? "S";
}

function getProductIndexById(products: Product[], productId?: string) {
  if (!productId) return 0;
  const index = products.findIndex((product) => product.id === productId);
  return index >= 0 ? index : 0;
}

export function ImmersiveHome({ products, initialProductId }: ImmersiveHomeProps) {

  const [currentProductIndex, setCurrentProductIndex] = useState(() =>
    getProductIndexById(products, initialProductId),

  );

  //  ANNIMATION - ne se déclenche qu'une seule fois, ignore les changements d'URL
  // const hasEntered = useRef(false);
  // const [showImage, setShowImage] = useState(false);

  // useEffect(() => {
  //   if (!hasEntered.current) {
  //     hasEntered.current = true;
  //     requestAnimationFrame(() => {
  //       requestAnimationFrame(() => {
  //         setShowImage(true);
  //       });
  //     });
  //   } else {
  //     // Pour les navigations suivantes (changement d'URL), l'image est déjà visible
  //     setShowImage(true);
  //   }
  // }, []);

  const router = useRouter();
  const pathname = usePathname();


  const {
    addToCart: addToCartItem,
    getRemainingStock,
    toggleWishlist,
    isWishlisted,
  } = useStore();
  const [selectedSize, setSelectedSize] = useState<Size>("S");
  const [isChanging, setIsChanging] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const wheelLockUntil = useRef(0);

  const currentProduct = products[currentProductIndex];

  const goToProduct = useCallback((targetIndex: number) => {
    if (products.length === 0) return;
    const normalized =
      (targetIndex + products.length) %
      (products.length === 0 ? 1 : products.length);
    setIsChanging(true);

    const nextProduct = products[normalized];
    const nextUrl = `/product/${nextProduct.id}`;
    if (pathname !== nextUrl) {
      router.replace(nextUrl);
    }

    window.setTimeout(() => {
      const nextProduct = products[normalized];
      setCurrentProductIndex(normalized);
      setSelectedSize(getFirstAvailableSize(nextProduct, getRemainingStock));
      window.setTimeout(() => setIsChanging(false), 220);
    }, 110);
  }, [getRemainingStock, products, pathname, router]);

  const goNext = useCallback(() => {
    goToProduct(currentProductIndex + 1);
  }, [currentProductIndex, goToProduct]);

  const goPrev = useCallback(() => {
    goToProduct(currentProductIndex - 1);
  }, [currentProductIndex, goToProduct]);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      const now = Date.now();
      if (now < wheelLockUntil.current) return;
      if (Math.abs(event.deltaY) < 18) return;
      wheelLockUntil.current = now + WHEEL_COOLDOWN_MS;
      if (event.deltaY > 0) {
        goNext();
      } else {
        goPrev();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [goNext, goPrev]);

  const onTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    const start = touchStartX.current;
    const end = event.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (start == null || end == null) return;
    const delta = end - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    if (delta < 0) goNext();
    if (delta > 0) goPrev();
  };

  const resolvedSize =
    getRemainingStock(currentProduct, selectedSize) > 0
      ? selectedSize
      : getFirstAvailableSize(currentProduct, getRemainingStock);
  const selectedStock = getRemainingStock(currentProduct, resolvedSize);

  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addToCart = async () => {
    if (selectedStock < 1 || isAddingToCart) return;
    setIsAddingToCart(true);
    await addToCartItem(currentProduct, resolvedSize);
    setIsAddingToCart(false);
  };

  if (!currentProduct) {
    return (
      <main className="grid h-screen w-screen place-items-center bg-black text-white">
        <p className="text-sm text-white/75">No products available.</p>
      </main>
    );
  }
  const nextProduct = products[(currentProductIndex + 1) % products.length] ?? currentProduct;

  return (
    <main
      className="relative h-screen w-screen overflow-hidden text-white"
      style={{
        background: `linear-gradient(145deg, ${currentProduct.theme.bg} 0%, ${currentProduct.theme.bgDeep} 72%)`,
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(255,255,255,0.2),rgba(255,255,255,0)_45%)]" />

      <div className="relative z-10 flex h-full flex-col px-5 py-5 sm:px-8 sm:py-6 lg:px-12 lg:py-8">
        <SiteHeader />

        <section className="grid flex-1 grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_1.2fr_1fr]">
          <div
            className={`space-y-5 transition-all duration-300 ${isChanging ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
              }`}
          >
            <p className="text-xs tracking-[0.2em] uppercase text-white/80">
              Signature Outerwear
            </p>
            <h1 className="max-w-sm text-4xl leading-[0.95] font-semibold sm:text-5xl lg:text-6xl">
              {currentProduct.name}
            </h1>
            <p className="text-lg font-medium text-white/90">{currentProduct.subtitle}</p>
            <p className="max-w-md text-sm leading-7 text-white/80 sm:text-base">
              {currentProduct.description}
            </p>
            <div className="flex justify-left align-center items-center gap-2">
              <button
                type="button"
                onClick={addToCart}
                disabled={isAddingToCart}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/40"
              >
                {isAddingToCart
                  ? "Adding..."
                  : selectedStock > 0
                    ? `Add to cart · ${resolvedSize}`
                    : "Out of stock"}
              </button>
              <button
                type="button"
                onClick={() => void toggleWishlist(currentProduct.id)}
                className="rounded-full border border-white/35 bg-black/15 p-3 text-white transition hover:scale-[1.03] active:scale-[0.98]"
                aria-label="Toggle wishlist"
              >
                <HeartIcon filled={isWishlisted(currentProduct.id)} />
              </button>
            </div>
          </div>

          <div className="relative flex h-full items-center justify-center">
            <div
              className={`relative h-[52vh] w-full max-w-[500px] transition-all duration-500 sm:h-[58vh] 
                ${isChanging ?
                  "scale-95 opacity-0"
                  : "scale-100 opacity-100"
                }`}
            >
              <Image
                key={currentProduct.id}
                src={currentProduct.image}
                alt={currentProduct.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,0.3)]"
                priority
              />
            </div>
          </div>

          <aside
            className={`space-y-5 transition-all duration-300 lg:justify-self-end ${isChanging ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
              }`}
          >
            <div>
              <p className="text-6xl leading-none font-semibold tracking-tight">
                ${currentProduct.price}
              </p>
              <p className="mt-1 text-2xl text-white/50 line-through">
                ${currentProduct.oldPrice}
              </p>
            </div>

            <div>
              <p className="mb-3 text-xs tracking-[0.18em] uppercase text-white/75">
                Choose your size
              </p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => {
                  const stock = getRemainingStock(currentProduct, size);
                  const isSelected = size === resolvedSize;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      disabled={stock === 0}
                      className={`h-10 min-w-10 rounded-full px-3 text-sm font-semibold transition ${stock === 0
                        ? "cursor-not-allowed border border-white/20 bg-black/20 text-white/35"
                        : isSelected
                          ? "bg-white text-black"
                          : "border border-white/30 bg-black/15 text-white hover:bg-black/35"
                        }`}
                      aria-label={`${size} size`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-sm text-white/80">
                Stock for {resolvedSize}:{" "}
                <span className="font-semibold">{selectedStock}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-black/15 p-4 backdrop-blur-sm">
              <p className="text-xs tracking-[0.16em] uppercase text-white/70">Up next</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="relative h-14 w-14">
                  <Image
                    src={nextProduct.image}
                    alt={nextProduct.name}
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </div>
                <p className="text-sm text-white/90">
                  {nextProduct.name}
                </p>
              </div>
            </div>
          </aside>
        </section>

        <footer className="flex items-center justify-between pt-2 text-sm text-white/75">
          <p>{currentProduct.tagline}</p>
          <div className="flex items-center gap-3">
            <p className="text-xs tracking-[0.14em] uppercase text-white/60">
              Swipe / Scroll to explore
            </p>
            <div className="animate-[pulse_2s_ease-in-out_infinite]">
              <ScrollHintIcon />
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}