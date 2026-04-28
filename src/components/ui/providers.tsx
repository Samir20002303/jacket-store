"use client";

import { type ReactNode } from "react";
import { StoreProvider } from "@/src/context/store-context";
import { AuthProvider } from "@/src/context/auth-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <StoreProvider>
       {children}
      </StoreProvider>
    </AuthProvider>
  );
}