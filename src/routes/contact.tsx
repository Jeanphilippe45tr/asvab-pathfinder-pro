import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getSiteSettings, submitContactMessage } from "@/lib/site.functions";
import { SitePage } from "@/components/SiteLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const q = queryOptions({ queryKey: ["settings"], queryFn: () => getSiteSettings() });

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — ASVAB Pro" }, { name: "description", content: "Get in touch with the ASVAB Pro team." }] }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(q); },
  component: Contact,
});

function Contact() {
  const { data: settings } = useSuspenseQuery(q);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitting(true);
    try {
      await submitContactMessage({ data: form });
      toast.success("Message sent — we'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SitePage footerData={settings}>
      <section className="relative overflow-hidden bg-hero text-navy-foreground">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center md:px-8 md:py-24 animate-fade-in-up">
          <div className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-wider">Contact</div>
          <h1 className="mt-4 text-4xl font-bold md:text-6xl">We're here to help.</h1>
          <p className="mt-4 text-lg opacity-90">Questions about plans, content, or your account? Reach out — a real human replies within one business day.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4 animate-fade-in-up">
            <Card className="p-5 shadow-card"><div className="flex items-start gap-3"><Mail className="mt-0.5 h-5 w-5 text-accent" /><div><div className="font-semibold">Email</div><div className="text-sm text-muted-foreground">{settings.contact_email}</div></div></div></Card>
            <Card className="p-5 shadow-card"><div className="flex items-start gap-3"><Phone className="mt-0.5 h-5 w-5 text-accent" /><div><div className="font-semibold">Phone</div><div className="text-sm text-muted-foreground">{settings.contact_phone}</div></div></div></Card>
            <Card className="p-5 shadow-card"><div className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 text-accent" /><div><div className="font-semibold">Address</div><div className="text-sm text-muted-foreground">{settings.contact_address}</div></div></div></Card>
            <div className="rounded-lg border bg-secondary/40 p-5 text-sm text-muted-foreground">
              <div className="font-semibold text-foreground">Support hours</div>
              <div className="mt-1">Mon–Fri · 9am – 6pm ET</div>
              <div>Sat · 10am – 2pm ET</div>
            </div>
          </div>
          <Card className="p-6 shadow-card animate-fade-in-up delay-200">
            <h2 className="text-2xl font-bold">Send us a message</h2>
            <p className="mt-1 text-sm text-muted-foreground">We reply within one business day.</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={100} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={200} /></div>
              <div><Label>Message</Label><Textarea rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required maxLength={4000} /></div>
              <Button type="submit" disabled={submitting} className="w-full bg-gold text-gold-foreground hover:opacity-90">{submitting ? "Sending..." : "Send message"}</Button>
            </form>
          </Card>
        </div>
      </section>
    </SitePage>
  );
}

