// src/lib/validations/schemas.ts
import { z } from "zod";

// Auth
export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Cart
export const addToCartSchema = z.object({
  productId: z.string().min(1),
  size: z.enum(["S", "M", "L", "XL"]),
});

export const updateCartQuantitySchema = z.object({
  productId: z.string().min(1),
  size: z.enum(["S", "M", "L", "XL"]),
  quantity: z.number().int().min(0).max(99),
});

export const removeFromCartSchema = z.object({
  productId: z.string().min(1),
  size: z.enum(["S", "M", "L", "XL"]),
});

// Types dérivés des schémas
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartQuantityInput = z.infer<typeof updateCartQuantitySchema>;
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;