import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { useCart, fmt } from "@/lib/cart";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const placeOrder = async () => {
    if (!userId) { navigate({ to: "/auth" }); return; }
    if (items.length === 0) return;
    setPlacing(true);
    try {
      const rows = items.map((i) => ({
        user_id: userId,
        book_id: i.book_id,
        type: i.type,
        status: "pending" as const,
        payment_status: "pending" as const,
        amount: i.type === "rent" ? i.unit_price * (i.rent_weeks ?? 1) : i.unit_price,
        rent_weeks: i.type === "rent" ? i.rent_weeks ?? 2 : null,
      }));
      const { error } = await supabase.from("orders").insert(rows);
      if (error) throw error;
      clear();
      toast.success("Order placed! Awaiting payment confirmation.");
      navigate({ to: "/my-orders" });
    } catch (e: any) {
      toast.error(e.message ?? "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="container-page py-16 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Button asChild className="mt-4"><Link to="/shop">Browse books</Link></Button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container-page py-12 max-w-2xl">
        <h1 className="text-3xl font-display font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground mb-8">Cash or bank transfer on delivery. Your order will be confirmed by the store owner.</p>
        <div className="rounded-2xl border p-6 bg-card">
          <h3 className="font-semibold mb-4">Order summary</h3>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={`${i.book_id}-${i.type}`} className="flex justify-between">
                <span>{i.title} <span className="text-muted-foreground">· {i.type === "rent" ? `Rental ${i.rent_weeks}wk` : "Purchase"}</span></span>
                <span>{fmt(i.type === "rent" ? i.unit_price * (i.rent_weeks ?? 1) : i.unit_price)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t mt-4 pt-4 flex justify-between font-semibold"><span>Total</span><span>{fmt(total)}</span></div>
        </div>
        {!userId && (
          <p className="mt-4 text-sm text-muted-foreground">
            You need to <Link to="/auth" className="text-primary underline">sign in</Link> to place an order.
          </p>
        )}
        <Button onClick={placeOrder} disabled={placing || !userId} className="mt-6 w-full h-12 rounded-full">
          {placing ? "Placing…" : "Place order"}
        </Button>
      </main>
      <Footer />
    </>
  );
}
