"use client";

import { createContext, useContext, useMemo, useCallback, useEffect, useReducer } from "react";
import type { Product, Size } from "@/src/lib/actions/products";
import { getProducts } from "@/src/lib/actions/products";
import { useAuth } from "@/src/context/auth-context";
import {
  fetchCartItems,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  fetchAllValidReservations,
} from "@/src/lib/actions/cart";
import {
  fetchWishlist,
  addWishlistItem,
  removeWishlistItem,
} from "@/src/lib/actions/wishlist";
import { addToCartSchema, updateCartQuantitySchema, removeFromCartSchema } from "@/src/lib/validations";
import type { CartItem } from "@/src/types";

const RESERVATION_SECONDS = 20;

let globalStockCache: Record<string, number> = {};

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
  getProductStock: (productId: string, size: Size) => number;
  toggleWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  totalCartItems: number;
  wishlistCount: number;
  updateQuantity: (productId: string, size: Size, quantity: number) => Promise<void>;
  removeFromCart: (productId: string, size: Size) => Promise<void>;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const GUEST_CART_KEY = "guest_cart";
const GUEST_WISHLIST_KEY = "guest_wishlist";

function saveGuestData(cart: CartItem[], wishlist: string[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(wishlist));
  }
}

function loadGuestData(): { cart: CartItem[]; wishlist: string[] } {
  if (typeof window !== "undefined") {
    const cart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
    const wishlist = JSON.parse(localStorage.getItem(GUEST_WISHLIST_KEY) || "[]");
    return { cart, wishlist };
  }
  return { cart: [], wishlist: [] };
}

function clearGuestData() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(GUEST_CART_KEY);
    localStorage.removeItem(GUEST_WISHLIST_KEY);
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [state, dispatch] = useReducer(reducer, {
    cart: [],
    wishlist: [],
    products: [],
  });

  const refreshGlobalCache = useCallback(async () => {
    const data = await fetchAllValidReservations();
    globalStockCache = {};
    data.forEach((item) => {
      const key = `${item.product_id}-${item.size}`;
      globalStockCache[key] = item.total_quantity;
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => refreshGlobalCache(), 10000);
    return () => clearInterval(interval);
  }, [user, refreshGlobalCache]);

  useEffect(() => {
    if (isLoading) return;
  
    if (!user) {
      // Charger le panier guest depuis localStorage
      const guestData = loadGuestData();
      const cart = guestData.cart.length > 0 ? guestData.cart : state.cart;
      const wishlist = guestData.wishlist.length > 0 ? guestData.wishlist : state.wishlist;
      
      dispatch({ type: "CLEAR" });
      for (const item of cart) {
        dispatch({ type: "ADD_TO_CART", item });
      }
      for (const id of wishlist) {
        dispatch({ type: "TOGGLE_WISHLIST", productId: id });
      }
      return;
    }
  
    let cancelled = false;
  
    async function load() {
      const products = await getProducts();
      const [rawCartItems, wishlistItems] = await Promise.all([
        fetchCartItems(user!.id),
        fetchWishlist(user!.id),
      ]);
  
      if (cancelled) return;
      await refreshGlobalCache();
  
      const guestData = loadGuestData();
      const mergedWishlist = [...new Set([...wishlistItems, ...guestData.wishlist])];
  
      const rawMergedCart = [...(rawCartItems as Record<string, unknown>[])];
      for (const guestItem of guestData.cart) {
        const existing = rawMergedCart.find(
          (i) => i.product_id === guestItem.productId && i.size === guestItem.size
        );
        if (existing) {
          existing.quantity = (existing.quantity as number) + guestItem.quantity;
        } else {
          rawMergedCart.push({
            product_id: guestItem.productId,
            size: guestItem.size,
            quantity: guestItem.quantity,
            user_id: user!.id,
          });
        }
      }
  
      const cart = rawMergedCart
        .map((item) => {
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
        })
        .filter((item): item is CartItem => item !== null);
  
      for (const guestItem of guestData.cart) {
        const expiresAt = new Date(Date.now() + RESERVATION_SECONDS * 1000).toISOString();
        try { await addCartItem(user!.id, guestItem.productId, guestItem.size, guestItem.quantity, expiresAt); } catch { }
      }
      for (const productId of guestData.wishlist) {
        try { await addWishlistItem(user!.id, productId); } catch { }
      }
  
      clearGuestData();
      await refreshGlobalCache();
  
      dispatch({ type: "CLEAR" }); // Vider l'ancien état
      dispatch({ type: "SET_DATA", cart, wishlist: mergedWishlist, products });
    }
  
    load();
    return () => { cancelled = true; };
  }, [user, isLoading, refreshGlobalCache]);

  useEffect(() => {
    if (!user) {
      saveGuestData(state.cart, state.wishlist);
    }
  }, [state.cart, state.wishlist, user]);

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
      const validation = addToCartSchema.safeParse({ productId: product.id, size });
      if (!validation.success) return false;
  
      const existing = state.cart.find(
        (item) => item.productId === product.id && item.size === size,
      );
  
      if (existing) {
        const newQuantity = existing.quantity + 1;
        dispatch({ type: "UPDATE_QUANTITY", productId: product.id, size, quantity: newQuantity });
  
        if (user) {
          const expiresAt = new Date(Date.now() + RESERVATION_SECONDS * 1000).toISOString();
          await updateCartItemQuantity(user.id, product.id, size, newQuantity, expiresAt);
          await refreshGlobalCache();
        }
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
  
        if (user) {
          const expiresAt = new Date(Date.now() + RESERVATION_SECONDS * 1000).toISOString();
          try {
            await addCartItem(user.id, product.id, size, 1, expiresAt);
            await refreshGlobalCache();
          } catch {
            dispatch({ type: "REMOVE_FROM_CART", productId: product.id, size });
            return false;
          }
        }
      }
  
      return true;
    },
    [state.cart, user, refreshGlobalCache],
  );

