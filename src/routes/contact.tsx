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
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <h1 className="text-4xl font-bold md:text-5xl">Contact us</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">Questions about plans, content, or your account? We're here to help.</p>

        <div className="mt-12 grid gap-8 md:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            <div className="flex items-start gap-3"><Mail className="mt-0.5 h-5 w-5 text-accent" /><div><div className="font-semibold">Email</div><div className="text-sm text-muted-foreground">{settings.contact_email}</div></div></div>
            <div className="flex items-start gap-3"><Phone className="mt-0.5 h-5 w-5 text-accent" /><div><div className="font-semibold">Phone</div><div className="text-sm text-muted-foreground">{settings.contact_phone}</div></div></div>
            <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 text-accent" /><div><div className="font-semibold">Address</div><div className="text-sm text-muted-foreground">{settings.contact_address}</div></div></div>
          </div>
          <Card className="p-6 shadow-card">
            <form onSubmit={submit} className="space-y-4">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={100} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={200} /></div>
              <div><Label>Message</Label><Textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required maxLength={4000} /></div>
              <Button type="submit" disabled={submitting} className="w-full">{submitting ? "Sending..." : "Send message"}</Button>
            </form>
          </Card>
        </div>
      </section>
    </SitePage>
  );
}
