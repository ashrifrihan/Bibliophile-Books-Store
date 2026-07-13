import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, ShoppingBag, User, Search, Phone, LogOut, LayoutDashboard, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { count } = useCart();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [q, setQ] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setEmail(data.user?.email ?? null);
      if (data.user) {
        const { data: r } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id);
        setIsAdmin(!!r?.some((x) => x.role === "admin"));
      } else setIsAdmin(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setEmail(s?.user?.email ?? null);
      if (!s) setIsAdmin(false);
    });
    
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      sub.subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { data: suggestions, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ["search-suggestions", q],
    queryFn: async () => {
      if (!q || q.length < 2) return [];
      const { data, error } = await supabase
        .from("books")
        .select("id, title, author, cover_url")
        .or(`title.ilike.%${q}%,author.ilike.%${q}%`)
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: q.length >= 2,
  });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    navigate({ to: "/shop", search: { q: q || undefined } as any });
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border shadow-sm">
      <div className="hidden md:flex bg-primary text-primary-foreground text-xs">
        <div className="container-page flex justify-between py-2">
          <div className="flex items-center gap-2 font-medium">
            <Phone className="h-3 w-3" /> +94 75 930 3944 · 24/7 Support
          </div>
          <div className="opacity-90 font-medium">Free shipping on orders over Rs.5000</div>
        </div>
      </div>
      <div className="container-page flex items-center justify-between gap-3 md:gap-6 py-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center shadow-md">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-primary">Bibliophile</span>
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-auto relative" ref={searchRef}>
          <form onSubmit={onSearch} className="w-full">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search books, authors…"
                className="pl-10 pr-4 h-11 rounded-full bg-muted/40 border border-border focus-visible:bg-background focus-visible:ring-primary shadow-sm w-full"
                aria-label="Search catalog"
              />
            </div>
          </form>
          
          {/* Search Suggestions Dropdown */}
          {showSuggestions && q.length >= 2 && (
            <div className="absolute top-full mt-2 w-full bg-background border border-border rounded-xl shadow-[var(--shadow-elevated)] overflow-hidden z-50">
              {isLoadingSuggestions ? (
                <div className="p-4 text-center text-sm flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                </div>
              ) : suggestions && suggestions.length > 0 ? (
                <div className="py-2">
                  {suggestions.map((book) => (
                    <Link
                      key={book.id}
                      to="/book/$id"
                      params={{ id: book.id }}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
                    >
                      <div className="h-10 w-8 shrink-0 rounded bg-muted overflow-hidden">
                        {book.cover_url ? (
                          <img src={book.cover_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <BookOpen className="h-full w-full p-2 text-muted-foreground opacity-20" />
                        )}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-semibold truncate text-foreground">{book.title}</span>
                        <span className="text-xs text-muted-foreground truncate">{book.author}</span>
                      </div>
                    </Link>
                  ))}
                  <div className="px-4 py-2 border-t mt-2">
                    <button 
                      onClick={onSearch}
                      className="text-sm text-primary font-medium hover:underline w-full text-center"
                    >
                      View all results for "{q}"
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No books found for "{q}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Account" className="rounded-full hover:bg-muted/80">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-[var(--shadow-card)]">
              {email ? (
                <>
                  <DropdownMenuLabel className="truncate font-semibold text-primary">{email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer"><Link to="/my-orders">My Orders</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer"><Link to="/my-rentals">My Rentals</Link></DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link to="/admin"><LayoutDashboard className="h-4 w-4 mr-2" /> Admin Dashboard</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-danger focus:text-danger focus:bg-danger/10 cursor-pointer"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      navigate({ to: "/" });
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild className="cursor-pointer"><Link to="/auth">Sign in</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer"><Link to="/auth">Create account</Link></DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" asChild aria-label={`Cart (${count})`} className="relative rounded-full border-border hover:bg-muted/80">
            <Link to="/cart">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-accent text-accent-foreground text-[11px] font-bold grid place-items-center shadow-sm">
                  {count}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden container-page pb-3">
        <form onSubmit={onSearch} className="w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search books…"
            className="pl-10 pr-4 h-10 rounded-full bg-muted/40 border border-border shadow-sm w-full text-sm"
          />
        </form>
      </div>

      <nav className="container-page pb-3 flex items-center gap-6 md:gap-8 text-sm font-semibold overflow-x-auto text-primary whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Link to="/" className="hover:text-primary transition-colors hover:underline underline-offset-4 decoration-2 decoration-primary/30">Home</Link>
        <Link to="/shop" className="hover:text-primary transition-colors hover:underline underline-offset-4 decoration-2 decoration-primary/30">Shop</Link>
        <Link to="/shop" search={{ mode: "rent" } as any} className="hover:text-primary transition-colors hover:underline underline-offset-4 decoration-2 decoration-primary/30">Rentals</Link>
        <Link to="/shop" search={{ category: "Fiction" } as any} className="hover:text-primary transition-colors hover:underline underline-offset-4 decoration-2 decoration-primary/30">Fiction</Link>
        <Link to="/shop" search={{ category: "Fantasy" } as any} className="hover:text-primary transition-colors hover:underline underline-offset-4 decoration-2 decoration-primary/30">Fantasy</Link>
        <Link to="/shop" search={{ category: "Spirituality" } as any} className="hover:text-primary transition-colors hover:underline underline-offset-4 decoration-2 decoration-primary/30">Spirituality</Link>
        <Link to="/shop" search={{ category: "Educational" } as any} className="hover:text-primary transition-colors hover:underline underline-offset-4 decoration-2 decoration-primary/30">Educational</Link>
      </nav>
    </header>
  );
}
