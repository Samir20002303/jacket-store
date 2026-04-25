"use client";

import { StoreProvider } from "@/src/context/store-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}
