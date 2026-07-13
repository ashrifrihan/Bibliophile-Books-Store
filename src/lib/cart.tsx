import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  book_id: string;
  title: string;
  author: string;
  cover_url: string | null;
  type: "sale" | "rent";
  unit_price: number;
  rent_weeks?: number;
};

type CartCtx = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (book_id: string, type: "sale" | "rent") => void;
  clear: () => void;
  total: number;
  count: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "bibliophile.cart.v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const add = (item: CartItem) =>
    setItems((prev) =>
      prev.some((i) => i.book_id === item.book_id && i.type === item.type) ? prev : [...prev, item],
    );
  const remove = (book_id: string, type: "sale" | "rent") =>
    setItems((prev) => prev.filter((i) => !(i.book_id === book_id && i.type === type)));
  const clear = () => setItems([]);
  const total = items.reduce(
    (s, i) => s + (i.type === "rent" ? i.unit_price * (i.rent_weeks ?? 2) : i.unit_price),
    0,
  );

  return (
    <Ctx.Provider value={{ items, add, remove, clear, total, count: items.length }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}

export const fmt = (n: number) => `$${n.toFixed(2)}`;
