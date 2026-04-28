// src/types/index.ts
import type { Size } from "@/src/lib/actions/products";

export type CartItem = {
  productId: string;
  name: string;
  image: string;
  size: Size;
  color: string;
  price: number;
  quantity: number;
};