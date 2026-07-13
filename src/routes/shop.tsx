import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BookCard } from "@/components/site/BookCard";
import { HorizontalBookCard } from "@/components/site/HorizontalBookCard";
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
      { title: "Shop All Books" },
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
      
      {/* Minimal Header */}
      <div className="bg-muted/30 border-b">
        <div className="container-page py-6 md:py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-[#1e3a5f]">Shop Collection</h1>
            <p className="text-muted-foreground mt-1">{data?.count ?? 0} titles available for you</p>
          </div>
        </div>
      </div>

      <main className="container-page py-10">
        {/* Horizontal Filters Bar */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm mb-10 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-[#1e3a5f] border-r pr-4 mr-2">
            <Filter className="h-5 w-5 text-primary" /> Filters
          </div>

          <div className="flex-1 flex flex-wrap items-center gap-4 min-w-[200px]">
             <div className="relative max-w-sm w-full">
              <Input
                placeholder="Search titles, authors…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && update({ q: searchInput || undefined })}
                className="pr-10 rounded-full bg-muted/30"
              />
              <button 
                onClick={() => update({ q: searchInput || undefined })}
                className="absolute right-0 top-0 h-full px-4 text-muted-foreground hover:text-primary"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              className="text-sm bg-transparent border-none outline-none font-medium text-foreground cursor-pointer"
              value={search.category || ""}
              onChange={(e) => update({ category: e.target.value || undefined })}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <span className="text-border">|</span>

            <select
              className="text-sm bg-transparent border-none outline-none font-medium text-foreground cursor-pointer"
              value={search.mode || ""}
              onChange={(e) => update({ mode: e.target.value as any || undefined })}
            >
              <option value="">Any Mode</option>
              <option value="sell">Buy only</option>
              <option value="rent">Rent only</option>
            </select>
            
            <span className="text-border">|</span>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">Max Rs.</span>
              <Input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                onBlur={() => update({ max: maxPrice })}
                onKeyDown={(e) => e.key === "Enter" && update({ max: maxPrice })}
                className="w-20 h-8 text-sm px-2 text-center"
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="w-full">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-48 rounded-3xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-12 rounded-xl border bg-danger/5 text-danger flex flex-col items-center text-center">
              <p className="font-semibold mb-2">We couldn't load books.</p>
              <p className="text-sm opacity-80">Please refresh the page in a moment.</p>
            </div>
          ) : !data?.books.length ? (
            <div className="p-16 rounded-xl border border-dashed flex flex-col items-center justify-center text-center bg-card shadow-sm min-h-[400px]">
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
              
              <Button variant="link" className="mt-6 text-muted-foreground" onClick={() => {
                setMaxPrice(5000);
                setSearchInput("");
                navigate({ search: {} as any });
              }}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.books.map((b) => <HorizontalBookCard key={b.id} book={b} />)}
              </div>
              
              {/* Pagination */}
              <div className="mt-16 flex justify-center items-center gap-4">
                <Button variant="outline" className="rounded-full px-6" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <span className="text-sm font-semibold text-muted-foreground">Page {page + 1} of {Math.max(1, Math.ceil(data.count / PAGE_SIZE))}</span>
                <Button variant="outline" className="rounded-full px-6" disabled={(page + 1) * PAGE_SIZE >= data.count} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
