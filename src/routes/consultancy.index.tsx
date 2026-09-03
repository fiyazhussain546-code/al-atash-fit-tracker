import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, ArrowLeft, Stethoscope, ShieldCheck } from "lucide-react";
import { Logo, Urdu } from "@/components/brand";
import { MEDICAL_SPECIALITIES } from "@/lib/eyecare";

const title = "Medical Consultancy — AL-ATASH FIT";
const description =
  "AL-ATASH FIT Medical Consultancy: professional patient guidance, coordination and follow-up services. Eye Care Consultancy available now.";

export const Route = createFileRoute("/consultancy/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConsultancyIndex,
});

function ConsultancyIndex() {
  const eye = MEDICAL_SPECIALITIES[0];
  const upcoming = MEDICAL_SPECIALITIES.filter((s) => !s.active);

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-soft/70 via-background to-background">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <ArrowLeft className="size-3.5" aria-hidden /> Home
          </Link>
        </div>

        <section className="mt-10 text-center sm:mt-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand-soft px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-dark">
            <Stethoscope className="size-3.5" aria-hidden /> Medical Consultancy
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-brand-dark sm:text-4xl">
            Medical Consultancy
          </h1>
          <Urdu className="mt-3 block text-xl text-muted-foreground">میڈیکل کنسلٹینسی</Urdu>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Patient guidance, specialist coordination, appointment support and follow-up — handled personally by the
            AL-ATASH FIT team.
          </p>
        </section>

        <section className="mt-10">
          <Link
            to="/consultancy/eye-care"
            className="group flex items-center gap-4 rounded-3xl border-2 border-border bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-brand hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
              <Eye className="size-8" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-xl font-extrabold text-foreground">{eye.en}</span>
              <Urdu className="mt-1 block text-lg text-muted-foreground">{eye.ur}</Urdu>
              <span className="mt-2 block text-sm text-muted-foreground">
                Guidance, second opinion coordination, specialist appointments and follow-up support.
              </span>
            </span>
            <span className="hidden shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground group-hover:bg-brand-dark sm:inline-block">
              Open
            </span>
          </Link>
        </section>

        <section className="mt-10 rounded-2xl border bg-card p-5">
          <h2 className="font-display text-base font-bold text-foreground">Coming soon</h2>
          <Urdu className="block text-sm text-muted-foreground">جلد دستیاب</Urdu>
          <ul className="mt-3 flex flex-wrap gap-2">
            {upcoming.map((s) => (
              <li
                key={s.key}
                className="rounded-full border bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                {s.en}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 flex items-start gap-3 rounded-2xl border bg-card p-5">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Private &amp; confidential.</strong> Patient records are visible only
            to the authorised AL-ATASH FIT team.
          </p>
        </section>
      </div>
    </main>
  );
}
