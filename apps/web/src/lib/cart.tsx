"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  quotationOnly: boolean;
  quantity: number;
  installation: boolean;
  image?: string;
};

type Ctx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  update: (productId: string, patch: Partial<CartItem>) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: number;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = "bbe-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<Ctx>(
    () => ({
      items,
      add(item) {
        setItems((prev) => {
          const found = prev.find((p) => p.productId === item.productId);
          if (found) {
            return prev.map((p) =>
              p.productId === item.productId ? { ...p, quantity: p.quantity + (item.quantity || 1) } : p
            );
          }
          return [...prev, { ...item, quantity: item.quantity || 1 }];
        });
      },
      update(productId, patch) {
        setItems((prev) => prev.map((p) => (p.productId === productId ? { ...p, ...patch } : p)));
      },
      remove(productId) {
        setItems((prev) => prev.filter((p) => p.productId !== productId));
      },
      clear() {
        setItems([]);
      },
      count: items.reduce((s, i) => s + i.quantity, 0),
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart");
  return ctx;
}