const removeFromCart = useCallback(
  async (productId: string, size: Size) => {
    const validation = removeFromCartSchema.safeParse({ productId, size });
    if (!validation.success) return;

    dispatch({ type: "REMOVE_FROM_CART", productId, size });

    if (user) {
      await removeCartItem(user.id, productId, size);
      await refreshGlobalCache();
    }
  },
  [user, refreshGlobalCache],
);

const updateQuantity = useCallback(
  async (productId: string, size: Size, quantity: number) => {
    const validation = updateCartQuantitySchema.safeParse({ productId, size, quantity });
    if (!validation.success) return;

    if (quantity < 1) {
      await removeFromCart(productId, size);
      return;
    }

    if (user) {
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
      if (delta > 0 && available < delta) return;

      const expiresAt = new Date(Date.now() + RESERVATION_SECONDS * 1000).toISOString();
      await updateCartItemQuantity(user.id, productId, size, quantity, expiresAt);
      await refreshGlobalCache();
    }

    dispatch({ type: "UPDATE_QUANTITY", productId, size, quantity });
  },
  [user, removeFromCart, state.cart, state.products, refreshGlobalCache],
);

const toggleWishlist = useCallback(
  async (productId: string) => {
    const wasWishlisted = state.wishlist.includes(productId);
    dispatch({ type: "TOGGLE_WISHLIST", productId });

    if (user) {
      try {
        if (wasWishlisted) {
          await removeWishlistItem(user.id, productId);
        } else {
          await addWishlistItem(user.id, productId);
        }
      } catch {
        dispatch({ type: "ROLLBACK_WISHLIST", productId, wasWishlisted });
      }
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

  const getProductStock = useCallback(
    (productId: string, size: Size) => {
      const cacheKey = `${productId}-${size}`;
      const product = state.products.find((p) => p.id === productId);
      const maxStock = product?.sizes?.[size] ?? 0;
      const totalReserved = globalStockCache[cacheKey] ?? 0;
      return Math.max(0, maxStock - totalReserved);
    },
    [state.products],
  );

  const value: StoreContextValue = {
    cart: state.cart,
    wishlist: state.wishlist,
    addToCart,
    getRemainingStock,
    getProductStock,
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