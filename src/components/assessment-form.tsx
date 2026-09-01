import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, AlertTriangle, ArrowLeft, Info } from "lucide-react";
import { Urdu, Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { PaymentStep } from "@/components/payment-step";
import { useServerFn } from "@tanstack/react-start";
import { submitAssessment } from "@/lib/assessment.functions";

import {
  getSections,
  calculateBmi,
  bmiCategory,
  TYPE_META,
  type AssessmentType,
  type FieldDef,
} from "@/lib/assessment-schema";

type Value = string | string[] | boolean;
type Values = Record<string, Value>;

const toneClass: Record<AssessmentType, string> = {
  child: "from-child to-gold",
  female: "from-female to-brand",
  male: "from-male to-brand",
};

function FieldLabel({ field, id }: { field: FieldDef; id: string }) {
  return (
    <label htmlFor={id} className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
      <span className="text-sm font-semibold text-foreground">
        {field.en}
        {field.unit ? <span className="text-muted-foreground"> ({field.unit})</span> : null}
        {field.required ? <span className="text-destructive"> *</span> : null}
      </span>
      <Urdu className="text-[13px] text-muted-foreground">{field.ur}</Urdu>
    </label>
  );
}

function FieldControl({
  field,
  value,
  onChange,
  invalid,
}: {
  field: FieldDef;
  value: Value | undefined;
  onChange: (v: Value) => void;
  invalid: boolean;
}) {
  const id = `f-${field.id}`;
  const invalidCls = invalid ? "border-destructive ring-1 ring-destructive/30" : "";

  if (field.type === "consent") {
    return (
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border bg-secondary/40 p-3.5",
          invalid && "border-destructive",
        )}
      >
        <Checkbox
          id={id}
          checked={value === true}
          onCheckedChange={(c) => onChange(c === true)}
          aria-required={field.required}
          className="mt-0.5"
        />
        <label htmlFor={id} className="cursor-pointer text-sm leading-relaxed">
          <span className="block font-medium">
            {field.en}
            {field.required ? <span className="text-destructive"> *</span> : null}
          </span>
          <Urdu className="mt-1 block text-[13px] text-muted-foreground">{field.ur}</Urdu>
        </label>
      </div>
    );
  }

  const control = (() => {
    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            id={id}
            rows={3}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={cn("bg-background", invalidCls)}
          />
        );
      case "select":
        return (
          <select
            id={id}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
              invalidCls,
            )}
          >
            <option value="">— Select / منتخب کریں —</option>
            {field.options?.map((op) => (
              <option key={op.en} value={op.en}>
                {op.en} — {op.ur}
              </option>
            ))}
          </select>
        );
      case "radio":
        return (
          <div className={cn("flex flex-wrap gap-2", invalid && "rounded-md ring-1 ring-destructive/40 p-1")}>
            {field.options?.map((op) => {
              const active = value === op.en;
              return (
                <button
                  type="button"
                  key={op.en}
                  onClick={() => onChange(op.en)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                    active
                      ? "border-brand bg-brand text-primary-foreground"
                      : "border-input bg-background hover:bg-secondary",
                  )}
                >
                  {op.en} <Urdu className="text-[12px] opacity-80">{op.ur}</Urdu>
                </button>
              );
            })}
          </div>
        );
      case "checkboxes": {
        const arr = Array.isArray(value) ? value : [];
        return (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {field.options?.map((op) => {
              const checked = arr.includes(op.en);
              const cid = `${id}-${op.en.replace(/\W+/g, "")}`;
              return (
                <div
                  key={op.en}
                  className="flex items-center gap-2.5 rounded-lg border border-input bg-background px-3 py-2"
                >
                  <Checkbox
                    id={cid}
                    checked={checked}
                    onCheckedChange={(c) =>
                      onChange(c === true ? [...arr, op.en] : arr.filter((x) => x !== op.en))
                    }
                  />
                  <label htmlFor={cid} className="flex-1 cursor-pointer text-sm">
                    {op.en} <Urdu className="text-[12px] text-muted-foreground">{op.ur}</Urdu>
                  </label>
                </div>
              );
            })}
          </div>
        );
      }
      default:
        return (
          <Input
            id={id}
            type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type}
            inputMode={field.type === "number" ? "decimal" : undefined}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            readOnly={field.id === "bmi"}
            className={cn("bg-background", field.id === "bmi" && "bg-secondary font-semibold", invalidCls)}
          />
        );
    }
  })();

  return (
    <div>
      <FieldLabel field={field} id={id} />
      {control}
      {invalid && <p className="mt-1 text-xs font-medium text-destructive">This field is required.</p>}
    </div>
  );
}

