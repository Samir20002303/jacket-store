// src/lib/actions/cart.ts
import { supabase } from "@/src/lib/supabase/client";
import type { CartItem } from "@/src/types";
import type { Size } from "@/src/lib/actions/products";

export async function fetchCartItems(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data as CartItem[];
}

export async function addCartItem(
  userId: string,
  productId: string,
  size: Size,
  quantity: number,
  reservedUntil: string
): Promise<CartItem> {
  const { data, error } = await supabase.from("cart_items").upsert(
    {
      user_id: userId,
      product_id: productId,
      size,
      quantity,
      reserved_until: reservedUntil,
    },
    { onConflict: "user_id, product_id, size" }
  );

  if (error) throw error;
  return data as unknown as CartItem;
}

export async function updateCartItemQuantity(
  userId: string,
  productId: string,
  size: Size,
  quantity: number,
  reservedUntil: string
): Promise<void> {
  const { error } = await supabase
    .from("cart_items")
    .update({ quantity, reserved_until: reservedUntil })
    .eq("user_id", userId)
    .eq("product_id", productId)
    .eq("size", size);

  if (error) throw error;
}

export async function removeCartItem(
  userId: string,
  productId: string,
  size: Size
): Promise<void> {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId)
    .eq("size", size);

  if (error) throw error;
}

export async function fetchAllValidReservations(): Promise<
  Array<{ product_id: string; size: string; total_quantity: number }>
> {
  const { data, error } = await supabase.rpc("get_valid_cart_items");

  if (error) throw error;
  return data as Array<{ product_id: string; size: string; total_quantity: number }>;
}