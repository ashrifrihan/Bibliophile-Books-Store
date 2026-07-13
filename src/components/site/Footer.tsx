import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="container-page py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-lg bg-primary-foreground text-primary grid place-items-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-xl">Bibliophile</span>
          </div>
          <p className="text-sm opacity-80 max-w-xs">
            A neighborhood bookstore for readers, dreamers, and collectors. Buy or rent
            — always thoughtfully curated.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/shop">All Books</Link></li>
            <li><Link to="/shop" search={{ mode: "rent" } as any}>Rentals</Link></li>
            <li><Link to="/shop" search={{ category: "Fiction" } as any}>Fiction</Link></li>
            <li><Link to="/shop" search={{ category: "Educational" } as any}>Educational</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Account</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/my-orders">My Orders</Link></li>
            <li><Link to="/my-rentals">My Rentals</Link></li>
            <li><Link to="/auth">Sign in</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Newsletter</h4>
          <p className="text-sm opacity-80 mb-3">New arrivals and rare finds, monthly.</p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <Input type="email" placeholder="you@example.com" className="bg-primary-foreground text-foreground" />
            <Button type="submit" variant="secondary">Join</Button>
          </form>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container-page py-4 text-xs opacity-70 flex justify-between">
          <span>© {new Date().getFullYear()} Bibliophile Books Store</span>
          <span>
            developed is <a href="https://nexlora-io.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:underline">nexzoa</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
