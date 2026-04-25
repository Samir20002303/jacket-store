"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Product, Size } from "@/src/data/products";

export type CartItem = {
  productId: string;
  name: string;
  image: string;
  size: Size;
  color: string;
  price: number;
  quantity: number;
};

type StoreContextValue = {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (product: Product, size: Size) => boolean;
  getRemainingStock: (product: Product, size: Size) => number;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  totalCartItems: number;
  wishlistCount: number;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const getRemainingStock = (product: Product, size: Size) => {
    const inCart = cart
      .filter((item) => item.productId === product.id && item.size === size)
      .reduce((total, item) => total + item.quantity, 0);
    return Math.max(0, product.sizes[size] - inCart);
  };

  const addToCart = (product: Product, size: Size) => {
    if (getRemainingStock(product, size) < 1) return false;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.size === size,
      );
      if (existingIndex >= 0) {
        return prev.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          image: product.image,
          size,
          color: product.color,
          price: product.price,
          quantity: 1,
        },
      ];
    });

    return true;
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const totalCartItems = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );
  const wishlistCount = wishlist.length;

  const value: StoreContextValue = {
    cart,
    wishlist,
    addToCart,
    getRemainingStock,
    toggleWishlist,
    isWishlisted,
    totalCartItems,
    wishlistCount,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider.");
  }
  return context;
}
