import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Eye, MessageCircle, ClipboardList, CalendarClock, Users, ShieldCheck } from "lucide-react";
import { Logo, Urdu } from "@/components/brand";
import { DISCLAIMER_EN, DISCLAIMER_UR, SERVICE_PACKAGES, waLink } from "@/lib/eyecare";

const title = "Eye Care Consultancy — AL-ATASH FIT";
const description =
  "Eye Care Consultancy by AL-ATASH FIT: specialist guidance, second-opinion coordination, appointment support and follow-up care in Urdu and English.";

const CLINIC_WHATSAPP = "923433672409";

export const Route = createFileRoute("/consultancy/eye-care")({
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
  component: EyeCarePublic,
});

const steps = [
  {
    icon: ClipboardList,
    en: "Share your case",
    ur: "اپنا کیس بتائیں",
    text: "Tell us the eye problem, previous reports and your city on WhatsApp.",
  },
  {
    icon: Users,
    en: "Suitable options",
    ur: "مناسب آپشنز",
    text: "Our team reviews your information and shares up to 3 recommended options for consultation.",
  },
  {
    icon: CalendarClock,
    en: "Appointment & follow-up",
    ur: "اپائنٹمنٹ اور فالو اپ",
    text: "We help coordinate the appointment and stay with you through follow-up.",
  },
];

function EyeCarePublic() {
  const msg =
    "Assalam o Alaikum AL-ATASH FIT — I would like Eye Care Consultancy guidance.\n\nName:\nAge:\nCity:\nEye problem:";

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-soft/70 via-background to-background">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            to="/consultancy"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <ArrowLeft className="size-3.5" aria-hidden /> Medical Consultancy
          </Link>
        </div>

        <section className="mt-10 text-center sm:mt-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand-soft px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-dark">
            <Eye className="size-3.5" aria-hidden /> Eye Care Consultancy
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-brand-dark sm:text-4xl">
            Eye Care Consultancy
          </h1>
          <Urdu className="mt-3 block text-xl text-muted-foreground">آئی کیئر کنسلٹینسی</Urdu>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Guidance and coordination for eye patients — specialist selection, second opinion, appointment support and
            follow-up.
          </p>
          <a
            href={waLink(CLINIC_WHATSAPP, msg)}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-colors hover:bg-brand-dark"
          >
            <MessageCircle className="size-4" aria-hidden /> Contact us on WhatsApp
          </a>
          <Urdu className="mt-2 block text-sm text-muted-foreground">واٹس ایپ پر رابطہ کریں</Urdu>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.en} className="rounded-2xl border bg-card p-5">
              <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand">
                <s.icon className="size-5" aria-hidden />
              </span>
              <h2 className="mt-3 font-display text-base font-bold text-foreground">{s.en}</h2>
              <Urdu className="block text-sm text-muted-foreground">{s.ur}</Urdu>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border bg-card p-5">
          <h2 className="font-display text-lg font-bold text-foreground">Service packages</h2>
          <Urdu className="block text-base text-muted-foreground">سروس پیکجز</Urdu>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {SERVICE_PACKAGES.map((p) => (
              <li key={p.key} className="rounded-xl border bg-background p-4">
                <span className="block text-sm font-semibold text-foreground">{p.key}</span>
                <Urdu className="mt-1 block text-sm text-muted-foreground">{p.ur}</Urdu>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Fees are confirmed on WhatsApp before any service begins. Payments are handled manually — there is no
            online payment on this page.
          </p>
        </section>

        <section className="mt-8 rounded-2xl border border-brand/30 bg-brand-soft/50 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-brand-dark">Medical disclaimer</p>
              <p className="mt-1 text-sm text-muted-foreground">{DISCLAIMER_EN}</p>
              <Urdu className="mt-2 block text-sm text-muted-foreground">{DISCLAIMER_UR}</Urdu>
            </div>
          </div>
        </section>

        <footer className="mt-12 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} AL-ATASH FIT — Eye Care Consultancy.
        </footer>
      </div>
    </main>
  );
}
