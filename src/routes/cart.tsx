import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, ShoppingBag } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { useCart, fmt } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { items, remove, total } = useCart();
  return (
    <>
      <Header />
      <main className="container-page py-12">
        <h1 className="text-3xl font-display font-bold mb-8">Your cart</h1>
        {items.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed text-center">
            <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
            <Button asChild><Link to="/shop">Browse books</Link></Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_320px] gap-8">
            <ul className="space-y-3">
              {items.map((i) => (
                <li key={`${i.book_id}-${i.type}`} className="flex gap-4 p-4 rounded-xl border bg-card">
                  <div className="h-24 w-16 rounded-md bg-muted overflow-hidden shrink-0">
                    {i.cover_url && <img src={i.cover_url} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs uppercase text-muted-foreground">{i.author}</div>
                    <div className="font-medium">{i.title}</div>
                    <div className="text-xs mt-1">
                      {i.type === "rent" ? `Rental · ${i.rent_weeks} weeks · ${fmt(i.unit_price)}/wk` : "Purchase"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{fmt(i.type === "rent" ? i.unit_price * (i.rent_weeks ?? 1) : i.unit_price)}</div>
                    <Button variant="ghost" size="sm" className="mt-2 text-danger" onClick={() => remove(i.book_id, i.type)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <aside className="h-fit p-6 rounded-2xl border bg-card">
              <h3 className="font-semibold mb-4">Summary</h3>
              <div className="flex justify-between text-sm mb-2"><span>Subtotal</span><span>{fmt(total)}</span></div>
              <div className="flex justify-between text-sm mb-4 text-muted-foreground"><span>Shipping</span><span>Calculated at checkout</span></div>
              <div className="border-t pt-3 flex justify-between font-semibold text-lg"><span>Total</span><span>{fmt(total)}</span></div>
              <Button asChild className="w-full mt-5 rounded-full h-11"><Link to="/checkout">Checkout</Link></Button>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
