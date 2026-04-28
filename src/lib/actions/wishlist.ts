// src/lib/actions/wishlist.ts
import { supabase } from "@/src/lib/supabase/client";

export async function fetchWishlist(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("wishlist")
    .select("product_id")
    .eq("user_id", userId);

  if (error) throw error;
  return data.map((item: { product_id: string }) => item.product_id);
}

export async function addWishlistItem(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from("wishlist")
    .insert({ user_id: userId, product_id: productId });

  if (error) throw error;
}

export async function removeWishlistItem(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) throw error;
}