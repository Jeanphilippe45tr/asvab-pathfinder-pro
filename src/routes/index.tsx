import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getSiteSettings, getPlans } from "@/lib/site.functions";
import { SitePage } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ShieldCheck, Target, BookOpen, TrendingUp, Timer, Award } from "lucide-react";

const settingsQ = queryOptions({ queryKey: ["settings"], queryFn: () => getSiteSettings() });
const plansQ = queryOptions({ queryKey: ["plans"], queryFn: () => getPlans() });

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "ASVAB Pro — Master the ASVAB" }] }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(settingsQ);
    context.queryClient.ensureQueryData(plansQ);
  },
  component: Home,
});

function Home() {
  const { data: settings } = useSuspenseQuery(settingsQ);
  const { data: plans } = useSuspenseQuery(plansQ);

  return (
    <SitePage footerData={settings}>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero text-navy-foreground">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, rgba(255,255,255,.3), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,200,80,.25), transparent 40%)" }} />
        <div className="relative mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Trusted by candidates nationwide
            </div>
            <h1 className="mt-6 text-5xl font-bold leading-tight md:text-6xl">
              {settings.hero_title ?? "Master the ASVAB. Serve with Confidence."}
            </h1>
            <p className="mt-6 max-w-2xl text-lg opacity-90">
              {settings.hero_subtitle ?? "Structured prep across all nine subtests."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gold text-gold-foreground hover:opacity-90">
                <Link to="/tutorial">Try a 7-minute quiz</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">
                <Link to="/pricing">See plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4 md:px-8">
          {[
            { k: "9", v: "ASVAB subtests" },
            { k: "1,200+", v: "Practice questions" },
            { k: "98%", v: "Pass rate" },
            { k: "24/7", v: "Study access" },
          ].map((s) => (
            <div key={s.v}>
              <div className="text-3xl font-bold text-primary">{s.k}</div>
              <div className="text-sm text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Everything you need to score higher</h2>
          <p className="mt-3 text-muted-foreground">Built by veterans and educators to match how the real ASVAB feels.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Target, title: "Realistic simulations", body: "Full-length practice exams timed like the real thing." },
            { icon: BookOpen, title: "All 9 subtests", body: "From Arithmetic Reasoning to Assembling Objects." },
            { icon: TrendingUp, title: "Score analytics", body: "Track weak spots and improve with every session." },
            { icon: Timer, title: "Adaptive drills", body: "Questions adjust to your level for faster gains." },
            { icon: Award, title: "AFQT boost", body: "Targeted prep for the score that matters most." },
            { icon: ShieldCheck, title: "Money-back", body: "Not satisfied in 7 days? Full refund." },
          ].map((f) => (
            <Card key={f.title} className="p-6 shadow-card">
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Plans preview */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Simple, honest pricing</h2>
            <p className="mt-3 text-muted-foreground">Pick a plan and start today. Cancel anytime.</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {plans.map((p: any, i: number) => (
              <Card key={p.id} className={`p-6 shadow-card ${i === 1 ? "border-accent ring-2 ring-accent/30" : ""}`}>
                <div className="text-sm uppercase tracking-wider text-muted-foreground">{p.name}</div>
                <div className="mt-3 text-4xl font-bold">${(p.price_cents / 100).toFixed(0)}<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {(p.features as string[]).map((f) => (
                    <li key={f} className="flex gap-2"><Check className="h-4 w-4 flex-none text-accent" /> {f}</li>
                  ))}
                </ul>
                <Button asChild className="mt-6 w-full" variant={i === 1 ? "default" : "outline"}>
                  <Link to="/checkout/$planId" params={{ planId: p.id }}>Choose {p.name}</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center md:px-8">
        <h2 className="text-3xl font-bold md:text-4xl">Not sure yet? Try our free quiz.</h2>
        <p className="mt-3 text-muted-foreground">10 questions, 7 minutes, no signup required.</p>
        <Button asChild size="lg" className="mt-6 bg-gold text-gold-foreground hover:opacity-90">
          <Link to="/tutorial">Start the free quiz</Link>
        </Button>
      </section>
    </SitePage>
  );
}
