import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Bibliophile" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const doSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/" });
  };

  const doSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name }, emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — you're signed in.");
    navigate({ to: "/" });
  };

  const doGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error("Google sign-in failed");
  };

  return (
    <>
      <Header />
      <main className="container-page py-14 max-w-md">
        <h1 className="text-3xl font-display font-bold mb-2 text-center">Welcome to Bibliophile</h1>
        <p className="text-muted-foreground mb-8 text-center">Sign in to buy, rent, and manage your library.</p>
        <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
          <Button variant="outline" className="w-full mb-4" onClick={doGoogle}>Continue with Google</Button>
          <div className="relative my-4"><div className="border-t" /><span className="absolute inset-0 grid place-items-center"><span className="bg-card px-2 text-xs text-muted-foreground">or</span></span></div>
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="in">Sign in</TabsTrigger>
              <TabsTrigger value="up">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="in">
              <form onSubmit={doSignIn} className="space-y-3 mt-4">
                <div><Label htmlFor="e1">Email</Label><Input id="e1" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div><Label htmlFor="p1">Password</Label><Input id="p1" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                <Button className="w-full h-11" disabled={loading}>{loading ? "…" : "Sign in"}</Button>
              </form>
            </TabsContent>
            <TabsContent value="up">
              <form onSubmit={doSignUp} className="space-y-3 mt-4">
                <div><Label htmlFor="n2">Name</Label><Input id="n2" required value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div><Label htmlFor="e2">Email</Label><Input id="e2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div><Label htmlFor="p2">Password</Label><Input id="p2" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                <Button className="w-full h-11" disabled={loading}>{loading ? "…" : "Create account"}</Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
}
