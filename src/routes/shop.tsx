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
import { Filter, Search, MessageCircle } from "lucide-react";

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
      { title: "Shop All Books — Bookio" },
      { name: "description", content: "Browse the full Bookio catalog. Filter by category, price, or buy/rent mode." },
    ],
  }),
  component: Shop,
});

const PAGE_SIZE = 20;

function Shop() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [page, setPage] = useState(0);
  const [maxPrice, setMaxPrice] = useState(search.max ?? 5000);
  const [searchInput, setSearchInput] = useState(search.q ?? "");

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
    <div className="bg-background min-h-screen">
      <Header />
      
      {/* Page Header Banner */}
      <div className="bg-[#1e3a5f] text-white py-16">
        <div className="container-page text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Shop Books</h1>
          <p className="text-white/80 max-w-xl mx-auto text-lg">Browse our extensive collection of {data?.count ?? 0} titles. Find your next favorite read.</p>
        </div>
      </div>

      <main className="container-page py-12">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 shrink-0 space-y-8">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-lg mb-6 text-[#1e3a5f] border-b pb-3">
                <Filter className="h-5 w-5 text-primary" /> Filters
              </div>
              
              <div className="space-y-6">
                {/* Search */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground/80 uppercase tracking-wider">Search</h3>
                  <div className="relative">
                    <Input
                      placeholder="Title or author…"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && update({ q: searchInput || undefined })}
                      className="pr-10"
                    />
                    <button 
                      onClick={() => update({ q: searchInput || undefined })}
                      className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-primary"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground/80 uppercase tracking-wider">Categories</h3>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => update({ category: undefined })}
                      className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${!search.category ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-muted-foreground"}`}
                    >All Categories</button>
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => update({ category: c })}
                        className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${search.category === c ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-muted-foreground"}`}
                      >{c}</button>
                    ))}
                  </div>
                </div>

                {/* Mode */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground/80 uppercase tracking-wider">Mode</h3>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { v: undefined, label: "Any" },
                      { v: "sell", label: "Buy only" },
                      { v: "rent", label: "Rent only" },
                    ].map((o) => (
                      <button
                        key={o.label}
                        onClick={() => update({ mode: o.v as any })}
                        className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${(search.mode ?? undefined) === o.v ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-muted-foreground"}`}
                      >{o.label}</button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground/80 uppercase tracking-wider">Max price</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rs.</span>
                      <Input
                        type="number"
                        min={0}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="pl-9"
                      />
                    </div>
                    <Button size="icon" variant="secondary" onClick={() => update({ max: maxPrice })}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setMaxPrice(5000);
                    setSearchInput("");
                    navigate({ search: {} as any });
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] rounded-sm bg-muted animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-12 rounded-xl border bg-danger/5 text-danger flex flex-col items-center text-center">
                <p className="font-semibold mb-2">We couldn't load books.</p>
                <p className="text-sm opacity-80">Please refresh the page in a moment.</p>
              </div>
            ) : !data?.books.length ? (
              <div className="p-16 rounded-xl border border-dashed flex flex-col items-center justify-center text-center bg-card shadow-sm h-full min-h-[400px]">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-2">Book is not available at this moment</h3>
                <p className="text-muted-foreground mb-8 max-w-md">We couldn't find any books matching your current filters. But we can get it for you!</p>
                
                <a 
                  href="https://chat.whatsapp.com/LNR1VGz6bEHDYmuPXfYGFi?mode=hqrc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 bg-[#25D366] text-white font-bold hover:bg-[#20b858] transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-300"
                >
                  <MessageCircle className="h-5 w-5" />
                  Request to us
                </a>
                
                <Button variant="link" className="mt-6 text-muted-foreground" onClick={() => navigate({ search: {} as any })}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex justify-between items-center text-sm text-muted-foreground">
                  <span>Showing {(page * PAGE_SIZE) + 1}-{Math.min((page + 1) * PAGE_SIZE, data.count)} of {data.count} results</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {data.books.map((b) => <BookCard key={b.id} book={b} />)}
                </div>
                <div className="mt-12 flex justify-center items-center gap-4 border-t pt-8">
                  <Button variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                  <span className="text-sm font-semibold">Page {page + 1} of {Math.max(1, Math.ceil(data.count / PAGE_SIZE))}</span>
                  <Button variant="outline" disabled={(page + 1) * PAGE_SIZE >= data.count} onClick={() => setPage((p) => p + 1)}>Next</Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
