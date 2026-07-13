import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Badge } from "@/components/ui/badge";
import { fmt } from "@/lib/cart";
import type { Order } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/my-orders")({
  head: () => ({ meta: [{ title: "My Orders — Bibliophile" }] }),
  component: MyOrders,
});

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-warning/20 text-warning",
  confirmed: "bg-primary/15 text-primary",
  active: "bg-primary/15 text-primary",
  completed: "bg-success/15 text-success",
  cancelled: "bg-muted text-muted-foreground",
};

function MyOrders() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, books(title, author, cover_url)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  return (
    <>
      <Header />
      <main className="container-page py-10">
        <h1 className="text-3xl font-display font-bold mb-6">My Orders</h1>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
        ) : !data?.length ? (
          <div className="p-12 border border-dashed rounded-xl text-center text-muted-foreground">You haven't placed any orders yet.</div>
        ) : (
          <ul className="space-y-3">
            {data.map((o) => (
              <li key={o.id} className="flex items-center gap-4 p-4 rounded-xl border bg-card">
                <div className="h-20 w-14 bg-muted rounded overflow-hidden shrink-0">
                  {o.books?.cover_url && <img src={o.books.cover_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{o.books?.title}</div>
                  <div className="text-sm text-muted-foreground">{o.books?.author}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <Badge variant="outline">{o.type === "sale" ? "Purchase" : "Rental"}</Badge>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${o.payment_status === "paid" ? "bg-success/15 text-success" : "bg-warning/20 text-warning"}`}>
                      Payment: {o.payment_status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{fmt(Number(o.amount))}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
