"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Tier } from "@/lib/types";
import { tierFor } from "@/lib/pricing";

export type CartLine = {
  key: string;
  productId: string;
  title: string;
  spec: string;
  qty: number;
  unitPrice: number;
  origPrice: number;
  image: string;
  tiers: Tier[];
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  drawerOpen: boolean;
  toast: string | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: Omit<CartLine, "key" | "unitPrice"> & { qty: number }) => void;
  removeLine: (key: string) => void;
  clear: () => void;
  notify: (message: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "atelier-cart-v1";
const CART_EVENT = "atelier-cart";
const EMPTY: CartLine[] = [];

let cachedRaw = "";
let cachedLines: CartLine[] = EMPTY;

function readCart(): CartLine[] {
  const raw = localStorage.getItem(STORAGE_KEY) ?? "";
  if (raw === cachedRaw) return cachedLines;
  cachedRaw = raw;
  if (!raw) {
    cachedLines = EMPTY;
    return cachedLines;
  }
  try {
    cachedLines = JSON.parse(raw) as CartLine[];
  } catch {
    cachedLines = EMPTY;
  }
  return cachedLines;
}

function writeCart(next: CartLine[]) {
  const raw = JSON.stringify(next);
  cachedRaw = raw;
  cachedLines = next;
  localStorage.setItem(STORAGE_KEY, raw);
  window.dispatchEvent(new Event(CART_EVENT));
}

function subscribeCart(onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onStoreChange();
  };
  window.addEventListener(CART_EVENT, onStoreChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CART_EVENT, onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribeCart, readCart, () => EMPTY);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, line) => sum + line.qty, 0);
    const total = lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
    return {
      lines,
      count,
      total,
      drawerOpen,
      toast,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      notify,
      addItem: (item) => {
        const current = readCart();
        const key = `${item.productId}::${item.spec}`;
        const existing = current.find((line) => line.key === key);
        if (!existing) {
          const tier = tierFor(item.tiers, item.qty);
          writeCart([...current, { ...item, key, unitPrice: tier?.price ?? 0 }]);
        } else {
          writeCart(
            current.map((line) => {
              if (line.key !== key) return line;
              const qty = line.qty + item.qty;
              const tier = tierFor(line.tiers, qty);
              return { ...line, qty, unitPrice: tier?.price ?? line.unitPrice };
            }),
          );
        }
        notify(`已加入「${item.title}」× ${item.qty}`);
      },
      removeLine: (key) => writeCart(readCart().filter((line) => line.key !== key)),
      clear: () => writeCart([]),
    };
  }, [lines, drawerOpen, toast, notify]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <div
        className={`pointer-events-none fixed bottom-6 left-1/2 z-70 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-foam shadow-lg transition ${
          toast ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        {toast}
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart 必須在 CartProvider 內使用");
  return context;
}
