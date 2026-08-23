import { useMemo, useState } from "react";
import { Loader2, Sparkles, ShieldAlert, X, Download } from "lucide-react";
import { downloadDietPlanPdf } from "@/lib/diet-plan-pdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AI_DRAFT_BANNER_EN,
  AI_DRAFT_BANNER_UR,
  DIET_PLAN_STATUSES,
  DIET_PLAN_STATUS_UR,
  emptyDietPlan,
  type DietPlan,
  type DietPlanStatus,
} from "@/lib/diet-plans";

export interface EditorSubmission {
  recordId: string;
  submissionId: string;
  type: string;
  name: string;
  phone: string;
  city: string;
  age: string;
  bmi: string;
  packageLabel: string;
  packageDuration: string;
  paymentStatus: string;
  data: Record<string, string | string[] | boolean>;
}

function fmt(v: string | string[] | boolean | undefined) {
  if (v === undefined) return "";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return v;
}

/** Prefill the editor from the submitted assessment so nothing is retyped. */
export function prefillFromSubmission(sub: EditorSubmission, plan: DietPlan | undefined): DietPlan {
  const base = plan ?? emptyDietPlan(sub.recordId);
  return {
    ...base,
    submissionRecordId: sub.recordId,
    patientName: base.patientName || sub.name,
    planTitle: base.planTitle || `${sub.packageLabel || "Diet"} plan — ${sub.name || sub.submissionId}`,
    durationLabel: base.durationLabel || sub.packageDuration,
  };
}

