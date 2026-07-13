import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Star, ArrowLeft, ShoppingBag, Clock, Minus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
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
  const [quantity, setQuantity] = useState(1);

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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 grid md:grid-cols-2">
          <div className="bg-white p-12 flex items-center justify-center">
            <div className="animate-pulse h-[400px] w-[300px] bg-muted rounded-xl" />
          </div>
          <div className="bg-[#F8F9FA] p-12 space-y-6">
            <div className="animate-pulse h-8 w-1/4 bg-muted rounded" />
            <div className="animate-pulse h-12 w-3/4 bg-muted rounded" />
            <div className="animate-pulse h-32 w-full bg-muted rounded" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !book) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center bg-[#F8F9FA] py-32">
          <h1 className="text-4xl font-display font-bold text-[#1e3a5f]">Book not found</h1>
          <p className="mt-4 text-muted-foreground text-lg">The title you are looking for may have been removed.</p>
          <Button asChild className="mt-8 rounded-full px-8"><Link to="/shop">Back to collection</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  const canBuy = book.mode !== "rent" && book.quantity_available > 0;
  const canRent = book.mode !== "sell" && book.quantity_available > 0;
  const soldOut = book.quantity_available <= 0;

  const addToCart = () => {
    if (mode === "sale" && !canBuy) return toast.error("This copy is not available to buy.");
    if (mode === "rent" && !canRent) return toast.error("This copy is not available to rent.");
    
    // Add multiple if quantity > 1 (basic implementation)
    for (let i = 0; i < quantity; i++) {
      add({
        book_id: book.id,
        title: book.title,
        author: book.author,
        cover_url: book.cover_url,
        type: mode,
        unit_price: mode === "sale" ? book.sell_price : book.rent_price_per_week,
        rent_weeks: mode === "rent" ? weeks : undefined,
      });
    }
    toast.success(`Added ${quantity} ${quantity === 1 ? 'copy' : 'copies'} to cart`);
  };

  const buyNow = () => {
    addToCart();
    navigate({ to: "/cart" });
  };

  const isRentOnly = book.mode === "rent";
  const isBuyOnly = book.mode === "sell";
  const activeMode = isRentOnly ? "rent" : isBuyOnly ? "sale" : mode;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      
      {/* Split Screen Layout */}
      <main className="flex-1 grid md:grid-cols-2 min-h-[80vh]">
        
        {/* Left Side - Image (White Background) */}
        <div className="bg-white p-8 md:p-16 flex flex-col items-center justify-center relative">
          <Link to="/shop" className="absolute top-8 left-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to collection
          </Link>
          
          <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] relative flex items-center justify-center drop-shadow-2xl">
            {book.cover_url ? (
              <img 
                src={book.cover_url} 
                alt={`Cover of ${book.title}`} 
                className="w-full h-full object-cover rounded-xl transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground rounded-lg shadow-inner">
                No Cover Image
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Details (Light Gray Background) */}
        <div className="bg-[#F4F5F8] p-8 md:p-16 lg:px-24 flex flex-col justify-center">
          
          <div className="uppercase tracking-widest text-xs font-bold text-muted-foreground mb-4">
            {book.category} BOOKS
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827] leading-tight mb-4 tracking-tight">
            {book.title}
          </h1>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mb-8">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="text-foreground font-bold">{book.rating.toFixed(1)}</span>
            <span>· 15 Reviews</span>
            <span className="mx-2">•</span>
            <span>by <span className="text-foreground underline decoration-muted-foreground/30 underline-offset-4">{book.author}</span></span>
          </div>

          <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
            {book.description || "A wonderful addition to your reading collection. Beautifully bound and ready to be explored."}
          </p>

          {/* Mode Selector matching design's attributes */}
          {book.mode === "both" && (
            <div className="flex gap-4 mb-8">
              <button 
                className={`px-4 py-2 text-sm font-bold rounded-lg border-2 transition-all ${mode === "sale" ? "border-[#111827] text-[#111827]" : "border-transparent bg-white text-muted-foreground hover:bg-white/80"}`}
                onClick={() => setMode("sale")}
              >
                Buy Book
              </button>
              <button 
                className={`px-4 py-2 text-sm font-bold rounded-lg border-2 transition-all ${mode === "rent" ? "border-[#111827] text-[#111827]" : "border-transparent bg-white text-muted-foreground hover:bg-white/80"}`}
                onClick={() => setMode("rent")}
              >
                Rent Book
              </button>
            </div>
          )}

          {activeMode === "rent" && (
            <div className="flex gap-4 mb-8 bg-white p-2 rounded-lg w-fit border border-border/50">
              <div className="px-4 py-2 border-r border-border/50">
                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">DURATION</div>
                <select
                  className="bg-transparent border-none outline-none font-bold text-[#111827] cursor-pointer focus:ring-0 p-0 text-sm"
                  value={weeks}
                  onChange={(e) => setWeeks(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 6, 8].map((w) => <option key={w} value={w}>{w} {w === 1 ? 'Week' : 'Weeks'}</option>)}
                </select>
              </div>
              <div className="px-4 py-2">
                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">RATE</div>
                <div className="font-bold text-sm text-[#111827]">{fmt(book.rent_price_per_week)}/wk</div>
              </div>
            </div>
          )}

          <div className="text-3xl font-extrabold text-[#111827] mb-8 font-sans">
            {activeMode === "sale" ? fmt(book.sell_price) : fmt(book.rent_price_per_week * weeks)}
          </div>

          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center border-2 border-border/60 rounded-lg bg-white overflow-hidden">
              <button 
                className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-bold text-[#111827] text-sm">{quantity}</span>
              <button 
                className="w-10 h-10 flex items-center justify-center text-white bg-[#111827] hover:bg-black transition-colors"
                onClick={() => setQuantity(Math.min(book.quantity_available, quantity + 1))}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-4 max-w-md">
            <Button
              onClick={addToCart}
              variant="outline"
              disabled={soldOut || (activeMode === "sale" && !canBuy) || (activeMode === "rent" && !canRent)}
              className="flex-1 rounded-xl h-14 text-sm font-extrabold tracking-wide uppercase bg-white border-2 border-transparent shadow-sm hover:border-[#111827]/10 text-[#111827]"
            >
              {activeMode === "rent" ? "ADD TO CART (RENT)" : "ADD TO CART"}
            </Button>
            
            <Button
              onClick={buyNow}
              disabled={soldOut || (activeMode === "sale" && !canBuy) || (activeMode === "rent" && !canRent)}
              className="flex-1 rounded-xl h-14 text-sm font-extrabold tracking-wide uppercase bg-[#111827] text-white hover:bg-black hover:shadow-xl hover:shadow-black/20 transition-all"
            >
              BUY NOW
            </Button>
          </div>
          
          {soldOut && (
            <p className="mt-4 text-sm font-bold text-danger">Currently out of stock.</p>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
