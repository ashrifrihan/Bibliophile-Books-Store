import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fmt } from "@/lib/cart";
import type { Order } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, books(title, author, cover_url)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch, rentWeeks }: { id: string; patch: Record<string, unknown>; rentWeeks?: number | null }) => {
      const { error } = await supabase.from("orders").update(patch as never).eq("id", id);
      if (error) throw error;
      // If it's a rental becoming active, create the rental row
      if (patch.status === "active" && rentWeeks) {
        const start = new Date();
        const due = new Date(start.getTime() + rentWeeks * 7 * 24 * 60 * 60 * 1000);
        const { error: rErr } = await supabase.from("rentals").insert({
          order_id: id,
          start_date: start.toISOString(),
          due_date: due.toISOString(),
        });
        if (rErr) throw rErr;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-rentals"] });
      toast.success("Order updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Orders</h1>
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
      ) : !data?.length ? (
        <div className="p-10 rounded-xl border border-dashed text-center text-muted-foreground">No orders yet.</div>
      ) : (
        <div className="space-y-3">
          {data.map((o) => (
            <div key={o.id} className="p-4 rounded-xl border bg-card flex flex-wrap items-center gap-3">
              <div className="h-14 w-10 bg-muted rounded overflow-hidden">{o.books?.cover_url && <img src={o.books.cover_url} alt="" className="h-full w-full object-cover" />}</div>
              <div className="flex-1 min-w-[160px]">
                <div className="font-medium">{o.books?.title}</div>
                <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
              </div>
              <Badge variant="outline">{o.type === "sale" ? "Purchase" : `Rental ${o.rent_weeks}w`}</Badge>
              <Badge className="capitalize">{o.status}</Badge>
              <Badge variant={o.payment_status === "paid" ? "default" : "secondary"}>Pay: {o.payment_status}</Badge>
              <div className="font-semibold">{fmt(Number(o.amount))}</div>
              <div className="flex gap-2 ml-auto">
                {o.payment_status === "pending" && (
                  <Button size="sm" variant="outline" onClick={() => update.mutate({ id: o.id, patch: { payment_status: "paid" } })}>Mark paid</Button>
                )}
                {o.status === "pending" && o.type === "sale" && (
                  <Button size="sm" onClick={() => update.mutate({ id: o.id, patch: { status: "confirmed" } })}>Confirm</Button>
                )}
                {o.status === "pending" && o.type === "rent" && (
                  <Button size="sm" onClick={() => update.mutate({ id: o.id, patch: { status: "active" }, rentWeeks: o.rent_weeks ?? 2 })}>Start rental</Button>
                )}
                {o.status === "confirmed" && (
                  <Button size="sm" variant="secondary" onClick={() => update.mutate({ id: o.id, patch: { status: "completed" } })}>Complete</Button>
                )}
                {o.status !== "cancelled" && o.status !== "completed" && (
                  <Button size="sm" variant="ghost" className="text-danger" onClick={() => update.mutate({ id: o.id, patch: { status: "cancelled" } })}>Cancel</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
