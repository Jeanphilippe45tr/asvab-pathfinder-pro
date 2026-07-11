import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getSiteSettings } from "@/lib/site.functions";
import { SitePage } from "@/components/SiteLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Users, BookOpen, Target, HeartHandshake, Award, ArrowRight } from "lucide-react";
import recruits from "@/assets/recruits.jpg";
import classroom from "@/assets/classroom.jpg";

const q = queryOptions({ queryKey: ["settings"], queryFn: () => getSiteSettings() });

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ASVAB Pro — Built by veterans and educators" },
      { name: "description", content: "ASVAB Pro's mission is to give every candidate honest, effective preparation for the ASVAB. Learn about our team, methodology, and values." },
      { property: "og:title", content: "About ASVAB Pro" },
      { property: "og:description", content: "Built by veterans and educators for the next generation of service members." },
    ],
  }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(q); },
  component: About,
});

function About() {
  const { data: settings } = useSuspenseQuery(q);
  return (
    <SitePage footerData={settings}>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero text-navy-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:grid-cols-2 md:px-8 md:py-24 md:items-center">
          <div className="animate-fade-in-up">
            <div className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-wider">Our story</div>
            <h1 className="mt-4 text-4xl font-bold md:text-6xl">Prep that respects your time — and your goal.</h1>
            <p className="mt-6 text-lg opacity-90">
              ASVAB Pro was founded by a small team of veterans and classroom teachers who kept meeting candidates let down by cluttered prep books and outdated courseware. We rebuilt ASVAB prep from scratch: honest, focused, and actually enjoyable to use.
            </p>
          </div>
          <img src={recruits} alt="Diverse group of confident U.S. military recruits" width={1400} height={900} loading="lazy" className="rounded-2xl shadow-elevated animate-fade-in delay-200" />
        </div>
      </section>

      {/* Mission / values */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
          <div className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">Our mission</div>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">Make world-class ASVAB prep accessible to every candidate.</h2>
          <p className="mt-4 text-muted-foreground whitespace-pre-line">{settings.about_html}</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { icon: Target, title: "Focus", body: "We ship only what raises scores. No distractions, no gamification traps." },
            { icon: HeartHandshake, title: "Respect", body: "Your time is limited. Our drills are tuned so every minute pushes you forward." },
            { icon: ShieldCheck, title: "Integrity", body: "Realistic content, honest pricing, and refunds if we don't deliver." },
          ].map((v, i) => (
            <Card key={v.title} className={`p-6 shadow-card hover-lift hover-lift-on animate-fade-in-up delay-${(i + 1) * 100}`}>
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-primary/10 text-primary"><v.icon className="h-5 w-5" /></div>
              <h3 className="font-semibold text-lg">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Classroom split */}
      <section className="bg-secondary/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-2 md:px-8 md:items-center">
          <img src={classroom} alt="Instructor teaching a class of adult students" width={1400} height={900} loading="lazy" className="rounded-2xl shadow-card animate-fade-in-up" />
          <div className="animate-fade-in-up delay-200">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">Methodology</div>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">Classroom rigor. Modern delivery.</h2>
            <p className="mt-4 text-muted-foreground">Our content team blends 30+ years of combined classroom teaching with real-world military experience. Every explanation is written like a tutor would say it, not like a textbook.</p>
            <ul className="mt-6 grid gap-3 text-sm">
              {["Item-response theory to adapt drills to your level","Content reviewed by former recruiters and licensed teachers","Continuous updates based on candidate feedback","Accessible pricing with financial-hardship options"].map((f) => (
                <li key={f} className="flex gap-2"><Award className="h-4 w-4 flex-none text-accent mt-0.5" /> {f}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { icon: Users, k: "25,000+", v: "Candidates trained" },
            { icon: BookOpen, k: "1,200+", v: "Original questions" },
            { icon: Award, k: "+18 pts", v: "Avg AFQT boost" },
            { icon: ShieldCheck, k: "98%", v: "Pass rate" },
          ].map((s, i) => (
            <Card key={s.v} className={`p-6 text-center shadow-card animate-fade-in-up delay-${(i + 1) * 100}`}>
              <s.icon className="mx-auto h-6 w-6 text-accent" />
              <div className="mt-3 text-3xl font-bold text-primary">{s.k}</div>
              <div className="text-sm text-muted-foreground">{s.v}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center md:px-8">
        <h2 className="text-3xl font-bold md:text-4xl">Ready when you are.</h2>
        <p className="mt-3 text-muted-foreground">Start with a free 7-minute quiz or jump straight into a plan.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="bg-gold text-gold-foreground hover:opacity-90"><Link to="/tutorial">Try the free quiz <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/pricing">See plans</Link></Button>
        </div>
      </section>
    </SitePage>
  );
}
