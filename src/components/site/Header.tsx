import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, ShoppingBag, User, Search, Phone, LogOut, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
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
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/shop", search: { q: q || undefined } as any });
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="hidden md:flex bg-primary text-primary-foreground text-xs">
        <div className="container-page flex justify-between py-2">
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3" /> +1 (840) 841-2569 · 24/7 Support
          </div>
          <div className="opacity-80">Free shipping on orders over $50</div>
        </div>
      </div>
      <div className="container-page flex items-center gap-3 md:gap-6 py-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Bibliophile</span>
        </Link>

        <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search books, authors, ISBN…"
              className="pl-9 h-11 rounded-full bg-muted/50 border-transparent focus-visible:bg-background"
              aria-label="Search catalog"
            />
          </div>
        </form>

        <div className="flex items-center gap-1 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Account">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {email ? (
                <>
                  <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/my-orders">My Orders</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/my-rentals">My Rentals</Link></DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin"><LayoutDashboard className="h-4 w-4 mr-2" /> Admin Dashboard</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
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
                  <DropdownMenuItem asChild><Link to="/auth">Sign in</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/auth">Create account</Link></DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" asChild aria-label={`Cart (${count})`} className="relative">
            <Link to="/cart">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold grid place-items-center">
                  {count}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
      <nav className="container-page pb-3 flex items-center gap-6 text-sm overflow-x-auto">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <Link to="/shop" search={{ mode: "rent" } as any} className="hover:text-primary transition-colors">Rentals</Link>
        <Link to="/shop" search={{ category: "Fiction" } as any} className="hover:text-primary transition-colors">Fiction</Link>
        <Link to="/shop" search={{ category: "Fantasy" } as any} className="hover:text-primary transition-colors">Fantasy</Link>
        <Link to="/shop" search={{ category: "Spirituality" } as any} className="hover:text-primary transition-colors">Spirituality</Link>
        <Link to="/shop" search={{ category: "Educational" } as any} className="hover:text-primary transition-colors">Educational</Link>
      </nav>
    </header>
  );
}
