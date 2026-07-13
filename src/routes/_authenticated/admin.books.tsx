import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, type Book } from "@/lib/types";
import { fmt } from "@/lib/cart";

export const Route = createFileRoute("/_authenticated/admin/books")({
  component: AdminBooks,
});

type BookForm = Partial<Book> & { file?: File | null };

function AdminBooks() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);

  const { data: books, isLoading } = useQuery({
    queryKey: ["admin-books"],
    queryFn: async () => {
      const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Book[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (form: BookForm) => {
      let cover_url = form.cover_url ?? null;
      if (form.file) {
        const path = `covers/${crypto.randomUUID()}-${form.file.name.replace(/[^a-z0-9.]/gi, "_")}`;
        const up = await supabase.storage.from("book-covers").upload(path, form.file, { upsert: true });
        if (up.error) throw up.error;
        cover_url = supabase.storage.from("book-covers").getPublicUrl(path).data.publicUrl;
      }
      const payload = {
        title: form.title!,
        author: form.author!,
        isbn: form.isbn ?? null,
        description: form.description ?? "",
        cover_url,
        category: form.category ?? "Fiction",
        mode: form.mode ?? "sell",
        sell_price: Number(form.sell_price ?? 0),
        original_price: form.original_price != null ? Number(form.original_price) : null,
        rent_price_per_week: Number(form.rent_price_per_week ?? 0),
        quantity_total: Number(form.quantity_total ?? 1),
        quantity_available: Number(form.quantity_available ?? form.quantity_total ?? 1),
        is_featured: form.is_featured ?? false,
      };
      if (form.id) {
        const { error } = await supabase.from("books").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("books").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-books"] });
      qc.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book saved");
      setOpen(false); setEditing(null);
    },
    onError: (e: any) => toast.error(e.message ?? "Save failed"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("books").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-books"] });
      toast.success("Book deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold">Books</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Add book</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit book" : "Add book"}</DialogTitle></DialogHeader>
            <BookFormFields initial={editing ?? undefined} onSubmit={(f) => upsert.mutate({ ...editing, ...f })} submitting={upsert.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 bg-muted rounded animate-pulse" />)}</div>
      ) : !books?.length ? (
        <div className="p-10 rounded-xl border border-dashed text-center text-muted-foreground">No books yet.</div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Book</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Mode</th>
                <th className="text-left p-3">Price</th>
                <th className="text-left p-3">Stock</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-8 bg-muted rounded overflow-hidden">{b.cover_url && <img src={b.cover_url} alt="" className="h-full w-full object-cover" />}</div>
                      <div><div className="font-medium">{b.title}</div><div className="text-xs text-muted-foreground">{b.author}</div></div>
                    </div>
                  </td>
                  <td className="p-3">{b.category}</td>
                  <td className="p-3 capitalize">{b.mode}</td>
                  <td className="p-3">{b.mode !== "rent" ? fmt(b.sell_price) : "—"} {b.mode !== "sell" && <span className="text-xs text-muted-foreground">· {fmt(b.rent_price_per_week)}/wk</span>}</td>
                  <td className="p-3">{b.quantity_available}/{b.quantity_total}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(b); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => confirm(`Delete "${b.title}"?`) && del.mutate(b.id)}><Trash2 className="h-4 w-4 text-danger" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BookFormFields({ initial, onSubmit, submitting }: { initial?: Partial<Book>; onSubmit: (f: BookForm) => void; submitting: boolean }) {
  const [form, setForm] = useState<BookForm>(initial ?? { mode: "sell", quantity_total: 1, quantity_available: 1, sell_price: 0, rent_price_per_week: 0, category: "Fiction" });
  const set = (k: keyof BookForm, v: any) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-3">
      <div><Label>Title</Label><Input required value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} /></div>
      <div><Label>Author</Label><Input required value={form.author ?? ""} onChange={(e) => set("author", e.target.value)} /></div>
      <div><Label>ISBN</Label><Input value={form.isbn ?? ""} onChange={(e) => set("isbn", e.target.value)} /></div>
      <div><Label>Description</Label><Textarea rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Mode</Label>
          <Select value={form.mode} onValueChange={(v) => set("mode", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sell">Sell only</SelectItem>
              <SelectItem value="rent">Rent only</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Sell price</Label><Input type="number" min={0} step="0.01" value={form.sell_price ?? 0} onChange={(e) => set("sell_price", e.target.value)} /></div>
        <div><Label>Original</Label><Input type="number" min={0} step="0.01" value={form.original_price ?? ""} onChange={(e) => set("original_price", e.target.value || null)} /></div>
        <div><Label>Rent/wk</Label><Input type="number" min={0} step="0.01" value={form.rent_price_per_week ?? 0} onChange={(e) => set("rent_price_per_week", e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Quantity total</Label><Input type="number" min={0} value={form.quantity_total ?? 1} onChange={(e) => set("quantity_total", e.target.value)} /></div>
        <div><Label>Quantity available</Label><Input type="number" min={0} value={form.quantity_available ?? 1} onChange={(e) => set("quantity_available", e.target.value)} /></div>
      </div>
      <div><Label>Cover URL</Label><Input value={form.cover_url ?? ""} onChange={(e) => set("cover_url", e.target.value)} placeholder="https://…" /></div>
      <div><Label>Or upload cover</Label><Input type="file" accept="image/*" onChange={(e) => set("file", e.target.files?.[0] ?? null)} /></div>
      <DialogFooter><Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save"}</Button></DialogFooter>
    </form>
  );
}
