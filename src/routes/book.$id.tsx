import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Star, ArrowLeft, ShoppingBag, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart, fmt } from "@/lib/cart";
import type { Book } from "@/lib/types";

export const Route = createFileRoute("/book/$id")({
  component: BookPage,
});

function BookPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [mode, setMode] = useState<"sale" | "rent">("sale");
  const [weeks, setWeeks] = useState(2);

  const { data: book, isLoading, error } = useQuery({
    queryKey: ["book", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("books").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Book | null;
    },
  });

  if (isLoading) {
    return <><Header /><main className="container-page py-16"><div className="animate-pulse h-96 rounded-xl bg-muted" /></main><Footer /></>;
  }
  if (error || !book) {
    return (
      <>
        <Header />
        <main className="container-page py-24 text-center">
          <h1 className="text-2xl font-semibold">Book not found</h1>
          <p className="mt-2 text-muted-foreground">This title may have been removed from the catalog.</p>
          <Button asChild className="mt-6"><Link to="/shop">Back to shop</Link></Button>
        </main>
        <Footer />
      </>
    );
  }

  const canBuy = book.mode !== "rent" && book.quantity_available > 0;
  const canRent = book.mode !== "sell" && book.quantity_available > 0;
  const soldOut = book.quantity_available <= 0;
  const stockLabel = soldOut
    ? "Sold out"
    : book.quantity_available <= 3
    ? `Only ${book.quantity_available} left`
    : "Available";

  const addToCart = () => {
    if (mode === "sale" && !canBuy) return toast.error("This copy is not available to buy.");
    if (mode === "rent" && !canRent) return toast.error("This copy is not available to rent.");
    add({
      book_id: book.id,
      title: book.title,
      author: book.author,
      cover_url: book.cover_url,
      type: mode,
      unit_price: mode === "sale" ? book.sell_price : book.rent_price_per_week,
      rent_weeks: mode === "rent" ? weeks : undefined,
    });
    toast.success("Added to cart");
    navigate({ to: "/cart" });
  };

  return (
    <>
      <Header />
      <main className="container-page py-8 md:py-12">
        <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>
        <div className="grid md:grid-cols-[380px_1fr] gap-10">
          <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-muted shadow-[var(--shadow-elevated)]">
            {book.cover_url ? (
              <img src={book.cover_url} alt={`Cover of ${book.title}`} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div>
            <Badge variant="secondary" className="mb-3">{book.category}</Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">{book.title}</h1>
            <p className="mt-1 text-lg text-muted-foreground">by {book.author}</p>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-warning text-warning" />{book.rating.toFixed(1)}</div>
              {book.isbn && <span className="text-muted-foreground">ISBN {book.isbn}</span>}
              <span className={soldOut ? "text-danger font-medium" : book.quantity_available <= 3 ? "text-warning font-medium" : "text-success font-medium"}>
                {stockLabel}
              </span>
            </div>
            <p className="mt-6 text-base leading-relaxed text-foreground/80 max-w-prose">{book.description}</p>

            {book.mode === "both" && (
              <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="mt-8">
                <TabsList>
                  <TabsTrigger value="sale">Buy</TabsTrigger>
                  <TabsTrigger value="rent">Rent</TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            <div className="mt-6 p-5 rounded-2xl bg-muted/40 border">
              {mode === "sale" && book.mode !== "rent" ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-accent">{fmt(book.sell_price)}</span>
                  {book.original_price && book.original_price > book.sell_price && (
                    <span className="text-muted-foreground line-through">{fmt(book.original_price)}</span>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-primary">{fmt(book.rent_price_per_week)}</span>
                    <span className="text-muted-foreground">per week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Weeks:</label>
                    <select
                      className="rounded-md border bg-background px-2 py-1 text-sm"
                      value={weeks}
                      onChange={(e) => setWeeks(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 6, 8].map((w) => <option key={w} value={w}>{w}</option>)}
                    </select>
                    <span className="text-sm text-muted-foreground ml-auto">
                      Total: <b className="text-foreground">{fmt(book.rent_price_per_week * weeks)}</b>
                    </span>
                  </div>
                </div>
              )}
              <Button
                onClick={addToCart}
                disabled={soldOut || (mode === "sale" && !canBuy) || (mode === "rent" && !canRent)}
                size="lg"
                className="mt-5 w-full rounded-full h-12"
              >
                {mode === "rent" ? <Clock className="mr-2 h-4 w-4" /> : <ShoppingBag className="mr-2 h-4 w-4" />}
                {soldOut ? "Sold out" : mode === "rent" ? "Rent this book" : "Add to cart"}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
