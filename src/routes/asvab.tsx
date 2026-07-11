import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getSiteSettings } from "@/lib/site.functions";
import { SitePage } from "@/components/SiteLayout";

const q = queryOptions({ queryKey: ["settings"], queryFn: () => getSiteSettings() });

const SUBTESTS = [
  { name: "General Science (GS)", desc: "Life, earth, and physical sciences." },
  { name: "Arithmetic Reasoning (AR)", desc: "Word problems requiring arithmetic." },
  { name: "Word Knowledge (WK)", desc: "Vocabulary and word meaning." },
  { name: "Paragraph Comprehension (PC)", desc: "Reading comprehension of short passages." },
  { name: "Mathematics Knowledge (MK)", desc: "High school mathematics concepts." },
  { name: "Electronics Information (EI)", desc: "Electrical current, circuits, devices." },
  { name: "Auto & Shop Information (AS)", desc: "Automobile technology and shop practices." },
  { name: "Mechanical Comprehension (MC)", desc: "Mechanical and physical principles." },
  { name: "Assembling Objects (AO)", desc: "Spatial reasoning and object assembly." },
];

export const Route = createFileRoute("/asvab")({
  head: () => ({ meta: [{ title: "The ASVAB — Subtests & AFQT" }, { name: "description", content: "Learn how the ASVAB is structured, what each subtest covers, and how AFQT is calculated." }] }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(q); },
  component: Asvab,
});

function Asvab() {
  const { data: settings } = useSuspenseQuery(q);
  return (
    <SitePage footerData={settings}>
      <section className="mx-auto max-w-5xl px-4 py-20 md:px-8">
        <h1 className="text-4xl font-bold md:text-5xl">The ASVAB, explained</h1>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
          The Armed Services Vocational Aptitude Battery (ASVAB) is a multiple-choice test used to
          determine qualification for enlistment and job placement in the U.S. military.
        </p>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold">The nine subtests</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {SUBTESTS.map((s) => (
              <div key={s.name} className="rounded-lg border p-5">
                <div className="font-semibold">{s.name}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-lg border bg-secondary/30 p-6">
          <h2 className="text-2xl font-semibold">AFQT — the score that matters most</h2>
          <p className="mt-3 text-muted-foreground">
            Your Armed Forces Qualification Test (AFQT) score is computed from AR, MK, WK, and PC.
            It determines your enlistment eligibility across all branches.
          </p>
        </div>
      </section>
    </SitePage>
  );
}