export function DietPlanEditor({
  submission,
  plan,
  saving,
  error,
  message,
  onClose,
  onSave,
  aiBusy = false,
  onGenerate,
}: {
  submission: EditorSubmission;
  plan: DietPlan;
  saving: boolean;
  error: string;
  message: string;
  onClose: () => void;
  onSave: (plan: DietPlan) => void;
  aiBusy?: boolean;
  /** Generates or improves the AI first draft; resolves with the saved plan. */
  onGenerate?: (mode: "generate" | "improve", current: DietPlan) => Promise<DietPlan | null>;
}) {
  const [draft, setDraft] = useState<DietPlan>(() => prefillFromSubmission(submission, plan));
  const set = (patch: Partial<DietPlan>) => setDraft((p) => ({ ...p, ...patch }));

  const summary = useMemo(
    () =>
      [
        ["Submission ID", submission.submissionId],
        ["Assessment type", submission.type],
        ["Phone", submission.phone],
        ["City", submission.city],
        ["Age", submission.age],
        ["BMI", submission.bmi],
        ["Package", submission.packageLabel || "—"],
        ["Payment", submission.paymentStatus || "Pending"],
        ["Goal", fmt(submission.data["goal"]) || fmt(submission.data["target_weight"])],
        ["Medical conditions", fmt(submission.data["medical_conditions"])],
        ["Allergies", fmt(submission.data["allergies"]) || fmt(submission.data["food_allergies"])],
        ["Diet preference", fmt(submission.data["diet_preference"])],
      ].filter(([, v]) => v),
    [submission],
  );

  const hasAiDraft = Boolean(draft.aiGeneratedAt);

  async function runAi(mode: "generate" | "improve") {
    if (!onGenerate) return;
    if (mode === "generate" && hasAiDraft) {
      const ok = window.confirm(
        "Regenerating will replace the current AI draft. Any manual changes may be lost. Continue?",
      );
      if (!ok) return;
    }
    const saved = await onGenerate(mode, draft);
    if (saved) setDraft(saved);
  }

  const paymentVerified = submission.paymentStatus === "Verified";
  const canRelease = paymentVerified && (plan.status === "Consultant Approved" || plan.status === "Released");

  const field = (
    id: keyof DietPlan,
    label: string,
    labelUr: string,
    rows = 3,
    max = 2000,
  ) => (
    <div className="grid gap-1.5">
      <label htmlFor={String(id)} className="text-sm font-semibold">
        {label} <span className="font-normal text-muted-foreground">· {labelUr}</span>
      </label>
      <Textarea
        id={String(id)}
        rows={rows}
        maxLength={max}
        value={String(draft[id] ?? "")}
        onChange={(e) => set({ [id]: e.target.value } as Partial<DietPlan>)}
      />
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Diet plan for ${submission.submissionId}`}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="my-6 w-full max-w-3xl rounded-3xl border bg-card p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-extrabold text-brand-dark">Diet plan editor</h2>
            <p className="font-mono text-xs text-muted-foreground">{submission.submissionId}</p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <section className="mt-4 rounded-2xl border bg-secondary/30 p-4">
          <h3 className="text-sm font-bold text-brand-dark">From the submitted assessment</h3>
          <dl className="mt-2 grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-2">
            {summary.map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="font-semibold">{k}:</dt>
                <dd className="text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-4 rounded-2xl border border-brand/30 bg-brand/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-brand-dark">
                <Sparkles className="size-4" /> AI draft assistant
                <span className="font-normal text-muted-foreground">· AI معاون</span>
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Uses this patient&rsquo;s submitted assessment. Never released automatically — you review and edit
                first.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={aiBusy || !paymentVerified} onClick={() => void runAi("generate")}>
                {aiBusy && <Loader2 className="size-4 animate-spin" />}
                {hasAiDraft ? "Regenerate AI Draft · AI ڈرافٹ دوبارہ تیار کریں" : "Generate AI Draft · AI ڈائٹ پلان تیار کریں"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={aiBusy || !paymentVerified || !hasAiDraft}
                onClick={() => void runAi("improve")}
              >
                Improve Draft · ڈرافٹ بہتر کریں
              </Button>
            </div>
          </div>

          {!paymentVerified && (
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              AI drafting unlocks after the payment for this submission is verified.
            </p>
          )}

          {hasAiDraft && (
            <div className="mt-3 rounded-xl border border-amber-400/60 bg-amber-50 p-3 text-amber-900">
              <p className="text-sm font-bold">
                {AI_DRAFT_BANNER_EN} <span className="font-normal">· {AI_DRAFT_BANNER_UR}</span>
              </p>
              <p className="mt-1 text-xs">AI-generated draft — You can edit before approval.</p>
              <p className="mt-1 text-xs opacity-80">
                Generated {new Date(draft.aiGeneratedAt).toLocaleString()} · attempt {draft.aiGenerationCount}
              </p>
            </div>
          )}

          {draft.aiReviewRequired && (
            <div className="mt-3 flex gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-destructive">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="text-sm font-bold">Professional review required before release.</p>
                {draft.aiReviewFlags && <p className="mt-1 text-xs">{draft.aiReviewFlags}</p>}
              </div>
            </div>
          )}
        </section>

        <div className="mt-5 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label htmlFor="dp-name" className="text-sm font-semibold">
                Patient name <span className="font-normal text-muted-foreground">· مریض کا نام</span>
              </label>
              <Input id="dp-name" maxLength={120} value={draft.patientName} onChange={(e) => set({ patientName: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="dp-duration" className="text-sm font-semibold">
                Duration <span className="font-normal text-muted-foreground">· دورانیہ</span>
              </label>
              <Input id="dp-duration" maxLength={80} value={draft.durationLabel} onChange={(e) => set({ durationLabel: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="dp-title" className="text-sm font-semibold">
              Plan title <span className="font-normal text-muted-foreground">· پلان کا عنوان</span>
            </label>
            <Input id="dp-title" maxLength={160} value={draft.planTitle} onChange={(e) => set({ planTitle: e.target.value })} />
          </div>

          <h3 className="mt-1 font-display text-base font-bold text-brand-dark">
            Daily meal schedule <span className="text-sm font-normal text-muted-foreground">· روزانہ کھانے کا شیڈول</span>
          </h3>
          {field("breakfast", "Breakfast", "ناشتہ")}
          {field("midMorning", "Mid-morning snack", "دوپہر سے پہلے")}
          {field("lunch", "Lunch", "دوپہر کا کھانا")}
          {field("eveningSnack", "Evening snack", "شام کا ناشتہ")}
          {field("dinner", "Dinner", "رات کا کھانا")}

          <h3 className="mt-1 font-display text-base font-bold text-brand-dark">
            Guidance <span className="text-sm font-normal text-muted-foreground">· رہنمائی</span>
          </h3>
          {field("waterGuidance", "Water guidance", "پانی", 2, 1000)}
          {field("activityGuidance", "Activity guidance", "ورزش", 2, 1000)}
          {field("foodsPrefer", "Foods to prefer", "کھانے جو لیں")}
          {field("foodsLimit", "Foods to limit", "کھانے جو کم کریں")}
          {field("notes", "Notes", "نوٹس")}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label htmlFor="dp-consultant" className="text-sm font-semibold">
                Consultant name <span className="font-normal text-muted-foreground">· کنسلٹنٹ</span>
              </label>
              <Input
                id="dp-consultant"
                maxLength={120}
                value={draft.consultantName}
                onChange={(e) => set({ consultantName: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="dp-approval" className="text-sm font-semibold">
                Consultant approval note <span className="font-normal text-muted-foreground">· منظوری نوٹ</span>
              </label>
              <Input
                id="dp-approval"
                maxLength={1000}
                value={draft.consultantNote}
                onChange={(e) => set({ consultantNote: e.target.value })}
              />
            </div>
          </div>

          <div>
            <span className="text-sm font-semibold">Diet plan status</span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {DIET_PLAN_STATUSES.map((s) => {
                const blocked = s === "Released" && !canRelease;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={blocked}
                    onClick={() => set({ status: s as DietPlanStatus })}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      draft.status === s ? "border-brand bg-brand text-primary-foreground" : "hover:bg-secondary",
                      blocked && "cursor-not-allowed opacity-40",
                    )}
                  >
                    {s} · {DIET_PLAN_STATUS_UR[s]}
                  </button>
                );
              })}
            </div>
            {!canRelease && (
              <p className="mt-2 text-xs text-muted-foreground">
                Release is unlocked only after the payment is verified and the saved plan status is “Consultant
                Approved”.
              </p>
            )}
          </div>
        </div>

        {error && <p className="mt-4 text-sm font-medium text-destructive">{error}</p>}
        {message && <p className="mt-4 text-sm font-medium text-brand-dark">{message}</p>}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {(plan.status === "Consultant Approved" || plan.status === "Released") && (
            <Button
              variant="outline"
              onClick={() =>
                void downloadDietPlanPdf(plan, {
                  submissionId: submission.submissionId,
                  packageLabel: submission.packageLabel,
                })
              }
            >
              <Download className="size-4" /> Download PDF
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="outline"
            disabled={saving}
            onClick={() => onSave({ ...draft, status: draft.status === "Not Started" ? "Draft" : draft.status })}
          >
            Save draft
          </Button>
          <Button disabled={saving} onClick={() => onSave(draft)}>
            {saving && <Loader2 className="size-4 animate-spin" />} Save plan
          </Button>
        </div>
      </div>
    </div>
  );
}
