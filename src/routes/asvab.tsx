import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getSiteSettings } from "@/lib/site.functions";
import { SitePage } from "@/components/SiteLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Atom, Calculator, BookOpen, FileText, Sigma, Zap, Wrench, Cog, Boxes, Target, Clock, ArrowRight } from "lucide-react";
import studyDesk from "@/assets/study-desk.jpg";

const q = queryOptions({ queryKey: ["settings"], queryFn: () => getSiteSettings() });

const SUBTESTS = [
  { code: "GS", icon: Atom, name: "General Science", desc: "Life, earth, and physical sciences — biology basics, chemistry fundamentals, physics.", q: 16, t: 8, afqt: false },
  { code: "AR", icon: Calculator, name: "Arithmetic Reasoning", desc: "Word problems requiring arithmetic — rates, percentages, ratios, unit conversions.", q: 16, t: 39, afqt: true },
  { code: "WK", icon: BookOpen, name: "Word Knowledge", desc: "Vocabulary and word meaning — synonyms, context clues, precise definitions.", q: 16, t: 8, afqt: true },
  { code: "PC", icon: FileText, name: "Paragraph Comprehension", desc: "Reading comprehension of short passages — main idea, inference, tone.", q: 11, t: 22, afqt: true },
  { code: "MK", icon: Sigma, name: "Mathematics Knowledge", desc: "High school math — algebra, geometry, exponents, and basic trigonometry.", q: 16, t: 20, afqt: true },
  { code: "EI", icon: Zap, name: "Electronics Information", desc: "Electrical current, circuits, symbols, and everyday electronic devices.", q: 16, t: 8, afqt: false },
  { code: "AS", icon: Wrench, name: "Auto & Shop Information", desc: "Automobile systems, common tools, and shop practices.", q: 11, t: 7, afqt: false },
  { code: "MC", icon: Cog, name: "Mechanical Comprehension", desc: "Levers, pulleys, gears, and other physical principles in action.", q: 16, t: 20, afqt: false },
  { code: "AO", icon: Boxes, name: "Assembling Objects", desc: "Spatial reasoning — matching shapes and predicting how parts fit together.", q: 16, t: 16, afqt: false },
];

export const Route = createFileRoute("/asvab")({
  head: () => ({
    meta: [
      { title: "The ASVAB Explained — Subtests, AFQT & Scoring" },
      { name: "description", content: "A clear guide to how the ASVAB is structured, what each of the 9 subtests covers, and how your AFQT score decides enlistment." },
      { property: "og:title", content: "The ASVAB Explained" },
      { property: "og:description", content: "Subtests, timing, and how AFQT is scored." },
    ],
  }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(q); },
  component: Asvab,
});

function Asvab() {
  const { data: settings } = useSuspenseQuery(q);
  return (
    <SitePage footerData={settings}>
      <section className="relative overflow-hidden bg-hero text-navy-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-24 animate-fade-in-up">
          <div className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-wider">The exam</div>
          <h1 className="mt-4 text-4xl font-bold md:text-6xl">The ASVAB, explained.</h1>
          <p className="mt-6 max-w-3xl text-lg opacity-90">
            The Armed Services Vocational Aptitude Battery (ASVAB) is a multiple-choice test used to determine
            qualification for enlistment and job placement in every branch of the U.S. military. Nine subtests,
            one AFQT score, and countless career paths on the other side.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Target, title: "Purpose", body: "Match candidates to roles that fit their strengths — from mechanic to intelligence analyst." },
            { icon: Clock, title: "Format", body: "About 2h 30m total. Computer-adaptive (CAT-ASVAB) at MEPS or pencil-and-paper at MET sites." },
            { icon: BookOpen, title: "AFQT", body: "Your headline score, computed from AR + MK + WK + PC. Every branch has a minimum." },
          ].map((c, i) => (
            <Card key={c.title} className={`p-6 shadow-card animate-fade-in-up delay-${(i + 1) * 100}`}>
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-md bg-primary/10 text-primary"><c.icon className="h-5 w-5" /></div>
              <h3 className="font-semibold text-lg">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
            <div className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">The nine subtests</div>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">Every subtest, unpacked</h2>
            <p className="mt-3 text-muted-foreground">The four marked AFQT are the ones that decide enlistment eligibility. The rest determine your job (MOS / rating) qualification.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SUBTESTS.map((s, i) => (
              <Card key={s.code} className={`p-6 shadow-card hover-lift hover-lift-on animate-fade-in-up delay-${((i % 3) + 1) * 100}`}>
                <div className="flex items-center justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-md bg-primary/10 text-primary"><s.icon className="h-5 w-5" /></div>
                  {s.afqt && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">AFQT</span>}
                </div>
                <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">Subtest {s.code}</div>
                <h3 className="mt-1 font-semibold text-lg">{s.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                  <div><span className="font-semibold text-foreground">{s.q}</span> questions</div>
                  <div><span className="font-semibold text-foreground">{s.t}</span> minutes</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-2 md:px-8 md:items-center">
        <img src={studyDesk} alt="ASVAB study materials on a wooden desk" width={1400} height={900} loading="lazy" className="rounded-2xl shadow-card animate-fade-in-up" />
        <div className="animate-fade-in-up delay-200">
          <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">AFQT scoring</div>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">The score that decides everything.</h2>
          <p className="mt-4 text-muted-foreground">Your AFQT is a percentile from 1–99, computed from Arithmetic Reasoning, Math Knowledge, Word Knowledge, and Paragraph Comprehension. Each branch sets its own minimum:</p>
          <div className="mt-6 overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="p-3">Branch</th><th className="p-3">Min AFQT (HS diploma)</th></tr>
              </thead>
              <tbody className="divide-y">
                {[["Army","31"],["Navy","31"],["Air Force","31"],["Marines","31"],["Coast Guard","36"],["Space Force","31"]].map((r) => (
                  <tr key={r[0]}><td className="p-3">{r[0]}</td><td className="p-3 font-semibold">{r[1]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Waivers and higher category scores can change these minimums — talk to your recruiter for the current requirement.</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 text-center md:px-8">
        <h2 className="text-3xl font-bold md:text-4xl">Ready to see where you stand?</h2>
        <p className="mt-3 text-muted-foreground">Take our free 10-question tutorial in 7 minutes. No signup required.</p>
        <Button asChild size="lg" className="mt-6 bg-gold text-gold-foreground hover:opacity-90"><Link to="/tutorial">Start the free quiz <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
      </section>
    </SitePage>
  );
}
