import { createFileRoute, Link } from "@tanstack/react-router";
import { Baby, Venus, Mars, ShieldCheck, ClipboardList, Languages } from "lucide-react";
import { Logo, Urdu } from "@/components/brand";
import { cn } from "@/lib/utils";

const title = "AL-ATASH FIT — Weight Assessment Form";
const description =
  "Bilingual Urdu and English weight assessment forms from AL-ATASH FIT. Choose Child, Female or Male to begin your confidential clinic assessment.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

const choices = [
  {
    type: "child" as const,
    icon: Baby,
    en: "Child",
    ur: "بچہ / بچی",
    note: "Under 18 years",
    ring: "hover:border-child focus-visible:ring-child",
    bg: "bg-child/10 text-child",
  },
  {
    type: "female" as const,
    icon: Venus,
    en: "Female",
    ur: "خواتین",
    note: "18 years and above",
    ring: "hover:border-female focus-visible:ring-female",
    bg: "bg-female/10 text-female",
  },
  {
    type: "male" as const,
    icon: Mars,
    en: "Male",
    ur: "مرد",
    note: "18 years and above",
    ring: "hover:border-male focus-visible:ring-male",
    bg: "bg-male/10 text-male",
  },
];

function Index() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-soft/70 via-background to-background">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Link
              to="/consultancy"
              className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Medical Consultancy
            </Link>
            <Link
              to="/admin"
              className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Staff login
            </Link>
          </div>
        </div>


        <section className="mt-10 text-center sm:mt-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand-soft px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-dark">
            <Languages className="size-3.5" aria-hidden /> Urdu + English
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-brand-dark sm:text-5xl">
            Weight Assessment Form
          </h1>
          <Urdu className="mt-3 block text-xl text-muted-foreground sm:text-2xl">وزن کا تفصیلی معائنہ فارم</Urdu>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Please select who this assessment is for. Every answer stays confidential and is used only by the
            AL-ATASH FIT clinical team.
          </p>
          <Urdu className="mx-auto mt-2 block max-w-xl text-sm text-muted-foreground">
            براہِ کرم منتخب کریں کہ یہ معائنہ کس کے لیے ہے۔
          </Urdu>
        </section>

        <section className="mt-10 grid gap-5 sm:grid-cols-3">
          {choices.map((c) => (
            <Link
              key={c.type}
              to="/assessment/$type"
              params={{ type: c.type }}
              className={cn(
                "group flex flex-col items-center rounded-3xl border-2 border-border bg-card p-7 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2",
                c.ring,
              )}
            >
              <span className={cn("grid size-16 place-items-center rounded-2xl", c.bg)}>
                <c.icon className="size-8" aria-hidden />
              </span>
              <span className="mt-4 font-display text-xl font-extrabold text-foreground">{c.en}</span>
              <Urdu className="mt-1 block text-lg text-muted-foreground">{c.ur}</Urdu>
              <span className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {c.note}
              </span>
              <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors group-hover:bg-brand-dark">
                Start form
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl border bg-card p-5">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Private &amp; secure.</strong> Your answers go straight to the
              clinic records — nothing is shown publicly.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border bg-card p-5">
            <ClipboardList className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Takes 8–12 minutes.</strong> BMI is calculated automatically and
              is informational only, not a medical diagnosis.
            </p>
          </div>
        </section>

        <footer className="mt-14 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} AL-ATASH FIT. This form does not replace professional medical advice.
        </footer>
      </div>
    </main>
  );
}
