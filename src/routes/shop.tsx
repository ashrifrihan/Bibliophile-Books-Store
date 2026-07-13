import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BookCard } from "@/components/site/BookCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type Book } from "@/lib/types";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  mode: z.enum(["sell", "rent", "both"]).optional(),
  max: z.coerce.number().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Shop All Books — Bibliophile" },
      { name: "description", content: "Browse the full Bibliophile catalog. Filter by category, price, or buy/rent mode." },
    ],
  }),
  component: Shop,
});

const PAGE_SIZE = 20;

function Shop() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [page, setPage] = useState(0);
  const [maxPrice, setMaxPrice] = useState(search.max ?? 100);

  const { data, isLoading, error } = useQuery({
    queryKey: ["books", "shop", search, page],
    queryFn: async () => {
      let q = supabase
        .from("books")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      if (search.category) q = q.eq("category", search.category);
      if (search.mode) q = q.in("mode", search.mode === "both" ? ["both"] : [search.mode, "both"]);
      if (search.q) q = q.or(`title.ilike.%${search.q}%,author.ilike.%${search.q}%`);
      if (search.max) q = q.lte("sell_price", search.max);
      const { data, error, count } = await q;
      if (error) throw error;
      return { books: data as Book[], count: count ?? 0 };
    },
  });

  const update = (patch: Partial<typeof search>) => {
    setPage(0);
    navigate({ search: { ...search, ...patch } as any });
  };

  return (
    <>
      <Header />
      <main className="container-page py-8 md:py-12">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold">Shop Books</h1>
          <p className="text-muted-foreground">{data?.count ?? 0} titles in stock</p>
        </header>

        <div className="grid md:grid-cols-[240px_1fr] gap-8">
          {/* Filters */}
          <aside className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">Category</h3>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => update({ category: undefined })}
                  className={`text-left text-sm px-3 py-1.5 rounded-md hover:bg-muted ${!search.category ? "bg-primary text-primary-foreground hover:bg-primary" : ""}`}
                >All</button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => update({ category: c })}
                    className={`text-left text-sm px-3 py-1.5 rounded-md hover:bg-muted ${search.category === c ? "bg-primary text-primary-foreground hover:bg-primary" : ""}`}
                  >{c}</button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">Mode</h3>
              <div className="flex flex-col gap-1">
                {[
                  { v: undefined, label: "Any" },
                  { v: "sell", label: "Buy only" },
                  { v: "rent", label: "Rent only" },
                ].map((o) => (
                  <button
                    key={o.label}
                    onClick={() => update({ mode: o.v as any })}
                    className={`text-left text-sm px-3 py-1.5 rounded-md hover:bg-muted ${(search.mode ?? undefined) === o.v ? "bg-primary text-primary-foreground hover:bg-primary" : ""}`}
                  >{o.label}</button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">Max price</h3>
              <Input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
              <Button size="sm" className="mt-2 w-full" onClick={() => update({ max: maxPrice })}>Apply</Button>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">Search</h3>
              <Input
                placeholder="Title or author…"
                defaultValue={search.q ?? ""}
                onKeyDown={(e) => e.key === "Enter" && update({ q: (e.target as HTMLInputElement).value || undefined })}
              />
            </div>
          </aside>

          {/* Grid */}
          <div>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-8 rounded-xl border bg-danger/5 text-danger">
                We couldn't load books. Please refresh in a moment.
              </div>
            ) : !data?.books.length ? (
              <div className="p-12 rounded-xl border border-dashed text-center">
                <p className="text-muted-foreground">No books match those filters yet.</p>
                <Button variant="link" asChild><Link to="/shop">Clear filters</Link></Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {data.books.map((b) => <BookCard key={b.id} book={b} />)}
                </div>
                <div className="mt-8 flex justify-between items-center">
                  <Button variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                  <span className="text-sm text-muted-foreground">Page {page + 1} of {Math.max(1, Math.ceil(data.count / PAGE_SIZE))}</span>
                  <Button variant="outline" disabled={(page + 1) * PAGE_SIZE >= data.count} onClick={() => setPage((p) => p + 1)}>Next</Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
