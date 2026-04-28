"use client";

import { createContext, useContext, useMemo, useCallback, useEffect, useReducer } from "react";
import type { Product, Size } from "@/src/lib/actions/products";
import { getProducts } from "@/src/lib/actions/products";
import { supabase } from "@/src/lib/supabase/client";
import { useAuth } from "@/src/context/auth-context";

let globalStockCache: Record<string, number> = {};


export type CartItem = {
  productId: string;
  name: string;
  image: string;
  size: Size;
  color: string;
  price: number;
  quantity: number;
};

type State = {
  cart: CartItem[];
  wishlist: string[];
  products: Product[];
};

type Action =
  | { type: "SET_DATA"; cart: CartItem[]; wishlist: string[]; products: Product[] }
  | { type: "CLEAR" }
  | { type: "ADD_TO_CART"; item: CartItem }
  | { type: "UPDATE_QUANTITY"; productId: string; size: Size; quantity: number }
  | { type: "REMOVE_FROM_CART"; productId: string; size: Size }
  | { type: "TOGGLE_WISHLIST"; productId: string }
  | { type: "ROLLBACK_WISHLIST"; productId: string; wasWishlisted: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, cart: action.cart, wishlist: action.wishlist, products: action.products };
    case "CLEAR":
      return { ...state, cart: [], wishlist: [] };
    case "ADD_TO_CART": {
      const existing = state.cart.findIndex(
        (item) => item.productId === action.item.productId && item.size === action.item.size,
      );
      if (existing >= 0) {
        return {
          ...state,
          cart: state.cart.map((item, i) =>
            i === existing ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        };
      }
      return { ...state, cart: [...state.cart, action.item] };
    }
    case "UPDATE_QUANTITY":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.productId === action.productId && item.size === action.size
            ? { ...item, quantity: action.quantity }
            : item,
        ),
      };
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter(
          (item) => !(item.productId === action.productId && item.size === action.size),
        ),
      };
    case "TOGGLE_WISHLIST":
      return {
        ...state,
        wishlist: state.wishlist.includes(action.productId)
          ? state.wishlist.filter((id) => id !== action.productId)
          : [...state.wishlist, action.productId],
      };
    case "ROLLBACK_WISHLIST":
      return {
        ...state,
        wishlist: action.wasWishlisted
          ? [...state.wishlist, action.productId]
          : state.wishlist.filter((id) => id !== action.productId),
      };
    default:
      return state;
  }
}

