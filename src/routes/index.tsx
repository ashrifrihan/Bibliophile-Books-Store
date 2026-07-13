import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, BookOpen, GraduationCap, Heart, Palette, Feather, Wand2, Star, ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { HorizontalBookCard } from "@/components/site/HorizontalBookCard";
import { Marquee } from "@/components/site/Marquee";
import type { Book } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bibliophile Books Store" },
      { name: "description", content: "The biggest bookstore in Sri Lanka for buying and renting your next favorite read. 10,000+ books curated across fiction, fantasy, spirituality, and more." },
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
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Promo Banners Scroll
    gsap.utils.toArray('.promo-banner').forEach((banner: any, i) => {
      gsap.from(banner, {
        scrollTrigger: {
          trigger: banner,
          start: "top bottom-=100px",
          toggleActions: "play none none reverse"
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.1,
        ease: "power2.out"
      });
    });

    // Discount Banner Scale
    gsap.from(".discount-banner", {
      scrollTrigger: {
        trigger: ".discount-banner",
        start: "top bottom-=100px",
      },
      scale: 0.95,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });

    // Trending Stagger
    gsap.from(".trending-item", {
      scrollTrigger: {
        trigger: ".trending-grid",
        start: "top bottom-=50px",
      },
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out"
    });
  }, { scope: containerRef });

  const { data: featured, isLoading } = useQuery({
    queryKey: ["books", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("is_featured", true)
        .limit(6);
      
      if (error) throw error;
      return data as Book[];
    },
  });

  return (
    <div className="bg-background min-h-screen" ref={containerRef}>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 bg-gradient-to-br from-primary via-primary/95 to-[#16554b] text-white">
          {/* Background Patterns & Blobs */}
          <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
          
          <div className="container-page relative z-10 grid lg:grid-cols-12 gap-12 md:gap-16 items-center">
            <div className="lg:col-span-6 xl:col-span-7 text-center md:text-left flex flex-col items-center md:items-start mx-auto md:mx-0">
              <span className="hero-element inline-block bg-accent/20 text-accent font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-6 border border-accent/30 shadow-sm shadow-accent/5">
                Special Offer
              </span>
              <h1 className="hero-element font-display font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] tracking-tight">
                Biggest bookstore
                <br /> in <span className="text-accent">Sri Lanka</span>
              </h1>
              <p className="hero-element mt-6 text-lg sm:text-xl text-emerald-100/90 max-w-lg leading-relaxed">
                We deliver books island-wide. Over 10,000+ books in stock. Find the perfect gift for everyone on your list.
              </p>
              <div className="hero-element mt-8 sm:mt-10">
                <Button asChild size="lg" className="rounded-full bg-accent hover:bg-accent/90 text-white font-bold px-8 py-7 text-sm shadow-lg shadow-accent/25 hover:-translate-y-0.5 transition-transform duration-300">
                  <Link to="/shop">
                    MEET OUR BESTSELLER <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-6 xl:col-span-5 relative mt-12 lg:mt-0 flex justify-center items-center h-full">
              <div className="relative w-full max-w-[450px] aspect-square flex items-center justify-center">
                {/* Background decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/15 to-transparent rounded-full filter blur-2xl opacity-40 pointer-events-none" />
                
                {/* Floating SVG Leaves */}
                <svg className="absolute -top-6 -left-6 w-20 h-20 text-emerald-300/10 pointer-events-none transform -rotate-45" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7.04,18.5C8.14,19.38 9.5,20 11,20C18,20 20,12 20,12C20,12 19,10.12 17,8M11,18C8.8,18 7,15 7,15C7,15 8.5,12.7 11,12C13.5,11.3 16.5,12 16.5,12C16.5,12 13.2,18 11,18Z" />
                </svg>
                <svg className="absolute -bottom-6 -right-6 w-24 h-24 text-emerald-300/10 pointer-events-none transform rotate-45" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7.04,18.5C8.14,19.38 9.5,20 11,20C18,20 20,12 20,12C20,12 19,10.12 17,8M11,18C8.8,18 7,15 7,15C7,15 8.5,12.7 11,12C13.5,11.3 16.5,12 16.5,12C16.5,12 13.2,18 11,18Z" />
                </svg>
                
                <div className="relative w-full flex flex-col items-center justify-center">
                  {/* Flat shadows beneath books */}
                  <div className="absolute w-[240px] sm:w-[300px] h-6 bg-black/40 rounded-full filter blur-md transform translate-y-32" />
                  
                  {/* Book 1 (Left tilted) */}
                  <div className="hero-book absolute w-[120px] sm:w-[210px] aspect-[3/4] shadow-[0_20px_40px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden border-2 border-white/20 transform -rotate-12 -translate-x-6 sm:-translate-x-12 translate-y-2 hover:rotate-0 hover:translate-y-0 transition-all duration-500">
                    <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400" alt="Book 1" className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Book 2 (Right tilted) */}
                  <div className="hero-book absolute w-[120px] sm:w-[210px] aspect-[3/4] shadow-[0_20px_40px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden border-2 border-white/20 transform rotate-12 translate-x-6 sm:translate-x-12 translate-y-1 hover:rotate-0 hover:translate-y-0 transition-all duration-500">
                    <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400" alt="Book 2" className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Book 3 (Top straight focus) */}
                  <div className="hero-book relative w-[130px] sm:w-[220px] aspect-[3/4] shadow-[0_25px_50px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden border-4 border-white transform hover:scale-105 transition-all duration-500 z-10">
                    <img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400" alt="Book 3" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Scrolling Features Marquee */}
        <section className="bg-primary text-primary-foreground py-4 border-y border-primary-foreground/10 overflow-hidden">
          <Marquee pauseOnHover className="[--duration:20s]" repeat={5}>
            <div className="flex items-center gap-8 px-4 font-bold tracking-widest uppercase text-sm">
              <span className="flex items-center gap-2"><BookOpen className="h-4 w-4"/> 10,000+ Books</span>
              <span>•</span>
              <span className="flex items-center gap-2"><Star className="h-4 w-4"/> Top Rated Authors</span>
              <span>•</span>
              <span className="flex items-center gap-2"><Feather className="h-4 w-4"/> Island-wide Delivery</span>
              <span>•</span>
              <span className="flex items-center gap-2"><Wand2 className="h-4 w-4"/> Rare Collections</span>
              <span>•</span>
            </div>
          </Marquee>
        </section>

        {/* Promo Banners */}
        <section className="container-page py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/shop" className="promo-banner relative overflow-hidden rounded-xl bg-[#e73a3a] p-8 min-h-[220px] flex items-center justify-between group">
              <div className="relative z-10">
                <h3 className="text-3xl font-display font-bold text-white mb-4">New<br/>Release.</h3>
                <span className="inline-block bg-black/20 text-white text-xs font-bold px-4 py-2 uppercase tracking-wider rounded-sm hover:bg-black/30 transition-colors">Shop now</span>
              </div>
              <img src="https://images.unsplash.com/photo-1614113489855-66422ad300a4?auto=format&fit=crop&q=80&w=200" alt="New Release" className="absolute right-[-20px] bottom-[-20px] h-[120%] object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
            </Link>
            
            <Link to="/shop" className="promo-banner relative overflow-hidden rounded-xl bg-[#52b788] p-8 min-h-[220px] flex items-center justify-between group">
              <div className="relative z-10">
                <h3 className="text-3xl font-display font-bold text-white mb-4">Pre Order<br/>Now.</h3>
                <span className="inline-block bg-black/20 text-white text-xs font-bold px-4 py-2 uppercase tracking-wider rounded-sm hover:bg-black/30 transition-colors">Shop now</span>
              </div>
              <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200" alt="Pre Order" className="absolute right-4 bottom-[-10px] h-[110%] object-cover shadow-2xl group-hover:scale-105 transition-transform duration-500" />
            </Link>

            <Link to="/shop" className="promo-banner relative overflow-hidden rounded-xl bg-[#1e3a8a] p-8 min-h-[220px] flex items-center justify-between group">
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
          <div className="discount-banner relative rounded-2xl bg-[#e2e8f0] overflow-hidden flex flex-col md:flex-row items-center justify-center p-8 md:p-12 text-center min-h-[200px]">
            <div className="absolute left-10 bottom-0 hidden md:block w-48 opacity-80">
               <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400" alt="Student" className="rounded-t-full h-full object-cover grayscale mix-blend-multiply" />
            </div>
            
            <div className="relative z-10 md:px-32">
              <span className="text-sm font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">More bang for your book</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">20% Off Select Books</h2>
              <Button asChild className="rounded-full bg-black text-white hover:bg-black/80 px-8">
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
            <h2 className="text-2xl font-display font-bold text-primary">Trending on Bibliophile</h2>
            <Link to="/shop" className="text-sm font-semibold text-muted-foreground hover:text-primary flex items-center">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-3xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : !featured?.length ? (
            <p className="text-muted-foreground">No books yet.</p>
          ) : (
            <div className="trending-grid grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featured.map((b) => <div key={b.id} className="trending-item"><HorizontalBookCard book={b} /></div>)}
            </div>
          )}
        </section>
        
        {/* Top Categories */}
        <section className="container-page pb-20 text-center">
           <h2 className="text-2xl font-display font-bold text-primary mb-10">Top Categories</h2>
           <div className="flex flex-wrap justify-center gap-8">
            {CATEGORY_META.map((c, i) => (
              <Link
                key={c.name}
                to="/shop"
                search={{ category: c.name } as any}
                className="promo-banner group flex flex-col items-center gap-4 text-center w-24 md:w-32"
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
