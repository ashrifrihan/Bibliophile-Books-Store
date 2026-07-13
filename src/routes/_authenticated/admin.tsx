import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { LayoutDashboard, BookOpen, ShoppingBag, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    if (!roles?.some((r) => r.role === "admin")) throw redirect({ to: "/" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <>
      <Header />
      <div className="container-page py-8 grid md:grid-cols-[220px_1fr] gap-8">
        <aside className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground px-3 mb-2">Admin</p>
          <Link to="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm" activeProps={{ className: "bg-primary text-primary-foreground" }} activeOptions={{ exact: true }}>
            <LayoutDashboard className="h-4 w-4" /> Overview
          </Link>
          <Link to="/admin/books" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm" activeProps={{ className: "bg-primary text-primary-foreground" }}>
            <BookOpen className="h-4 w-4" /> Books
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm" activeProps={{ className: "bg-primary text-primary-foreground" }}>
            <ShoppingBag className="h-4 w-4" /> Orders
          </Link>
          <Link to="/admin/rentals" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm" activeProps={{ className: "bg-primary text-primary-foreground" }}>
            <Clock className="h-4 w-4" /> Rentals
          </Link>
        </aside>
        <main><Outlet /></main>
      </div>
    </>
  );
}
