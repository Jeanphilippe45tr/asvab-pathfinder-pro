import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getSiteSettings, getPlans } from "@/lib/site.functions";
import { SitePage } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ShieldCheck, Target, BookOpen, TrendingUp, Timer, Award, Users, Star, ArrowRight, Quote } from "lucide-react";
import heroStudy from "@/assets/hero-study.jpg";
import recruits from "@/assets/recruits.jpg";
import studyDesk from "@/assets/study-desk.jpg";
import classroom from "@/assets/classroom.jpg";

const settingsQ = queryOptions({ queryKey: ["settings"], queryFn: () => getSiteSettings() });
const plansQ = queryOptions({ queryKey: ["plans"], queryFn: () => getPlans() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ASVAB Pro — Master the ASVAB & Boost Your AFQT" },
      { name: "description", content: "Realistic ASVAB practice across all 9 subtests. Adaptive drills, full-length simulations, and score analytics built by veterans and educators." },
      { property: "og:title", content: "ASVAB Pro — Master the ASVAB" },
      { property: "og:description", content: "Structured prep across all 9 ASVAB subtests. Score higher on the AFQT." },
    ],
  }),
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
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, rgba(255,255,255,.25), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,200,80,.3), transparent 45%)" }} />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 md:grid-cols-[1.15fr_1fr] md:px-8 md:py-28 md:items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Trusted by 25,000+ candidates
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
              {settings.hero_title ?? "Master the ASVAB. Serve with Confidence."}
            </h1>
            <p className="mt-6 max-w-xl text-lg opacity-90">
              {settings.hero_subtitle ?? "Structured prep across all nine subtests — with adaptive drills, full-length simulations, and clear explanations for every question."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gold text-gold-foreground hover:opacity-90">
                <Link to="/tutorial">Try the 7-minute quiz <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">
                <Link to="/pricing">See plans</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm opacity-90">
              <div className="flex items-center gap-2"><Star className="h-4 w-4 fill-accent text-accent" /> 4.9 / 5 average rating</div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-accent" /> 25k+ students</div>
            </div>
          </div>
          <div className="relative animate-fade-in delay-200">
            <div className="absolute -inset-6 rounded-3xl bg-accent/20 blur-2xl" />
            <img
              src={heroStudy}
              alt="Focused ASVAB candidate studying with laptop and books at desk"
              width={1600}
              height={1000}
              className="relative rounded-2xl shadow-elevated ring-1 ring-white/10"
            />
            <div className="absolute -bottom-4 -left-4 rounded-xl bg-card text-card-foreground p-4 shadow-elevated animate-float hidden sm:block">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">AFQT score</div>
              <div className="text-2xl font-bold text-primary">+18 pts avg</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4 md:px-8">
          {[
            { k: "9", v: "ASVAB subtests covered" },
            { k: "1,200+", v: "Practice questions" },
            { k: "98%", v: "Pass rate" },
            { k: "24/7", v: "Study access" },
          ].map((s, i) => (
            <div key={s.v} className={`animate-fade-in-up delay-${(i + 1) * 100}`}>
              <div className="text-3xl font-bold text-primary md:text-4xl">{s.k}</div>
              <div className="text-sm text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">Why ASVAB Pro</div>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">Everything you need to score higher</h2>
          <p className="mt-3 text-muted-foreground">Built by veterans and educators to match how the real ASVAB feels — no filler, no fluff.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Target, title: "Realistic simulations", body: "Full-length practice exams timed exactly like the real thing so nothing surprises you on test day." },
            { icon: BookOpen, title: "All 9 subtests", body: "From Arithmetic Reasoning to Assembling Objects — the entire battery, one clean interface." },
            { icon: TrendingUp, title: "Score analytics", body: "See exactly which topics slow you down and watch your AFQT climb week by week." },
            { icon: Timer, title: "Adaptive drills", body: "Questions dynamically adjust to your level so you learn faster and waste zero minutes." },
            { icon: Award, title: "AFQT boost", body: "Focused prep on the four subtests that decide your enlistment eligibility." },
            { icon: ShieldCheck, title: "7-day money-back", body: "Not seeing results in a week? Get a full refund — no questions, no hoops." },
          ].map((f, i) => (
            <Card key={f.title} className={`p-6 shadow-card hover-lift hover-lift-on animate-fade-in-up delay-${((i % 3) + 1) * 100}`}>
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Split feature: study anywhere */}
      <section className="bg-secondary/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-2 md:px-8 md:items-center">
          <div className="animate-fade-in-up">
            <img src={studyDesk} alt="Overhead flat lay of study materials on a wooden desk" width={1400} height={900} loading="lazy" className="rounded-2xl shadow-card" />
          </div>
          <div className="animate-fade-in-up delay-200">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">Study your way</div>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">Bite-sized drills or full simulations — you choose.</h2>
            <p className="mt-4 text-muted-foreground">Squeeze in a 10-minute drill on your lunch break, or block out three hours for a full mock exam. Every session syncs to your dashboard so your streak, accuracy, and weakest subtests are always one tap away.</p>
            <ul className="mt-6 grid gap-3 text-sm">
              {["Mobile-friendly across phone, tablet, and laptop","Explanations written by military-prep instructors","Question difficulty tuned to your recent performance","Progress and streaks that keep you accountable"].map((f) => (
                <li key={f} className="flex gap-2"><Check className="h-4 w-4 flex-none text-accent mt-0.5" /> {f}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Subtests preview */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div className="animate-fade-in-up">
            <div className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">The battery</div>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">The nine subtests that shape your future</h2>
            <p className="mt-4 text-muted-foreground">Four of them combine into your AFQT — the gateway score to enlistment. The other five decide which specialized jobs (MOS / rating) you qualify for.</p>
            <Button asChild variant="outline" className="mt-6"><Link to="/asvab">Explore the ASVAB <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {["GS","AR","WK","PC","MK","EI","AS","MC","AO"].map((code, i) => (
              <div key={code} className={`rounded-lg border bg-card p-4 text-center hover-lift hover-lift-on animate-fade-in-up delay-${((i % 3) + 1) * 100}`}>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Subtest</div>
                <div className="mt-1 text-2xl font-bold text-primary">{code}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Classroom band */}
      <section className="relative overflow-hidden">
        <img src={classroom} alt="Instructor teaching a bright, modern classroom" width={1400} height={900} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-navy/80" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center text-navy-foreground md:px-8">
          <h2 className="text-3xl font-bold md:text-4xl animate-fade-in-up">Taught by instructors who've been there.</h2>
          <p className="mt-4 text-lg opacity-90 animate-fade-in-up delay-100">Our content team includes former recruiters, active-duty NCOs, and licensed classroom teachers — so every explanation lines up with how the ASVAB is actually scored.</p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">Success stories</div>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">Real candidates. Real score jumps.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { name: "Marcus J.", role: "Army recruit", quote: "Went from a 42 to a 71 AFQT in six weeks. The adaptive drills nailed exactly what I was weak on." },
            { name: "Priya S.", role: "Air Force applicant", quote: "The explanations feel like a tutor sitting next to you. I actually understood the electronics section for the first time." },
            { name: "Devon R.", role: "Navy hopeful", quote: "The full-length simulations killed my test-day nerves. Walked in calm, walked out with the score I needed." },
          ].map((t, i) => (
            <Card key={t.name} className={`p-6 shadow-card hover-lift hover-lift-on animate-fade-in-up delay-${(i + 1) * 100}`}>
              <Quote className="h-6 w-6 text-accent" />
              <p className="mt-3 text-sm">"{t.quote}"</p>
              <div className="mt-4 flex items-center gap-1 text-accent">
                {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}
              </div>
              <div className="mt-3 text-sm font-semibold">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.role}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Plans preview */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Simple, honest pricing</h2>
            <p className="mt-3 text-muted-foreground">Pick a plan, start today, cancel anytime. Every plan is approved by an admin before access unlocks.</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {plans.map((p: any, i: number) => (
              <Card key={p.id} className={`p-6 shadow-card hover-lift hover-lift-on animate-fade-in-up delay-${(i + 1) * 100} ${i === 1 ? "border-accent ring-2 ring-accent/30" : ""}`}>
                {i === 1 && <div className="mb-2 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">Most popular</div>}
                <div className="text-sm uppercase tracking-wider text-muted-foreground">{p.name}</div>
                <div className="mt-3 text-4xl font-bold">${(p.price_cents / 100).toFixed(0)}<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {(p.features as string[]).map((f) => (
                    <li key={f} className="flex gap-2"><Check className="h-4 w-4 flex-none text-accent mt-0.5" /> {f}</li>
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

      {/* Recruits band */}
      <section className="relative overflow-hidden">
        <img src={recruits} alt="Confident group of U.S. military recruits standing together" width={1400} height={900} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/70 to-transparent" />
        <div className="relative mx-auto max-w-3xl px-4 py-24 text-navy-foreground md:px-8">
          <div className="animate-fade-in-up">
            <div className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-wider">Your future starts here</div>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">Every recruit was once a candidate.</h2>
            <p className="mt-4 text-lg opacity-90">Study smart, walk in ready, and take your place in the ranks. ASVAB Pro is with you every step from your first drill to test day.</p>
            <Button asChild size="lg" className="mt-8 bg-gold text-gold-foreground hover:opacity-90">
              <Link to="/pricing">Start preparing today <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center md:px-8">
        <h2 className="text-3xl font-bold md:text-4xl">Not sure yet? Try our free quiz.</h2>
        <p className="mt-3 text-muted-foreground">10 questions, 7 minutes, no signup required. See exactly where you stand.</p>
        <Button asChild size="lg" className="mt-6 bg-gold text-gold-foreground hover:opacity-90">
          <Link to="/tutorial">Start the free quiz <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </section>
    </SitePage>
  );
}
