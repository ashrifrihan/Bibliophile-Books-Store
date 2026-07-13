import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Clock, ShoppingBag, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [books, orders, rentals, overdue] = await Promise.all([
        supabase.from("books").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("rentals").select("id", { count: "exact", head: true }).is("returned_date", null),
        supabase.from("rentals").select("id", { count: "exact", head: true }).is("returned_date", null).lt("due_date", new Date().toISOString()),
      ]);
      return {
        books: books.count ?? 0,
        pendingOrders: orders.count ?? 0,
        activeRentals: rentals.count ?? 0,
        overdue: overdue.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Total books", value: data?.books ?? "—", icon: BookOpen, color: "text-primary bg-primary-soft" },
    { label: "Pending orders", value: data?.pendingOrders ?? "—", icon: ShoppingBag, color: "text-accent bg-accent-soft" },
    { label: "Active rentals", value: data?.activeRentals ?? "—", icon: Clock, color: "text-primary bg-primary-soft" },
    { label: "Overdue", value: data?.overdue ?? "—", icon: AlertCircle, color: "text-danger bg-danger/10" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="p-5 rounded-2xl border bg-card">
            <div className={`h-10 w-10 rounded-lg grid place-items-center mb-3 ${c.color}`}><c.icon className="h-5 w-5" /></div>
            <div className="text-3xl font-bold">{c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
