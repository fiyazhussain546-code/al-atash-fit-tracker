import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, ClipboardList, MessageCircle, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { Logo, Urdu } from "@/components/brand";
import { waLink } from "@/lib/eyecare";
import { SPECIALTIES, isSpecialtyKey } from "@/lib/specialties";

const CLINIC_WHATSAPP = "923433672409";

export const Route = createFileRoute("/consultancy/$specialty")({
  loader: ({ params }) => {
    // Eye Care has its own dedicated page.
    if (!isSpecialtyKey(params.specialty) || params.specialty === "eye-care") throw notFound();
    return { key: params.specialty };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found — AL-ATASH FIT" }, { name: "robots", content: "noindex" }] };
    const sp = SPECIALTIES[loaderData.key];
    const title = `${sp.en} — AL-ATASH FIT`;
    const description = `${sp.en} by AL-ATASH FIT: ${sp.tagline} Urdu and English support.`.slice(0, 158);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  notFoundComponent: () => (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <p className="font-display text-xl font-bold">Specialty not found</p>
        <Link to="/consultancy" className="mt-3 inline-block text-sm text-brand underline">
          Back to Medical Consultancy
        </Link>
      </div>
    </main>
  ),
  errorComponent: () => <p className="p-10 text-center">Could not load this page.</p>,
  component: SpecialtyPublic,
});

function SpecialtyPublic() {
  const { key } = Route.useLoaderData();
  const sp = SPECIALTIES[key];
  const msg = `Assalam o Alaikum AL-ATASH FIT — I would like ${sp.en} guidance.\n\nName:\nAge:\nCity:\nProblem:`;
  const steps = [
    { icon: ClipboardList, en: "Share your case", ur: "اپنا کیس بتائیں", text: "Tell us the problem, previous reports and your city in the online form." },
    { icon: Users, en: "Suitable options", ur: "مناسب آپشنز", text: `Our team reviews your case and shares up to 3 suitable ${sp.doctorWord} options.` },
    { icon: CalendarClock, en: "Appointment & follow-up", ur: "اپائنٹمنٹ اور فالو اپ", text: "We help coordinate the appointment and stay with you through follow-up." },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-soft/70 via-background to-background">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/consultancy" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:underline">
            <ArrowLeft className="size-3.5" aria-hidden /> Medical Consultancy
          </Link>
        </div>

        <section className="mt-10 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand/10 text-brand">
            <Stethoscope className="size-8" aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-brand-dark sm:text-4xl">{sp.en}</h1>
          <Urdu className="mt-3 block text-xl text-muted-foreground">{sp.ur}</Urdu>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">{sp.tagline}</p>
          <Urdu className="mt-1 block text-sm text-muted-foreground">{sp.taglineUr}</Urdu>
          <Link
            to="/consultancy-assessment/$specialty"
            params={{ specialty: key }}
            className="mt-6 mr-2 inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-dark px-6 text-sm font-semibold text-primary-foreground hover:bg-brand"
          >
            <ClipboardList className="size-4" /> Start {sp.short} Assessment / اسیسمنٹ شروع کریں
          </Link>
          <a
            href={waLink(CLINIC_WHATSAPP, msg)}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-primary-foreground hover:bg-brand-dark"
          >
            <MessageCircle className="size-4" /> Contact on WhatsApp / واٹس ایپ پر رابطہ کریں
          </a>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <Link key={s.en} to="/consultancy-assessment/$specialty" params={{ specialty: key }} className="rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-brand">
              <s.icon className="size-5 text-brand" aria-hidden />
              <h2 className="mt-3 font-display text-base font-bold">{s.en}</h2>
              <Urdu className="block text-sm text-muted-foreground">{s.ur}</Urdu>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              <span className="mt-3 inline-block text-xs font-semibold text-brand">Start assessment →</span>
            </Link>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border bg-card p-5">
          <h2 className="font-display text-base font-bold">Service packages / سروس پیکجز</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {sp.packages.map((p) => (
              <li key={p.key} className="rounded-xl border bg-background p-3 text-sm">
                <span className="font-semibold">{p.key}</span>
                <Urdu className="block text-xs text-muted-foreground">{p.ur}</Urdu>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 flex items-start gap-3 rounded-2xl border bg-card p-5">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
          <div className="text-xs text-muted-foreground">
            <p>{sp.disclaimerEn}</p>
            <Urdu className="mt-1 block">{sp.disclaimerUr}</Urdu>
          </div>
        </section>
      </div>
    </main>
  );
}
