import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Star, ArrowLeft, ShoppingBag, Clock, CheckCircle2, ShieldCheck, Truck } from "lucide-react";
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
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container-page py-16 flex-1">
          <div className="grid md:grid-cols-[1fr_1fr] lg:grid-cols-[400px_1fr] gap-12">
            <div className="animate-pulse h-[500px] rounded-2xl bg-muted/50" />
            <div className="space-y-6">
              <div className="animate-pulse h-10 w-3/4 rounded bg-muted/50" />
              <div className="animate-pulse h-6 w-1/3 rounded bg-muted/50" />
              <div className="animate-pulse h-32 w-full rounded bg-muted/50" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !book) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container-page py-32 text-center flex-1 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-display font-bold text-[#1e3a5f]">Book not found</h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-md">The title you are looking for may have been removed or the link is broken.</p>
          <Button asChild className="mt-8 rounded-full px-8 py-6 text-lg"><Link to="/shop">Back to collection</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  const canBuy = book.mode !== "rent" && book.quantity_available > 0;
  const canRent = book.mode !== "sell" && book.quantity_available > 0;
  const soldOut = book.quantity_available <= 0;
  const stockLabel = soldOut
    ? "Out of stock"
    : book.quantity_available <= 3
    ? `Only ${book.quantity_available} left in stock!`
    : "In Stock - Ready to ship";

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
    toast.success("Added to cart successfully");
    navigate({ to: "/cart" });
  };

  // Determine initial mode based on book availability if needed, but keeping state logic intact.
  const isRentOnly = book.mode === "rent";
  const isBuyOnly = book.mode === "sell";
  const activeMode = isRentOnly ? "rent" : isBuyOnly ? "sale" : mode;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Header />
      
      {/* Subtle Breadcrumb Header */}
      <div className="bg-white border-b py-4">
        <div className="container-page">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to collection
          </Link>
        </div>
      </div>

      <main className="container-page py-12 md:py-20 flex-1">
        <div className="grid md:grid-cols-[1fr_1fr] lg:grid-cols-[450px_1fr] gap-12 lg:gap-20">
          
          {/* Left Column - Image */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-sm aspect-[2/3] rounded-xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
              {book.cover_url ? (
                <img src={book.cover_url} alt={`Cover of ${book.title}`} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">No Cover Image</div>
              )}
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary/80" /> Authentic
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success/80" /> Quality Checked
              </div>
            </div>
          </div>

          {/* Right Column - Details & Actions */}
          <div className="flex flex-col">
            <div className="mb-4">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-semibold px-3 py-1 text-xs uppercase tracking-wider mb-4">
                {book.category}
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1e3a5f] leading-tight mb-2">
                {book.title}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium">
                by <span className="text-foreground">{book.author}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm mb-8 pb-8 border-b">
              <div className="flex items-center gap-1.5 bg-warning/10 text-warning px-2.5 py-1 rounded-full font-bold">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {book.rating.toFixed(1)} Rating
              </div>
              <span className="text-border">|</span>
              {book.isbn && (
                <>
                  <span className="text-muted-foreground">ISBN: <span className="text-foreground font-medium">{book.isbn}</span></span>
                  <span className="text-border">|</span>
                </>
              )}
              <span className={`font-semibold ${soldOut ? "text-danger" : book.quantity_available <= 3 ? "text-warning" : "text-success"}`}>
                {stockLabel}
              </span>
            </div>

            <div className="prose prose-sm md:prose-base prose-slate max-w-none text-muted-foreground leading-relaxed mb-10">
              <p>{book.description}</p>
            </div>

            {/* Action Box */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-border/50 mt-auto relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              
              {book.mode === "both" && (
                <div className="flex bg-muted/50 p-1 rounded-2xl mb-8">
                  <button 
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${mode === "sale" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setMode("sale")}
                  >
                    Buy New Book
                  </button>
                  <button 
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${mode === "rent" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setMode("rent")}
                  >
                    Rent Book
                  </button>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                {activeMode === "sale" ? (
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Purchase Price</p>
                    <div className="flex items-end gap-3">
                      <span className="text-4xl font-extrabold text-[#1e3a5f]">{fmt(book.sell_price)}</span>
                      {book.original_price && book.original_price > book.sell_price && (
                        <span className="text-lg text-muted-foreground line-through mb-1">{fmt(book.original_price)}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">Rental Price</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-extrabold text-[#1e3a5f]">{fmt(book.rent_price_per_week)}</span>
                          <span className="text-muted-foreground font-medium">/ week</span>
                        </div>
                      </div>
                      
                      <div className="bg-muted/30 rounded-xl p-3 border">
                        <label className="text-xs text-muted-foreground font-semibold block mb-1 uppercase tracking-wider">Duration</label>
                        <select
                          className="w-full bg-transparent border-none outline-none font-bold text-foreground cursor-pointer focus:ring-0 p-0"
                          value={weeks}
                          onChange={(e) => setWeeks(Number(e.target.value))}
                        >
                          {[1, 2, 3, 4, 6, 8].map((w) => <option key={w} value={w}>{w} {w === 1 ? 'Week' : 'Weeks'} (Total: {fmt(book.rent_price_per_week * w)})</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={addToCart}
                  disabled={soldOut || (activeMode === "sale" && !canBuy) || (activeMode === "rent" && !canRent)}
                  className="flex-1 rounded-2xl h-14 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  {activeMode === "rent" ? <Clock className="mr-2 h-5 w-5" /> : <ShoppingBag className="mr-2 h-5 w-5" />}
                  {soldOut ? "Currently Out of Stock" : activeMode === "rent" ? "Rent This Book" : "Add to Cart"}
                </Button>
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
                <Truck className="h-4 w-4" /> Free shipping on orders over Rs.5000
              </div>
            </div>
            
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
