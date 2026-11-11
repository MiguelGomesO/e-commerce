"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  slug: string;
  name: string;
  cover: string;
  platform: string;
  priceCents: number;
  qty: number;
};

type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  add: (l: Omit<CartLine, "qty">) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "pixelvault-cart-v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Lê o carrinho salvo só no navegador (evita divergência na hidratação).
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) setLines(JSON.parse(raw));
      } catch {}
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, ready]);

  const add = useCallback((l: Omit<CartLine, "qty">) => {
    setLines((cur) => {
      const f = cur.find((x) => x.slug === l.slug);
      return f ? cur.map((x) => (x.slug === l.slug ? { ...x, qty: x.qty + 1 } : x)) : [...cur, { ...l, qty: 1 }];
    });
  }, []);
  const setQty = useCallback(
    (slug: string, qty: number) =>
      setLines((cur) => cur.map((x) => (x.slug === slug ? { ...x, qty } : x)).filter((x) => x.qty > 0)),
    [],
  );
  const remove = useCallback((slug: string) => setLines((cur) => cur.filter((x) => x.slug !== slug)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartCtx>(
    () => ({
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotalCents: lines.reduce((s, l) => s + l.qty * l.priceCents, 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [lines, add, setQty, remove, clear],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart fora do CartProvider");
  return c;
}