type StoreContextValue = {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (product: Product, size: Size) => Promise<boolean>;
  getRemainingStock: (product: Product, size: Size) => number;
  toggleWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  totalCartItems: number;
  wishlistCount: number;
  updateQuantity: (productId: string, size: Size, quantity: number) => Promise<void>;
  removeFromCart: (productId: string, size: Size) => Promise<void>;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const RESERVATION_SECONDS = 20;
  const { user, isLoading } = useAuth();
  const [state, dispatch] = useReducer(reducer, {
    cart: [],
    wishlist: [],
    products: [],
  });

  const refreshGlobalCache = useCallback(async () => {
    const { data } = await supabase.rpc("get_valid_cart_items"); // ← ici
    globalStockCache = {};
    (data as { product_id: string; size: string; total_quantity: number }[] | null)?.forEach((item) => {
      const key = `${item.product_id}-${item.size}`;
      globalStockCache[key] = item.total_quantity;
    });
  }, []);

  // Rafraîchir le cache toutes les 2 secondes
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshGlobalCache();
    }, 10000);

    return () => clearInterval(interval);
  }, [user, refreshGlobalCache]);

  useEffect(() => {
    if (isLoading) return;

    dispatch({ type: "CLEAR" });

    if (!user) return;

    let cancelled = false;

    async function load() {
      const products = await getProducts();

      const [cartResult, wishlistResult] = await Promise.all([
        supabase.from("cart_items").select("*").eq("user_id", user!.id),
        supabase.from("wishlist").select("product_id").eq("user_id", user!.id),
      ]);

      if (cancelled) return;

      await refreshGlobalCache();

      const cartData = cartResult.data;
      const cart = cartData
        ? (cartData as Record<string, unknown>[]).map((item) => {
          const product = products.find((p) => p.id === item.product_id);
          if (!product) return null;
          return {
            productId: item.product_id as string,
            name: product.name,
            image: product.image,
            size: item.size as Size,
            color: product.color,
            price: product.price,
            quantity: item.quantity as number,
          };
        }).filter((item): item is CartItem => item !== null)
        : [];

      const wishlist = wishlistResult.data
        ? (wishlistResult.data as { product_id: string }[]).map((item) => item.product_id)
        : [];

      dispatch({ type: "SET_DATA", cart, wishlist, products });
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [user, isLoading, refreshGlobalCache]);

  const getRemainingStock = useCallback(
    (product: Product, size: Size) => {
      const maxStock = product.sizes?.[size] ?? 0;
      const cacheKey = `${product.id}-${size}`;
      const totalReserved = globalStockCache[cacheKey] ?? 0;
      return Math.max(0, maxStock - totalReserved);
    },
    [],
  );



  const addToCart = useCallback(
    async (product: Product, size: Size) => {
      if (!user) return false;

      const cacheKey = `${product.id}-${size}`;
      const totalReserved = globalStockCache[cacheKey] ?? 0;
      const maxStock = product.sizes[size] ?? 0;
      const available = maxStock - totalReserved;
      if (available < 1) return false;

      const existing = state.cart.find(
        (item) => item.productId === product.id && item.size === size,
      );

      const expiresAt = new Date(Date.now() + RESERVATION_SECONDS * 1000).toISOString();

      if (existing) {
        const newQuantity = existing.quantity + 1;
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: newQuantity, reserved_until: expiresAt })
          .eq("user_id", user.id)
          .eq("product_id", product.id)
          .eq("size", size);

        if (error) return false;
        dispatch({ type: "UPDATE_QUANTITY", productId: product.id, size, quantity: newQuantity });
      } else {
        const newItem: CartItem = {
          productId: product.id,
          name: product.name,
          image: product.image,
          size,
          color: product.color,
          price: product.price,
          quantity: 1,
        };
        dispatch({ type: "ADD_TO_CART", item: newItem });
      
        const { error } = await supabase.from("cart_items").upsert({
          user_id: user.id,
          product_id: product.id,
          size,
          quantity: 1,
          reserved_until: expiresAt,
        }, {
          onConflict: 'user_id, product_id, size'
        });
      
        if (error) {
          dispatch({ type: "REMOVE_FROM_CART", productId: product.id, size });
          return false;
        }
      }

      await refreshGlobalCache();
      return true;
    },
    [state.cart, user, refreshGlobalCache],
  );

  const removeFromCart = useCallback(
    async (productId: string, size: Size) => {
      if (!user) return;

      dispatch({ type: "REMOVE_FROM_CART", productId, size });

      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .eq("size", size);

      await refreshGlobalCache();
    },
    [user, refreshGlobalCache],
  );

  const updateQuantity = useCallback(
    async (productId: string, size: Size, quantity: number) => {
      if (!user) return;
      if (quantity < 1) {
        await removeFromCart(productId, size);
        return;
      }

      const cacheKey = `${productId}-${size}`;
      const product = state.products.find((p) => p.id === productId);
      const maxStock = product?.sizes?.[size] ?? 0;
      const totalReserved = globalStockCache[cacheKey] ?? 0;
      const currentUserItem = state.cart.find(
        (item) => item.productId === productId && item.size === size,
      );
      const currentUserQty = currentUserItem?.quantity ?? 0;
      const delta = quantity - currentUserQty;

      const available = maxStock - totalReserved + currentUserQty;
      if (delta > 0 && available < delta) {
        // Ne pas retourner false, simplement sortir
        return;
      }

      const expiresAt = new Date(Date.now() + RESERVATION_SECONDS * 1000).toISOString();

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity, reserved_until: expiresAt })
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .eq("size", size);

      if (error) return;

      dispatch({ type: "UPDATE_QUANTITY", productId, size, quantity });
      await refreshGlobalCache();
    },
    [user, removeFromCart, state.cart, state.products, refreshGlobalCache],
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!user) return;

      const wasWishlisted = state.wishlist.includes(productId);
      dispatch({ type: "TOGGLE_WISHLIST", productId });

      if (wasWishlisted) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (error) dispatch({ type: "ROLLBACK_WISHLIST", productId, wasWishlisted });
      } else {
        const { error } = await supabase
          .from("wishlist")
          .insert({ user_id: user.id, product_id: productId });

        if (error) dispatch({ type: "ROLLBACK_WISHLIST", productId, wasWishlisted });
      }
    },
    [state.wishlist, user],
  );

  const isWishlisted = useCallback(
    (productId: string) => state.wishlist.includes(productId),
    [state.wishlist],
  );

  const totalCartItems = useMemo(
    () => state.cart.reduce((total, item) => total + item.quantity, 0),
    [state.cart],
  );

  const value: StoreContextValue = {
    cart: state.cart,
    wishlist: state.wishlist,
    addToCart,
    getRemainingStock,
    toggleWishlist,
    isWishlisted,
    totalCartItems,
    wishlistCount: state.wishlist.length,
    updateQuantity,
    removeFromCart,
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