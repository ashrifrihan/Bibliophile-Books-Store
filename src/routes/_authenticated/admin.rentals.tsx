import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Rental } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/rentals")({
  component: AdminRentals,
});

function AdminRentals() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-rentals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rentals")
        .select("*, orders(*, books(title, author, cover_url))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Rental[];
    },
  });

  const markReturned = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rentals").update({ returned_date: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-rentals"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Return recorded");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Rentals</h1>
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
      ) : !data?.length ? (
        <div className="p-10 rounded-xl border border-dashed text-center text-muted-foreground">No rentals yet. Confirm rental orders to start.</div>
      ) : (
        <div className="space-y-3">
          {data.map((r) => {
            const overdue = r.due_date && !r.returned_date && new Date(r.due_date) < new Date();
            const book = r.orders?.books;
            return (
              <div key={r.id} className={`p-4 rounded-xl border bg-card flex flex-wrap items-center gap-3 ${overdue ? "border-danger/50 bg-danger/5" : ""}`}>
                <div className="h-14 w-10 bg-muted rounded overflow-hidden">{book?.cover_url && <img src={book.cover_url} alt="" className="h-full w-full object-cover" />}</div>
                <div className="flex-1 min-w-[160px]">
                  <div className="font-medium">{book?.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.start_date && `Started ${new Date(r.start_date).toLocaleDateString()}`}
                    {r.due_date && ` · Due ${new Date(r.due_date).toLocaleDateString()}`}
                  </div>
                </div>
                {r.returned_date ? (
                  <Badge className="bg-success text-success-foreground">Returned</Badge>
                ) : overdue ? (
                  <Badge className="bg-danger text-danger-foreground">Overdue</Badge>
                ) : (
                  <Badge>Active</Badge>
                )}
                {!r.returned_date && (
                  <Button size="sm" className="ml-auto" onClick={() => markReturned.mutate(r.id)}>Mark returned</Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
