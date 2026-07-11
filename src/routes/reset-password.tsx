import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SitePage } from "@/components/SiteLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — ASVAB Pro" }] }),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    nav({ to: "/dashboard" });
  }
  return (
    <SitePage>
      <section className="mx-auto max-w-md px-4 py-16">
        <Card className="p-8 shadow-card">
          <h1 className="text-2xl font-bold">Set a new password</h1>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div><Label>New password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={6} /></div>
            <Button type="submit" disabled={loading} className="w-full">Update password</Button>
          </form>
        </Card>
      </section>
    </SitePage>
  );
}
