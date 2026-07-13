import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, GraduationCap, Heart, Palette, Feather, Wand2, Star, ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BookCard } from "@/components/site/BookCard";
import type { Book } from "@/lib/types";
import heroImage from "@/assets/hero-books.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bibliophile Books Store — Buy & Rent Books Online" },
      { name: "description", content: "The biggest little bookstore for buying and renting your next favorite read. 10,000+ books curated across fiction, fantasy, spirituality, and more." },
      { property: "og:image", content: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&h=630&fit=crop" },
    ],
  }),
  component: Home,
});

const CATEGORY_META = [
  { name: "Fiction", icon: BookOpen, color: "bg-primary-soft text-primary" },
  { name: "Fantasy", icon: Wand2, color: "bg-accent-soft text-accent" },
  { name: "Spirituality", icon: Heart, color: "bg-primary-soft text-primary" },
  { name: "Poetry", icon: Feather, color: "bg-accent-soft text-accent" },
  { name: "Educational", icon: GraduationCap, color: "bg-primary-soft text-primary" },
  { name: "Art", icon: Palette, color: "bg-accent-soft text-accent" },
];

function Home() {
  const { data: featured, isLoading } = useQuery({
    queryKey: ["books", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data as Book[];
    },
  });

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
          {/* subtle background pattern/gradient */}
          <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          
          <div className="container-page relative z-10 grid md:grid-cols-2 gap-10 items-center">
            <div className="text-center md:text-left flex flex-col items-center md:items-start max-w-xl mx-auto md:mx-0">
              <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.1] tracking-tight text-foreground">
                Biggest <span className="text-accent underline decoration-4 underline-offset-4">bookstore</span>
                <br /> in Europe
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-md">
                We deliver books all over the world. Over 10,000+ books in stock.
              </p>
              <div className="mt-8">
                <Button asChild size="lg" className="rounded-sm bg-accent hover:bg-accent/90 text-white font-bold px-8 py-6 text-sm">
                  <Link to="/shop">
                    MEET OUR BESTSELLER <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative mt-12 md:mt-0 flex justify-center md:justify-end">
              <div className="relative w-full max-w-[450px] aspect-[4/5] flex items-center justify-center">
                {/* Book stack layout imitating the image */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 shadow-[var(--shadow-elevated)] z-0 rotate-6 transform transition-transform hover:rotate-12 duration-500">
                  <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400" alt="Book 1" className="w-full h-auto rounded-sm" />
                </div>
                <div className="absolute left-0 bottom-10 w-40 shadow-[var(--shadow-elevated)] z-10 -rotate-6 transform transition-transform hover:-rotate-12 duration-500">
                  <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400" alt="Book 2" className="w-full h-auto rounded-sm" />
                </div>
                <div className="relative z-20 w-64 shadow-[var(--shadow-elevated)] transform transition-transform hover:-translate-y-4 duration-500">
                  <img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400" alt="Book 3" className="w-full h-auto rounded-sm" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Promo Banners */}
        <section className="container-page pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/shop" className="relative overflow-hidden rounded-sm bg-[#e73a3a] p-8 min-h-[220px] flex items-center justify-between group transition-transform hover:-translate-y-1">
              <div className="relative z-10">
                <h3 className="text-3xl font-display font-bold text-white mb-4">New<br/>Release.</h3>
                <span className="inline-block bg-black/20 text-white text-xs font-bold px-4 py-2 uppercase tracking-wider rounded-sm hover:bg-black/30 transition-colors">Shop now</span>
              </div>
              <img src="https://images.unsplash.com/photo-1614113489855-66422ad300a4?auto=format&fit=crop&q=80&w=200" alt="New Release" className="absolute right-[-20px] bottom-[-20px] h-[120%] object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
            </Link>
            
            <Link to="/shop" className="relative overflow-hidden rounded-sm bg-[#52b788] p-8 min-h-[220px] flex items-center justify-between group transition-transform hover:-translate-y-1">
              <div className="relative z-10">
                <h3 className="text-3xl font-display font-bold text-white mb-4">Pre Order<br/>Now.</h3>
                <span className="inline-block bg-black/20 text-white text-xs font-bold px-4 py-2 uppercase tracking-wider rounded-sm hover:bg-black/30 transition-colors">Shop now</span>
              </div>
              <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200" alt="Pre Order" className="absolute right-4 bottom-[-10px] h-[110%] object-cover shadow-2xl group-hover:scale-105 transition-transform duration-500" />
            </Link>

            <Link to="/shop" className="relative overflow-hidden rounded-sm bg-[#1e3a8a] p-8 min-h-[220px] flex items-center justify-between group transition-transform hover:-translate-y-1">
              <div className="relative z-10">
                <h3 className="text-3xl font-display font-bold text-white mb-4">Top<br/>Rated.</h3>
                <span className="inline-block bg-white/20 text-white text-xs font-bold px-4 py-2 uppercase tracking-wider rounded-sm hover:bg-white/30 transition-colors">Shop now</span>
              </div>
              <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=200" alt="Top Rated" className="absolute right-4 bottom-[-10px] h-[110%] object-cover shadow-2xl group-hover:scale-105 transition-transform duration-500" />
            </Link>
          </div>
        </section>
        
        {/* Horizontal Discount Banner */}
        <section className="container-page pb-16">
          <div className="relative rounded-sm bg-[#e2e8f0] overflow-hidden flex flex-col md:flex-row items-center justify-center p-8 md:p-12 text-center min-h-[200px]">
            <div className="absolute left-10 bottom-0 hidden md:block w-48 opacity-80">
               <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400" alt="Student" className="rounded-t-full h-full object-cover grayscale mix-blend-multiply" />
            </div>
            
            <div className="relative z-10 md:px-32">
              <span className="text-sm font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">More bang for your book</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">20% Off Select Books</h2>
              <Button asChild className="rounded-sm bg-black text-white hover:bg-black/80 px-8">
                <Link to="/shop">Shop now</Link>
              </Button>
            </div>
            
            <div className="absolute right-0 bottom-[-50px] hidden md:block w-64 rotate-12 opacity-90 mix-blend-multiply">
               <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400" alt="Books" className="w-full h-auto" />
            </div>
          </div>
        </section>

        {/* Trending */}
        <section className="container-page pb-20">
          <div className="flex items-end justify-between mb-8 border-b pb-4">
            <h2 className="text-2xl font-display font-bold text-[#1e3a5f]">Trending on Bookio</h2>
            <Link to="/shop" className="text-sm font-semibold text-muted-foreground hover:text-primary flex items-center">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-sm bg-muted animate-pulse" />
              ))}
            </div>
          ) : !featured?.length ? (
            <p className="text-muted-foreground">No books yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {featured.map((b) => <BookCard key={b.id} book={b} />)}
            </div>
          )}
        </section>
        
        {/* Top Categories */}
        <section className="container-page pb-20 text-center">
           <h2 className="text-2xl font-display font-bold text-[#1e3a5f] mb-10">Top Categories</h2>
           <div className="flex flex-wrap justify-center gap-8">
            {CATEGORY_META.map((c) => (
              <Link
                key={c.name}
                to="/shop"
                search={{ category: c.name } as any}
                className="group flex flex-col items-center gap-4 text-center w-24 md:w-32"
              >
                <div className={`h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden border-4 border-transparent group-hover:border-primary/20 transition-all duration-300 relative shadow-sm`}>
                  <div className={`absolute inset-0 ${c.color} opacity-20`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <c.icon className="h-10 w-10 opacity-70 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
