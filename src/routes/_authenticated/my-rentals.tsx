import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import type { Rental } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/my-rentals")({
  head: () => ({ meta: [{ title: "My Rentals — Bibliophile" }] }),
  component: MyRentals,
});

function MyRentals() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-rentals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rentals")
        .select("*, orders(*, books(title, author, cover_url))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Rental[];
    },
  });

  return (
    <>
      <Header />
      <main className="container-page py-10">
        <h1 className="text-3xl font-display font-bold mb-6">My Rentals</h1>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
        ) : !data?.length ? (
          <div className="p-12 border border-dashed rounded-xl text-center text-muted-foreground">You don't have any active rentals.</div>
        ) : (
          <ul className="space-y-3">
            {data.map((r) => {
              const overdue = r.due_date && !r.returned_date && new Date(r.due_date) < new Date();
              const book = r.orders?.books;
              return (
                <li key={r.id} className="flex items-center gap-4 p-4 rounded-xl border bg-card">
                  <div className="h-20 w-14 bg-muted rounded overflow-hidden shrink-0">
                    {book?.cover_url && <img src={book.cover_url} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{book?.title}</div>
                    <div className="text-sm text-muted-foreground">{book?.author}</div>
                    <div className="text-xs mt-2 text-muted-foreground">
                      {r.start_date ? `Started ${new Date(r.start_date).toLocaleDateString()}` : "Not yet started"}
                      {r.due_date && ` · Due ${new Date(r.due_date).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    {r.returned_date ? (
                      <span className="text-success font-medium">Returned</span>
                    ) : overdue ? (
                      <span className="text-danger font-semibold">Overdue</span>
                    ) : (
                      <span className="text-primary font-medium">Active</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
