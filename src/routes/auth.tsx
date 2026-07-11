import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SitePage } from "@/components/SiteLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — ASVAB Pro" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s.redirect === "string" ? s.redirect : undefined }),
  component: Auth,
});

const emailSchema = z.string().email().max(200);
const pwSchema = z.string().min(6).max(200);

function Auth() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    try {
      emailSchema.parse(email);
      pwSchema.parse(password);
    } catch { return toast.error("Invalid email or password format"); }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate({ to: redirect ?? "/dashboard" });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    try {
      emailSchema.parse(email);
      pwSchema.parse(password);
    } catch { return toast.error("Invalid email or password (min 6 chars)"); }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name: name } },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created");
    navigate({ to: "/dashboard" });
  }

  async function forgot() {
    try { emailSchema.parse(email); } catch { return toast.error("Enter your email first"); }
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent");
  }

  return (
    <SitePage>
      <section className="mx-auto max-w-md px-4 py-16 md:px-8">
        <Card className="p-8 shadow-card">
          <h1 className="text-2xl font-bold text-center">Welcome to ASVAB Pro</h1>
          <p className="text-center text-sm text-muted-foreground mt-1">Sign in or create your account</p>
          <Tabs defaultValue="signin" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-4 mt-4">
                <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                <Button type="submit" disabled={loading} className="w-full">{loading ? "..." : "Sign in"}</Button>
                <button type="button" onClick={forgot} className="w-full text-xs text-muted-foreground hover:underline">Forgot password?</button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={signUp} className="space-y-4 mt-4">
                <div><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
                <Button type="submit" disabled={loading} className="w-full bg-gold text-gold-foreground hover:opacity-90">{loading ? "..." : "Create account"}</Button>
              </form>
            </TabsContent>
          </Tabs>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our terms. <Link to="/pricing" className="underline">See plans</Link>
          </p>
        </Card>
      </section>
    </SitePage>
  );
}
