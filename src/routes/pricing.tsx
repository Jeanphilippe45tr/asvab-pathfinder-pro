import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getSiteSettings, getPlans } from "@/lib/site.functions";
import { SitePage } from "@/components/SiteLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ShieldCheck, HelpCircle } from "lucide-react";

const settingsQ = queryOptions({ queryKey: ["settings"], queryFn: () => getSiteSettings() });
const plansQ = queryOptions({ queryKey: ["plans"], queryFn: () => getPlans() });

const FAQ = [
  { q: "Do I have to pay right away?", a: "No — take the free 7-minute tutorial first. When you're ready, choose a plan and simulate payment for testing." },
  { q: "Why does an admin have to approve my access?", a: "Every subscription is reviewed by an admin before content unlocks. This protects both you and the platform." },
  { q: "Can I upgrade or downgrade later?", a: "Yes. Reach out through the Contact page and we'll switch your tier with no fuss." },
  { q: "Is there a refund policy?", a: "Yes — 7 days, no questions asked. Just email us." },
];

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — ASVAB Pro Plans that Fit Your Prep" },
      { name: "description", content: "Choose Basic, Standard, or Premium ASVAB Pro. Simple, honest pricing with a 7-day money-back guarantee." },
      { property: "og:title", content: "ASVAB Pro Pricing" },
      { property: "og:description", content: "Simple, honest plans for every candidate." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(settingsQ);
    context.queryClient.ensureQueryData(plansQ);
  },
  component: Pricing,
});

function Pricing() {
  const { data: settings } = useSuspenseQuery(settingsQ);
  const { data: plans } = useSuspenseQuery(plansQ);
  return (
    <SitePage footerData={settings}>
      <section className="relative overflow-hidden bg-hero text-navy-foreground">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center md:px-8 md:py-24 animate-fade-in-up">
          <div className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-wider">Pricing</div>
          <h1 className="mt-4 text-4xl font-bold md:text-6xl">Simple plans. Serious results.</h1>
          <p className="mt-4 text-lg opacity-90">Every plan includes the free tutorial, mobile access, and our 7-day money-back guarantee.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((p: any, i: number) => (
            <Card key={p.id} className={`p-8 shadow-card hover-lift hover-lift-on animate-fade-in-up delay-${(i + 1) * 100} ${i === 1 ? "border-accent ring-2 ring-accent/40" : ""}`}>
              {i === 1 && <div className="mb-2 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">Most popular</div>}
              <div className="text-sm uppercase tracking-wider text-muted-foreground">{p.name}</div>
              <div className="mt-3 text-5xl font-bold">${(p.price_cents / 100).toFixed(0)}<span className="text-base font-normal text-muted-foreground">/mo</span></div>
              <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              <ul className="mt-6 space-y-2 text-sm">
                {(p.features as string[]).map((f: string) => (
                  <li key={f} className="flex gap-2"><Check className="h-4 w-4 flex-none text-accent mt-0.5" /> {f}</li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full" variant={i === 1 ? "default" : "outline"}>
                <Link to="/checkout/$planId" params={{ planId: p.id }}>Choose {p.name}</Link>
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-3 rounded-lg border bg-secondary/40 p-5 text-sm text-muted-foreground animate-fade-in">
          <ShieldCheck className="h-5 w-5 flex-none text-accent" />
          <span>All access is admin-approved for your security. You'll be notified as soon as your plan is activated.</span>
        </div>
      </section>

      <section className="bg-secondary/40">
        <div className="mx-auto max-w-4xl px-4 py-20 md:px-8">
          <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">Frequently asked</div>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">Answers before you subscribe</h2>
          </div>
          <div className="mt-10 grid gap-4">
            {FAQ.map((f, i) => (
              <Card key={f.q} className={`p-6 shadow-card animate-fade-in-up delay-${(i + 1) * 100}`}>
                <div className="flex items-start gap-3">
                  <HelpCircle className="mt-0.5 h-5 w-5 flex-none text-accent" />
                  <div>
                    <div className="font-semibold">{f.q}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </SitePage>
  );
}
