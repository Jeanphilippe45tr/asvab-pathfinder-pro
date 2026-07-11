import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getSiteSettings, getPlans } from "@/lib/site.functions";
import { SitePage } from "@/components/SiteLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const settingsQ = queryOptions({ queryKey: ["settings"], queryFn: () => getSiteSettings() });
const plansQ = queryOptions({ queryKey: ["plans"], queryFn: () => getPlans() });

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Pricing — ASVAB Pro" }, { name: "description", content: "Choose the ASVAB Pro plan that fits your prep." }] }),
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
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Pricing</h1>
          <p className="mt-3 text-muted-foreground">Start today. Cancel anytime. All plans require admin approval to activate.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((p: any, i: number) => (
            <Card key={p.id} className={`p-8 shadow-card ${i === 1 ? "border-accent ring-2 ring-accent/30" : ""}`}>
              {i === 1 && <div className="mb-2 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">Most popular</div>}
              <div className="text-sm uppercase tracking-wider text-muted-foreground">{p.name}</div>
              <div className="mt-3 text-4xl font-bold">${(p.price_cents / 100).toFixed(0)}<span className="text-base font-normal text-muted-foreground">/mo</span></div>
              <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              <ul className="mt-6 space-y-2 text-sm">
                {(p.features as string[]).map((f: string) => (
                  <li key={f} className="flex gap-2"><Check className="h-4 w-4 flex-none text-accent" /> {f}</li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full" variant={i === 1 ? "default" : "outline"}>
                <Link to="/checkout/$planId" params={{ planId: p.id }}>Choose {p.name}</Link>
              </Button>
            </Card>
          ))}
        </div>
      </section>
    </SitePage>
  );
}
