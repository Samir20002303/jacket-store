"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { SIZES, type Product } from "@/src/lib/actions/products";

const COLORS = [
  { value: "white", label: "White", bg: "bg-white border-gray-300" },
  { value: "black", label: "Black", bg: "bg-black border-gray-600" },
  { value: "blue", label: "Blue", bg: "bg-blue-500 border-blue-500" },
  { value: "gray", label: "Gray", bg: "bg-gray-400 border-gray-400" },
  { value: "orange", label: "Orange", bg: "bg-orange-500 border-orange-500" },
  { value: "pink", label: "Pink", bg: "bg-pink-400 border-pink-400" },
  { value: "red", label: "Red", bg: "bg-red-500 border-red-500" },
  { value: "green", label: "Green", bg: "bg-green-500 border-green-500" },
];

const PRICE_RANGES = [
  { value: "all", label: "All prices" },
  { value: "0-150", label: "Under $150" },
  { value: "150-200", label: "$150 – $200" },
  { value: "200-300", label: "$200 – $300" },
];

type ShopFiltersProps = {
  products: Product[];
  filteredProducts: Product[];
};

export function ShopFilters({ products, filteredProducts }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeColor = searchParams.get("color") ?? "";
  const activeSize = searchParams.get("size") ?? "";
  const activePrice = searchParams.get("price") ?? "all";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/shop?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    filteredProducts.forEach((product) => {
      Object.entries(product.sizes).forEach(([size, stock]) => {
        if (stock > 0) sizes.add(size);
      });
    });
    return SIZES.filter((size) => sizes.has(size));
  }, [filteredProducts]);

  return (
    <div className="space-y-6 rounded-2xl border border-black/8 bg-white p-6">
      {/* Couleurs */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-black">
          Color
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateParams("color", "")}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              !activeColor
                ? "border-black bg-black text-white"
                : "border-black/15 text-black/70 hover:border-black/40"
            }`}
          >
            All
          </button>
          {COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => updateParams("color", color.value)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                activeColor === color.value
                  ? "border-black bg-black text-white"
                  : "border-black/15 text-black/70 hover:border-black/40"
              }`}
            >
              <span className={`h-3 w-3 rounded-full border ${color.bg}`} />
              {color.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tailles */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-black">
          Size
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateParams("size", "")}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              !activeSize
                ? "border-black bg-black text-white"
                : "border-black/15 text-black/70 hover:border-black/40"
            }`}
          >
            All
          </button>
          {availableSizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => updateParams("size", size)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                activeSize === size
                  ? "border-black bg-black text-white"
                  : "border-black/15 text-black/70 hover:border-black/40"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Prix */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-black">
          Price
        </h3>
        <div className="flex flex-wrap gap-2">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.value}
              type="button"
              onClick={() => updateParams("price", range.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                activePrice === range.value
                  ? "border-black bg-black text-white"
                  : "border-black/15 text-black/70 hover:border-black/40"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      {(activeColor || activeSize || activePrice !== "all") && (
        <button
          type="button"
          onClick={() => router.push("/shop", { scroll: false })}
          className="text-xs text-black/50 underline underline-offset-2 transition hover:text-black"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}