import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, MessageCircle, Upload, X } from "lucide-react";
import { Logo, Urdu } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Field, Select, TextArea, TextInput } from "@/components/eyecare-ui";
import { SPECIALTIES, isSpecialtyKey, type SpecialtyQuestion } from "@/lib/specialties";
import { COMMON_QUESTIONS, SPECIALTY_QUESTIONS } from "@/lib/intake-questions";
import { DOCUMENT_CATEGORIES, waLink } from "@/lib/eyecare";
import { submitConsultancyIntake } from "@/lib/consultancy-intake.functions";

const CLINIC_WHATSAPP = "923433672409";

export const Route = createFileRoute("/consultancy-assessment/$specialty")({
  loader: ({ params }) => {
    if (!isSpecialtyKey(params.specialty)) throw notFound();
    return { key: params.specialty };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found — AL-ATASH FIT" }, { name: "robots", content: "noindex" }] };
    const sp = SPECIALTIES[loaderData.key];
    const title = `Start ${sp.short} Assessment — AL-ATASH FIT`;
    const description = `Register and share your case for ${sp.en}. Upload reports securely and get a Patient ID.`;
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
  notFoundComponent: () => <p className="p-10 text-center">Specialty not found.</p>,
  errorComponent: () => <p className="p-10 text-center">Could not load this form.</p>,
  component: IntakePage,
});

type UploadItem = { file: File; category: string };

function Question({ q, value, onChange }: { q: SpecialtyQuestion; value: string; onChange: (v: string) => void }) {
  const wide = q.type === "textarea" || q.type === "multi";
  return (
    <Field label={q.en} ur={q.ur} className={wide ? "sm:col-span-2" : ""}>
      {q.type === "select" ? (
        <div className="flex flex-wrap gap-2">
          {(q.options ?? []).map((o) => (
            <label key={o} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${value === o ? "border-brand bg-brand/10 font-semibold text-brand-dark" : "bg-background"}`}>
              <input type="radio" className="sr-only" name={q.key} checked={value === o} onChange={() => onChange(o)} />
              {o}
            </label>
          ))}
        </div>
      ) : q.type === "multi" ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {(q.options ?? []).map((o) => {
            const set = new Set(value ? value.split(", ") : []);
            return (
              <label key={o} className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={set.has(o)}
                  onChange={(e) => {
                    e.target.checked ? set.add(o) : set.delete(o);
                    onChange([...set].join(", "));
                  }}
                />
                {o}
              </label>
            );
          })}
        </div>
      ) : q.type === "textarea" ? (
        <TextArea value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <TextInput value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

function toB64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(new Error("Could not read file"));
    r.readAsDataURL(file);
  });
}

function IntakePage() {
  const { key } = Route.useLoaderData();
  const sp = SPECIALTIES[key];
  const submit = useServerFn(submitConsultancyIntake);
  const [f, setF] = useState({
    name: "", age: "", gender: "Male", whatsapp: "", city: "", preferredCity: "", attendantName: "", relationship: "",
    mainProblem: "", symptoms: "", previousDiagnosis: "", previousDoctor: "", previousTreatment: "", previousReports: "",
    priority: "Normal" as "Normal" | "Urgent" | "Emergency", servicePackage: sp.packages[0]!.key as string, budget: "",
  });
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const up = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (f.name.trim().length < 2) return setError("Full name is required / پورا نام لازمی ہے");
    if (!f.age.trim()) return setError("Age is required / عمر لازمی ہے");
    if (!/^(\+?92|0)?3\d{9}$/.test(f.whatsapp.replace(/[\s-]/g, ""))) return setError("Enter a valid WhatsApp number, e.g. 03001234567 / درست واٹس ایپ نمبر درج کریں");
    if (f.city.trim().length < 2) return setError("City is required / شہر لازمی ہے");
    if (f.mainProblem.trim().length < 3) return setError("Please describe the main problem / بنیادی مسئلہ لکھیں");
    if (!consent) return setError("Please give consent to continue / آگے بڑھنے کے لیے رضامندی دیں");
    setBusy(true);
    try {
      const payloadFiles = await Promise.all(
        files.map(async (u) => ({ name: u.file.name.slice(0, 150), category: u.category, contentType: u.file.type, base64: await toB64(u.file) })),
      );
      const res = await submit({
        data: { specialty: key, ...f, whatsapp: f.whatsapp.replace(/[\s-]/g, ""), extra, consent: true, files: payloadFiles },
      });
      if (!res.ok) return setError(res.error);
      setDone(res.patientId);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    const msg = `Assalam o Alaikum AL-ATASH FIT — I have submitted my ${sp.en} assessment.\nPatient ID: ${done}\nName: ${f.name}`;
    return (
      <main className="min-h-screen bg-gradient-to-b from-brand-soft/70 via-background to-background">
        <div className="mx-auto max-w-xl px-4 py-12 text-center">
          <Logo />
          <CheckCircle2 className="mx-auto mt-8 size-14 text-brand" aria-hidden />
          <h1 className="mt-4 font-display text-2xl font-extrabold text-brand-dark">Assessment received</h1>
          <Urdu className="mt-1 block text-lg text-muted-foreground">آپ کی معلومات موصول ہو گئی ہیں</Urdu>
          <p className="mt-6 text-sm text-muted-foreground">Your Patient ID / آپ کی پیشنٹ آئی ڈی</p>
          <p className="mt-1 font-display text-3xl font-extrabold tracking-wide text-foreground">{done}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Please save this ID. Our team will review your case and contact you on WhatsApp.
          </p>
          <Urdu className="mt-1 block text-sm text-muted-foreground">یہ آئی ڈی محفوظ رکھیں۔ ہماری ٹیم واٹس ایپ پر رابطہ کرے گی۔</Urdu>
          <a href={waLink(CLINIC_WHATSAPP, msg)} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-primary-foreground hover:bg-brand-dark">
            <MessageCircle className="size-4" /> Contact on WhatsApp / واٹس ایپ پر رابطہ کریں
          </a>
          <p className="mt-8 text-xs text-muted-foreground">{sp.disclaimerEn}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-soft/70 via-background to-background">
      <form onSubmit={onSubmit} className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12" noValidate>
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/consultancy" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:underline">
            <ArrowLeft className="size-3.5" aria-hidden /> Medical Consultancy
          </Link>
        </div>
        <h1 className="mt-8 font-display text-2xl font-extrabold text-brand-dark sm:text-3xl">{sp.en} — Assessment</h1>
        <Urdu className="mt-1 block text-lg text-muted-foreground">{sp.ur} — اسیسمنٹ فارم</Urdu>

        <Section title="1. Patient registration" ur="مریض کی رجسٹریشن">
          <Field label="Full name" ur="پورا نام" required><TextInput value={f.name} onChange={up("name")} maxLength={120} /></Field>
          <Field label="Age" ur="عمر" required><TextInput value={f.age} onChange={up("age")} inputMode="numeric" maxLength={10} /></Field>
          <Field label="Gender" ur="جنس"><Select value={f.gender} onChange={up("gender")} options={["Male", "Female", "Other"]} /></Field>
          <Field label="WhatsApp number" ur="واٹس ایپ نمبر" required><TextInput value={f.whatsapp} onChange={up("whatsapp")} inputMode="tel" placeholder="03001234567" maxLength={16} /></Field>
          <Field label="City" ur="شہر" required><TextInput value={f.city} onChange={up("city")} maxLength={80} /></Field>
          <Field label="Preferred consultation city" ur="مشورے کے لیے پسندیدہ شہر"><TextInput value={f.preferredCity} onChange={up("preferredCity")} maxLength={80} /></Field>
          <Field label="Attendant name" ur="اٹینڈنٹ کا نام"><TextInput value={f.attendantName} onChange={up("attendantName")} maxLength={120} /></Field>
          <Field label="Relationship with patient" ur="مریض سے رشتہ"><TextInput value={f.relationship} onChange={up("relationship")} maxLength={60} /></Field>
        </Section>

        <Section title="2. Main complaint & history" ur="بنیادی مسئلہ اور تاریخ">
          <Field label="Main problem" ur="بنیادی مسئلہ" required className="sm:col-span-2"><TextArea value={f.mainProblem} onChange={up("mainProblem")} maxLength={1000} /></Field>
          <Field label="Symptoms" ur="علامات" className="sm:col-span-2"><TextArea value={f.symptoms} onChange={up("symptoms")} maxLength={3000} /></Field>
          <Field label="Previous diagnosis" ur="پچھلی تشخیص"><TextInput value={f.previousDiagnosis} onChange={up("previousDiagnosis")} /></Field>
          <Field label="Previous doctor / clinic" ur="پچھلا ڈاکٹر / کلینک"><TextInput value={f.previousDoctor} onChange={up("previousDoctor")} /></Field>
          <Field label="Previous treatment" ur="پچھلا علاج" className="sm:col-span-2"><TextArea value={f.previousTreatment} onChange={up("previousTreatment")} /></Field>
          <Field label="Previous reports (describe)" ur="پچھلی رپورٹس" className="sm:col-span-2"><TextArea value={f.previousReports} onChange={up("previousReports")} /></Field>
          {COMMON_QUESTIONS.map((q) => (
            <Question key={q.key} q={q} value={extra[q.key] ?? ""} onChange={(v) => setExtra({ ...extra, [q.key]: v })} />
          ))}
        </Section>

        <Section title={`3. ${sp.short} specific questions`} ur="مخصوص سوالات">
          {SPECIALTY_QUESTIONS[key].map((q) => (
            <Question key={q.key} q={q} value={extra[q.key] ?? ""} onChange={(v) => setExtra({ ...extra, [q.key]: v })} />
          ))}
        </Section>

        <Section title="4. Upload reports / documents" ur="رپورٹس اپ لوڈ کریں">
          <div className="sm:col-span-2 space-y-3">
            <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-background p-4 text-sm font-medium">
              <Upload className="size-4" /> Add PDF / photo (max 5 files, 4 MB each) / فائل شامل کریں
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                multiple
                className="sr-only"
                onChange={(e) => {
                  const picked = Array.from(e.target.files ?? []);
                  const bad = picked.find((x) => x.size > 4 * 1024 * 1024);
                  if (bad) setError(`${bad.name} is larger than 4 MB / فائل بہت بڑی ہے`);
                  const ok = picked.filter((x) => x.size <= 4 * 1024 * 1024).map((file) => ({ file, category: "Medical Report" }));
                  setFiles((cur) => [...cur, ...ok].slice(0, 5));
                  e.target.value = "";
                }}
              />
            </label>
            {files.map((u, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3 text-sm">
                <span className="min-w-0 flex-1 truncate">{u.file.name}</span>
                <Select value={u.category} onChange={(e) => setFiles(files.map((x, j) => (j === i ? { ...x, category: e.target.value } : x)))} options={DOCUMENT_CATEGORIES} />
                <button type="button" aria-label="Remove file" onClick={() => setFiles(files.filter((_, j) => j !== i))}><X className="size-4" /></button>
              </div>
            ))}
          </div>
        </Section>

        <Section title="5. Preferences" ur="ترجیحات">
          <Field label="Priority / urgency" ur="ترجیح"><Select value={f.priority} onChange={up("priority")} options={["Normal", "Urgent", "Emergency"]} /></Field>
          <Field label="Preferred service" ur="پسندیدہ سروس"><Select value={f.servicePackage} onChange={up("servicePackage")} options={sp.packages.map((p) => p.key)} /></Field>
          <Field label="Budget preference" ur="بجٹ" className="sm:col-span-2"><TextInput value={f.budget} onChange={up("budget")} maxLength={80} placeholder="e.g. Under PKR 50,000" /></Field>
        </Section>

        <label className="mt-6 flex items-start gap-3 rounded-2xl border bg-card p-4 text-sm">
          <input type="checkbox" className="mt-0.5 size-4" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            I confirm the information is correct and agree that AL-ATASH FIT may store it privately to guide and coordinate my care. I understand this is not a diagnosis.
            <Urdu className="mt-1 block text-muted-foreground">میں تصدیق کرتا/کرتی ہوں کہ معلومات درست ہیں اور AL-ATASH FIT انہیں رہنمائی کے لیے محفوظ رکھ سکتا ہے۔ یہ تشخیص نہیں ہے۔</Urdu>
          </span>
        </label>
        {error && <p role="alert" className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={busy} className="mt-6 min-h-12 w-full text-base">
          {busy ? <Loader2 className="size-4 animate-spin" /> : null} Submit assessment / جمع کروائیں
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">{sp.disclaimerEn}</p>
      </form>
    </main>
  );
}

function Section({ title, ur, children }: { title: string; ur: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-2xl border bg-card p-5">
      <h2 className="font-display text-base font-extrabold text-brand-dark">{title}</h2>
      <Urdu className="block text-sm text-muted-foreground">{ur}</Urdu>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