export function AssessmentForm({ type }: { type: AssessmentType }) {
  const sections = useMemo(() => getSections(type), [type]);
  const meta = TYPE_META[type];
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [serverError, setServerError] = useState("");
  const [result, setResult] = useState<{ submissionId: string; submittedAt: string } | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const set = (id: string, v: Value) => {
    setValues((prev) => ({ ...prev, [id]: v }));
    setErrors((prev) => prev.filter((e) => e !== id));
  };

  const weight = Number(values["weight_kg"]);
  const height = Number(values["height_cm"]);
  const bmi = calculateBmi(weight, height);

  useEffect(() => {
    const next = bmi ? String(bmi) : "";
    setValues((prev) => (prev["bmi"] === next ? prev : { ...prev, bmi: next }));
  }, [bmi]);

  const submit = useServerFn(submitAssessment);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const missing = sections
      .flatMap((s) => s.fields)
      .filter((f) => f.required)
      .filter((f) => {
        const v = values[f.id];
        if (f.type === "consent") return v !== true;
        return v === undefined || String(v).trim() === "";
      })
      .map((f) => f.id);
    setErrors(missing);
    setServerError("");
    if (missing.length > 0) {
      document.getElementById(`f-${missing[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setStatus("saving");
    try {
      const res = await submit({ data: { type, values } });
      if (!res.ok) {
        setServerError(res.error || "Could not save submission.");
        if ("missing" in res && res.missing) setErrors(res.missing);
        setStatus("idle");
      } else {
        setResult({ submissionId: res.submissionId, submittedAt: res.submittedAt });
        setStatus("done");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "done" && result) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto size-16 text-brand" aria-hidden />
        <h1 className="mt-5 font-display text-3xl font-extrabold text-brand-dark">Assessment submitted</h1>
        <Urdu className="mt-2 block text-base text-muted-foreground">آپ کا فارم کامیابی سے جمع ہو گیا ہے</Urdu>
        <div className="mt-6 rounded-2xl border bg-card p-6 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Your submission ID</p>
          <p className="mt-1 font-mono text-xl font-bold text-foreground">{result.submissionId}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Submitted on {new Date(result.submittedAt).toLocaleString()}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Please save this ID. Our team will contact you on the number you provided.
          </p>
        </div>
        <PaymentStep
          submissionId={result.submissionId}
          clientName={typeof values["full_name"] === "string" ? values["full_name"] : ""}
          clientPhone={typeof values["phone"] === "string" ? values["phone"] : ""}
        />
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/">Back to home</Link>
          </Button>
          <Button onClick={() => window.location.reload()}>New assessment</Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:px-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back
      </Link>

      <header
        className={cn(
          "mt-4 overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-primary-foreground shadow-lg sm:p-8",
          toneClass[type],
        )}
      >
        <Logo className="[&_span]:text-primary-foreground" />
        <h1 className="mt-5 font-display text-2xl font-extrabold sm:text-3xl">
          {meta.en} Weight Assessment Form
        </h1>
        <Urdu className="mt-1 block text-lg">{meta.ur} — وزن کا تفصیلی معائنہ فارم</Urdu>
        <p className="mt-3 max-w-xl text-sm opacity-90">
          Please fill every section carefully. Fields marked with * are required. Your information stays
          confidential.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
        {sections.map((section, i) => (
          <section key={section.id} className="overflow-hidden rounded-3xl border bg-card shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b bg-secondary/60 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <h2 className="font-display text-base font-bold text-brand-dark sm:text-lg">{section.en}</h2>
              </div>
              <Urdu className="text-sm text-brand-dark/80">{section.ur}</Urdu>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2">
              {section.fields.map((field) => (
                <div key={field.id} className={cn(field.full && "sm:col-span-2")}>
                  <FieldControl
                    field={field}
                    value={values[field.id]}
                    onChange={(v) => set(field.id, v)}
                    invalid={errors.includes(field.id)}
                  />
                </div>
              ))}

              {section.id === "measurements" && (
                <div className="sm:col-span-2 rounded-2xl border border-accent bg-accent/40 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-accent-foreground">
                    <Info className="size-4" aria-hidden /> BMI
                  </div>
                  <p className="mt-1 text-sm text-foreground">
                    {bmi
                      ? `Your BMI is ${bmi} — ${bmiCategory(bmi, type).en}`
                      : "Enter weight and height to calculate BMI automatically."}
                  </p>
                  {bmi && <Urdu className="block text-sm text-muted-foreground">{bmiCategory(bmi, type).ur}</Urdu>}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Disclaimer: BMI is an informational screening number only. It is not a diagnosis and does not
                    replace medical advice from a qualified professional.
                  </p>
                  <Urdu className="mt-1 block text-xs text-muted-foreground">
                    بی ایم آئی صرف معلوماتی ہے، یہ طبی تشخیص نہیں ہے۔
                  </Urdu>
                </div>
              )}
            </div>
          </section>
        ))}

        {(errors.length > 0 || serverError) && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>{serverError || `Please complete ${errors.length} required field(s) above.`}</p>
          </div>
        )}

        <div className="sticky bottom-4 rounded-2xl border bg-card/95 p-4 shadow-lg backdrop-blur">
          <Button type="submit" size="lg" className="w-full text-base" disabled={status === "saving"}>
            {status === "saving" ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Submitting…
              </>
            ) : (
              <>Submit Assessment — جمع کریں</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
